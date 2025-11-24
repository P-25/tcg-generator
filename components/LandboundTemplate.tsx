"use client";
import React, { useRef, useState, useEffect } from "react";
import { CardData } from "@/types/card";

interface LandboundTemplateProps {
  data: CardData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  onImageAdjust?: (position: { x: number; y: number }, scale: number) => void;
}

export default function LandboundTemplate({
  data,
  cardRef,
  onImageAdjust,
}: LandboundTemplateProps) {
  // Local state for drag interaction (Duplicated from CardPreview for isolation)
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
        return "font-serif";
    }
  };

  return (
    <div
      ref={cardRef}
      className={`w-[320px] h-[480px] relative flex flex-col overflow-hidden select-none bg-black text-white rounded-2xl shadow-2xl border border-gray-800 ${getFontClass()}`}
      style={{
        backgroundColor: data.customColors?.background || "#000000",
        borderColor:
          data.customColors?.border ||
          (data.customColors?.background
            ? data.customColors.background
            : "#1f2937"),
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* --- MAIN IMAGE AREA (Full background effect) --- */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-move group"
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
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 text-sm p-4 text-center bg-gray-900">
            <span>Drag & Drop Image Here</span>
          </div>
        )}

        {/* Gradient Overlay for Text Readability (Bottom fade) */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent pointer-events-none z-10 h-full flex flex-col justify-end pb-4" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-20 flex flex-col justify-end h-full p-6 pointer-events-none">
        {/* Title */}
        <div className="mb-4 text-center">
          <h2
            className="text-3xl font-bold tracking-wide text-white drop-shadow-md font-serif"
            style={{ color: data.customColors?.title || "#ffffff" }}
          >
            {data.name || "Landbound"}
          </h2>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">
            ®
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 text-center">
          <p
            className="text-sm text-gray-300 leading-relaxed font-sans opacity-90"
            style={{ color: data.customColors?.description || "#d1d5db" }}
          >
            {data.description ||
              "A resilient group of adventurers who thrive in the rugged terrains of the world."}
          </p>
        </div>

        {/* Stats / Tags (Pills) */}
        <div className="flex flex-col gap-3 items-center w-full">
          {/* Row 1: Health & Attack as Tags */}
          <div className="flex gap-3 w-full justify-center">
            <div
              className="bg-[#2d1b36] text-[#d4a5ff] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 border border-[#4a2b5e] shadow-sm"
              style={{ color: data.customColors?.stats }}
            >
              <span>⚡</span>
              <span>{data.attack} Attack</span>
            </div>
            <div
              className="bg-[#1b1f36] text-[#a5b4ff] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 border border-[#2b345e] shadow-sm"
              style={{ color: data.customColors?.stats }}
            >
              <span>🛡️</span>
              <span>{data.health} Health</span>
            </div>
          </div>

          {/* Row 2: Extra Tag (Static for aesthetic match or derived) */}
          <div className="bg-[#1a2035] text-[#5e7ce2] px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-[#2a3655] shadow-sm">
            <span>✦ Special Ability</span>
          </div>
        </div>
      </div>

      {/* Border Overlay */}
      <div className="absolute inset-0 border-4 border-transparent rounded-2xl pointer-events-none z-30 mix-blend-overlay"></div>
    </div>
  );
}
