"use client";
import React, { useRef, useState, useEffect } from "react";
import { CardData } from "@/types/card";
import { Heart, Flame, Droplet } from "lucide-react";

interface HeroTemplateProps {
  data: CardData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  onImageAdjust?: (position: { x: number; y: number }, scale: number) => void;
}

export default function HeroTemplate({
  data,
  cardRef,
  onImageAdjust,
}: HeroTemplateProps) {
  // Local state for drag interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // --- Drag Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - data.imagePosition.x,
      y: e.clientY - data.imagePosition.y,
    });
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onImageAdjust) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomSensitivity = 0.1;
      const newScale = Math.max(
        0.5,
        Math.min(
          3,
          data.imageScale + (e.deltaY < 0 ? zoomSensitivity : -zoomSensitivity)
        )
      );
      onImageAdjust(data.imagePosition, newScale);
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [data.imageScale, data.imagePosition, onImageAdjust]);

  // Custom Colors or Defaults
  // The user's design uses #38A169 (green) as the primary accent.
  // We will use that as the default, but allow overriding via customColors.stats
  const accentColor = data.customColors?.stats || "#38A169";
  const bgColor = data.customColors?.background || "#222"; // Dark background from user design
  const textColor = data.customColors?.description || "#e5e7eb"; // Light gray text
  const titleColor = data.customColors?.title || "#ffffff"; // White title

  // Font mapping
  const getFontClass = () => {
    switch (data.font) {
      case "cinzel":
        return "font-[family-name:var(--font-cinzel)]";
      case "playfair":
        return "font-[family-name:var(--font-playfair)]";
      case "press-start":
        return "font-[family-name:var(--font-press-start)]";
      case "vt323":
        return "font-[family-name:var(--font-vt323)]";
      default:
        return "font-sans";
    }
  };

  return (
    <div
      ref={cardRef}
      className={`w-[320px] h-[480px] relative flex flex-col overflow-hidden select-none rounded-xl shadow-2xl ${getFontClass()}`}
      style={{ backgroundColor: bgColor }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG Filter Definitions */}
      <svg
        className="absolute w-0 h-0"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="raggedFilter">
            <feTurbulence
              baseFrequency="0.08"
              numOctaves="4"
              type="fractalNoise"
              result="result1"
            />
            <feDisplacementMap
              in2="result1"
              scale="10"
              result="result2"
              xChannelSelector="R"
              in="SourceGraphic"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="relative h-[375px] w-full overflow-hidden bg-gray-800 cursor-move group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {data.image ? (
          <div
            style={{
              transform: `translate(${data.imagePosition.x}px, ${data.imagePosition.y}px) scale(${data.imageScale})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
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

      <div
        className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
        data-test-id="middle-line"
      >
        <div
          className="absolute origin-top-left"
          id="separator"
          style={{
            top: "54%",
            left: "0%",
            width: "100%",
            transform: `rotate(15.2deg) scaleX(1.3)`,
            transformOrigin: "0% 0%",
          }}
        >
          <svg
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#222"
              d="M 0 66.73361960633042 L 15.625 68.80646341498792 L 31.25 65.4432352083176 L 46.875 64.17869887852319 L 62.5 73.25406249742397 L 78.125 78.97539394984597 L 93.75 74.32816510786043 L 109.375 67.01442081948984 L 125 65.2499836656576 L 140.625 67.36351866161122 L 156.25 56.93523697107746 L 171.875 57.00906062086846 L 187.5 64.73165449797341 L 203.125 61.003892388640345 L 218.75 68.01751201537319 L 234.375 65.55864710766127 L 250 69.30210288806677 L 265.625 71.50217216019041 L 281.25 69.51611959899584 L 296.875 69.57081294206131 L 312.5 70.03922639646223 L 328.125 70.4634356823853 L 343.75 77.29561193033547 L 359.375 74.09137400171112 L 375 81.2248044132722 L 390.625 85.29746388110476 L 406.25 80.96274980779617 L 421.875 72.18931499002649 L 437.5 74.2904712262027 L 453.125 66.99229307312957 L 468.75 65.10123820011817 L 484.375 61.173751112331274 L 500 69.98584413430315 L 515.625 66.94260553326701 L 531.25 57.235599626167755 L 546.875 58.15990464267744 L 562.5 54.59202087313384 L 578.125 51.75729954901459 L 593.75 51.88876873060846 L 609.375 60.73238062063732 L 625 58.40700454961774 L 640.625 60.202421078835684 L 656.25 67.16996334776685 L 671.875 66.70702812546264 L 687.5 63.02209838290035 L 703.125 60.003926215735305 L 718.75 55.279456360156786 L 734.375 58.50337491582807 L 750 61.305791765446756 L 765.625 71.97581590873811 L 781.25 70.89385286371369 L 796.875 76.09047756268335 L 812.5 72.60386590825067 L 828.125 73.82597222162597 L 843.75 68.95326723687148 L 859.375 70.90662769652774 L 875 75.23955681414475 L 890.625 76.00149693662891 L 906.25 64.38091227089093 L 921.875 69.2583689952219 L 937.5 67.30876144713167 L 953.125 63.80378211288951 L 968.75 71.15236161320576 L 984.375 72.78675513120392 L 1000 69.60217838978787 L 1000 100 L 0 100 Z"
            ></path>
          </svg>
        </div>
      </div>

      <div
        data-test-id="card-info"
        className="absolute flex flex-col justify-between p-4 text-white w-full"
        style={{
          clipPath: `polygon(0% 0%, 100% 45%, 100% 100%, 0% 100%)`,
          backgroundColor: "#222",
          top: "60%",
          left: "0%",
          height: "196px",
        }}
      >
        <div
          className="flex flex-col justify-center items-start space-x-2 text-sm w-full"
          style={{
            transform: `rotate(15.2deg) scaleX(1)`,
            transformOrigin: "0% 0%",
          }}
        >
          <span className="text-white uppercase font-bold tracking-wider">
            {data.name}
          </span>
          <div className="flex gap-4">
            {/* Strength */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-yellow-400"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>1500</span>
            </div>

            {/* Health */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-red-500"
              >
                <path d="M14.5 4.5a2.121 2.121 0 0 1 3 3L7.5 17.5 2 22l4.5-5.5L14.5 4.5z" />
                <path d="M11.5 13.5L16 18" />
                <path d="M20 4l-4 4" />
              </svg>
              <span>2400</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center text-xs w-full mt-3">
          <span className="text-white uppercase font-normal">
            {"Move name"}
          </span>
          <span className="text-white uppercase font-normal">
            {"Special Ability"}
          </span>
        </div>

        {/* <div className="flex items-center space-x-2 text-sm w-full">
          <span className="text-white uppercase font-normal">
            {data.rarity}
          </span>
        </div> */}
      </div>

      {/* <span className="text-xs ml-2 uppercase">{data.rarity}</span> */}
    </div>
  );
}
