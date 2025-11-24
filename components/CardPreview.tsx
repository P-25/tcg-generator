"use client";
import React, { useRef, useState, useEffect } from "react";
import { CardData } from "@/types/card";
import LandboundTemplate from "./LandboundTemplate";
import HeroTemplate from "./HeroTemplate";

interface CardPreviewProps {
  data: CardData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  onImageAdjust?: (position: { x: number; y: number }, scale: number) => void;
}

export default function CardPreview({
  data,
  cardRef,
  onImageAdjust,
}: CardPreviewProps) {
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
        return "font-[family-name:var(--font-outfit)]";
    }
  };

  const fontClass = getFontClass();

  // 1. Ethereal: Zen/Soft (Pink/Beige)
  const etherealContainer = `bg-[#e8dcd8] text-[#8e5e5e] border border-[#bcaaa4] rounded-2xl shadow-lg ${fontClass} relative`;
  const etherealHeader = `bg-transparent border-none text-[#8e5e5e] tracking-[0.2em] uppercase text-sm`;
  const etherealStats = `bg-transparent text-[#8e5e5e]`;

  const getStyles = () => {
    switch (data.template) {
      default:
        return {
          container: etherealContainer,
          header: etherealHeader,
          stats: etherealStats,
        };
    }
  };

  const styles = getStyles();

  if (data.template === "landbound") {
    return (
      <LandboundTemplate
        data={data}
        cardRef={cardRef}
        onImageAdjust={onImageAdjust}
      />
    );
  }

  if (data.template === "hero") {
    return (
      <HeroTemplate
        data={data}
        cardRef={cardRef}
        onImageAdjust={onImageAdjust}
      />
    );
  }

  console.log(`Debug - data.customColors`, data.customColors);

  return (
    <div
      ref={cardRef}
      className={`w-[320px] h-[480px] relative flex flex-col overflow-hidden select-none ${styles.container}`}
      style={{
        backgroundColor: data.customColors?.background,
        color: data.customColors?.description,
        borderColor: data.customColors?.border,
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Inner Border Decoration (Shared by both) */}
      <div
        className={`absolute inset-3 border rounded-lg pointer-events-none z-10 flex flex-col justify-between`}
        style={{
          borderColor: data.customColors?.border
            ? `${data.customColors.border}4D`
            : "#8e5e5e4D",
        }} // 4D is approx 30% opacity
      >
        {/* Corner Decorations */}
        <div className="flex justify-between p-1">
          <div
            className={`w-3 h-3 border-t border-l rounded-tl-full`}
            style={{ borderColor: data.customColors?.border || "#8e5e5e" }}
          ></div>
          <div
            className={`w-3 h-3 border-t border-r rounded-tr-full`}
            style={{ borderColor: data.customColors?.border || "#8e5e5e" }}
          ></div>
        </div>
        <div className="flex justify-between p-1">
          <div
            className={`w-3 h-3 border-b border-l rounded-bl-full`}
            style={{ borderColor: data.customColors?.border || "#8e5e5e" }}
          ></div>
          <div
            className={`w-3 h-3 border-b border-r rounded-br-full`}
            style={{ borderColor: data.customColors?.border || "#8e5e5e" }}
          ></div>
        </div>
      </div>

      {/* --- HEADER --- */}
      <div
        className={`p-4 flex justify-between items-center z-20 relative ${styles.header}`}
      >
        <h2
          className="truncate mr-2 text-center w-full text-xs font-normal order-2"
          style={{ color: data.customColors?.title }}
        >
          {data.name || "Presence"}
        </h2>
      </div>

      {/* --- MAIN IMAGE AREA --- */}
      <div
        ref={containerRef}
        className="relative grow overflow-hidden bg-transparent cursor-move group px-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div className="relative w-full h-full overflow-hidden">
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
                className="max-w-none pointer-events-none" // pointer-events-none prevents default image drag
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-sm p-4 text-center">
              <span>Drag & Drop Image Here</span>
              <span className="text-xs opacity-60 mt-1">
                (or use upload button)
              </span>
            </div>
          )}

          {/* Overlay hint for dragging */}
          {data.image && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10">
              <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                Drag to Pan • Scroll to Zoom
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DESCRIPTION BODY --- */}
      <div
        className={`p-4 relative min-h-[100px] bg-opacity-90 backdrop-blur-sm text-center italic text-xs`}
      >
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: data.customColors?.description }}
        >
          {data.description || "Card ability description goes here..."}
        </p>
      </div>

      {/* --- FOOTER (Attack/Stats) --- */}
      <div
        className={`p-4 flex justify-between items-center z-20 relative ${styles.stats}`}
      >
        <div
          className="relative w-full h-full overflow-hidden border-t p-2"
          style={{
            borderColor: data.customColors?.border
              ? `${data.customColors.border}4D`
              : "#bcaaa44D",
          }}
        >
          <div
            className="w-full flex justify-center items-center gap-4 opacity-60 text-xs"
            style={{ color: data.customColors?.stats }}
          >
            <span>•</span>
            <span>{data.health} HP</span>
            <span>•</span>
            <span>{data.attack} ATK</span>
            <span>•</span>
          </div>
        </div>
      </div>
    </div>
  );
}
