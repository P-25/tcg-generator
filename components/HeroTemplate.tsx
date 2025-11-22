"use client";
import React, { useRef, useState } from "react";
import { CardData } from "@/types/card";
import { Heart, Flame, Droplet } from 'lucide-react';

interface HeroTemplateProps {
  data: CardData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  onImageAdjust?: (position: { x: number; y: number }, scale: number) => void;
}

export default function HeroTemplate({ data, cardRef, onImageAdjust }: HeroTemplateProps) {
  // Local state for drag interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // --- Drag Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - data.imagePosition.x, y: e.clientY - data.imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !onImageAdjust) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onImageAdjust({ x: newX, y: newY }, data.imageScale);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!onImageAdjust) return;
    const zoomSensitivity = 0.1;
    const newScale = Math.max(0.5, Math.min(3, data.imageScale + (e.deltaY < 0 ? zoomSensitivity : -zoomSensitivity)));
    onImageAdjust(data.imagePosition, newScale);
  };

  // Custom Colors or Defaults
  // The user's design uses #38A169 (green) as the primary accent.
  // We will use that as the default, but allow overriding via customColors.stats
  const accentColor = data.customColors?.stats || '#38A169'; 
  const bgColor = data.customColors?.background || '#222'; // Dark background from user design
  const textColor = data.customColors?.description || '#e5e7eb'; // Light gray text
  const titleColor = data.customColors?.title || '#ffffff'; // White title

  // Helper to render hearts
  const renderHearts = (count: number) => {
    // Limit hearts to a reasonable number to avoid overflow, e.g., 5
    const displayCount = Math.min(Math.max(1, count), 5);
    return Array(displayCount).fill(0).map((_, i) => (
      <Heart key={i} className="w-3 h-3 text-red-500 fill-red-500 inline mx-0.5" />
    ));
  };

  return (
    <div 
        ref={cardRef} 
        className="w-[320px] h-[480px] relative flex flex-col overflow-hidden select-none rounded-xl shadow-2xl font-sans"
        style={{ backgroundColor: bgColor }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        {/* SVG Filter Definitions */}
        <svg className="absolute w-0 h-0" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
            <filter id="raggedFilter">
                <feTurbulence baseFrequency="0.08" numOctaves="4" type="fractalNoise" result="result1" />
                <feDisplacementMap in2="result1" scale="10" result="result2" xChannelSelector="R" in="SourceGraphic" />
            </filter>
            </defs>
        </svg>

        <div 
            className="relative h-[375px] w-full overflow-hidden bg-gray-800 cursor-move group"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
        >
            {data.image ? (
                <div 
                    style={{ 
                        transform: `translate(${data.imagePosition.x}px, ${data.imagePosition.y}px) scale(${data.imageScale})`,
                        transformOrigin: "center",
                        transition: isDragging ? "none" : "transform 0.1s ease-out"
                    }}
                    className="w-full h-full flex items-center justify-center"
                >
                    <img 
                        ref={imageRef}
                        src={data.image} 
                        alt="Card Art" 
                        className="max-w-none pointer-events-none"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-sm p-4 text-center">
                    <span>Drag & Drop Image Here</span>
                </div>
            )}
            
            {/* Overlay hint */}
            {data.image && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10">
                    <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                        Drag to Pan • Scroll to Zoom
                    </div>
                </div>
            )}
        </div>

        {/* 2. STRAIGHT GREEN SEPARATOR (The Border) */}
        {/* <div 
          className="absolute top-[240px] left-0 w-full h-4 z-21 pointer-events-none"
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" version="1.1">
                <rect fill={accentColor} filter="url(#raggedFilter)" width="100%" height="100%" x="0" y="0" />
            </svg>
        </div> */}

         <div
          className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
          data-test-id="middle-line"
        >
          <div
            className="absolute origin-top-left"
            style={{
              // Position the line based on the geometry of the clip-path
              top: '51%', // Starting point on the left edge
              left: '0%', 
              height: '3px',
              width: '120%', 
              transform: `rotate(17.65deg) scaleX(1.3)`,
              transformOrigin: '0% 0%',
              backgroundColor: '#38A169',
            }}
          />
        </div>

        <div
        data-test-id="card-info"
          className="absolute flex flex-col  p-4 text-white"
          style={{
            // Clip the info area (dark background) so it starts from the diagonal line
            // Points: Bottom Left (0% 30%), Bottom Right (100% 60%), Full Bottom (0% 100%, 100% 100%)
            clipPath: `polygon(0% 0%, 100% 43%, 100% 100%, 0% 100%)`,
            backgroundColor: 'red', // Solid dark background
            top: '51%', // Starting point on the left edge
            left: '0%', 
            height: '240px',
          }}
        >
          {/* Content Wrapper for spacing */}
          <div className='relative'>
            {/* Card Title and Stats Bar */}
            <div className="flex items-center space-x-2 text-sm mt-4">
              <span className="text-white uppercase font-bold tracking-wider">{"name"}</span>
              <span className="text-gray-400">
                {renderHearts(3)}
                <span className="text-gray-300 font-semibold ml-2">|</span>
                <span className="text-xs ml-2 uppercase">{"type"}</span>
              </span>
            </div>

            <div className="mt-4 flex flex-col space-y-3">
              
              {/* Ability Text */}
              <div className="flex items-start">
                <div className="flex flex-col space-y-4">
                  {/* Primary Icon Indicators (Flame, Droplet) */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 mt-1">
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
                    <Droplet className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-300 text-sm pl-4 leading-relaxed">
                  {"ability"}
                </p>
              </div>
              
              {/* Footer Copyright/Metadata */}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-700 mt-4">
                © 2025 Generated by Gemini | Model 102-HBY/XXXN764-103
              </div>
            </div>
          </div>
        </div>

        {/* 3. INFO FOOTER SECTION (BOTTOM) */}
        {/* <div className="relative z-20 p-4 pt-8 bg-gray-800 text-white rounded-b-xl flex-1"> */}

          {/* Card Title and Stats Bar */}
          {/* <div className="">
            <div>
              <span className="text-white uppercase font-bold tracking-wider" style={{ color: titleColor }}>
                  {data.name || "HERO NAME"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              
              <span className="text-gray-400 flex items-center">
                {renderHearts(data.health)}
                <span className="text-gray-300 font-semibold ml-2">|</span>
                <span className="text-xs ml-2 uppercase">HERO</span>
              </span>
            </div>
          </div> */}

          
            
            {/* Footer Copyright/Metadata */}
            {/* <div className="text-[8px] text-gray-500 pt-2 border-t border-gray-700 mt-2">
              © 2025 Generated by Gemini | Model 102-HBY/XXXN764-103
            </div> */}

        {/* </div> */}
    </div>
  );
}
