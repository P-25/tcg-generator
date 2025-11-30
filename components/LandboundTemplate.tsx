"use client";
import React, { useRef, useState, useEffect } from "react";
import { CardData } from "@/types/card";
import Image from "next/image";

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
      case "quicksand":
        return "font-[family-name:var(--font-quicksand)]";
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
      className={`w-[320px] h-[480px] relative flex flex-col justify-end overflow-hidden select-none bg-black text-white rounded-2xl shadow-2xl border border-gray-800 ${getFontClass()}`}
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
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 text-sm p-4 text-center bg-gray-600">
            <span>Drag & Drop Image Here</span>
          </div>
        )}
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-20 flex flex-col justify-end h-[50%] p-6 pointer-events-none bg-linear-to-t from-black via-black-20 to-transparent">
        {/* Gradient Overlay for Text Readability (Bottom fade) */}

        {/* Title */}
        <div className="mb-4 text-center">
          <h2
            className="text-3xl font-bold tracking-wide text-white drop-shadow-md"
            style={{ color: data.customColors?.title || "#ffffff" }}
          >
            {data.name}
          </h2>
          <div
            className="text-[10px] uppercase tracking-[0.2em] opacity-80"
            style={{ color: data.customColors?.title || "#ffffff" }}
          >
            {data.rarity}
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 text-center">
          <p
            className="text-sm text-gray-300 leading-relaxed opacity-90"
            style={{ color: data.customColors?.description || "#d1d5db" }}
          >
            {data.description ||
              "A resilient group of adventurers who thrive in the rugged terrains of the world."}
          </p>
        </div>

        {data.symbol && (
          <div
            className="absolute bottom-2.5 right-3 flex justify-center items-center rounded-full bg-transparent border"
            style={{
              borderColor: data.customColors?.border
                ? `${data.customColors.border}4D`
                : "#bcaaa44D",
            }}
          >
            <Image
              src={data.symbol || ""}
              alt="Symbol"
              width={20}
              height={20}
            />
          </div>
        )}
        {/* Stats */}
        <div className="flex flex-col gap-3 items-center w-full">
          <div
            id="stats"
            className={`flex justify-center items-center gap-4 opacity-60 text-xs min-h-[16px] transition-opacity duration-200 ${
              data.hideStats ? "opacity-0 invisible" : "opacity-60 visible"
            }`}
            style={{ color: data.customColors?.stats }}
          >
            <span>•</span>
            <span>{data.health} HP</span>
            <span>•</span>
            <span>{data.attack} ATK</span>
            <span>•</span>
          </div>
        </div>
        {/* <div className="absolute inset-0 bg-linear-to-t from-black via-black-20 to-transparent pointer-events-none z-10 h-[50%] bottom-1" /> */}
      </div>

      {/* Border Overlay */}
      <div className="absolute inset-0 border-4 border-transparent rounded-2xl pointer-events-none z-30 mix-blend-overlay"></div>
    </div>
  );
}
