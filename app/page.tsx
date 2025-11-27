"use client";
import { useState, useRef } from "react";
import CardPreview from "@/components/CardPreview";
import { toPng } from "html-to-image";
import { CardData } from "@/types/card";

export default function Home() {
  const cardRef = useRef<HTMLDivElement>(null);

  // State for card data
  const [cardData, setCardData] = useState<CardData>({
    name: "Dragon Slayer",
    health: 20,
    attack: 10,
    description: "When this card enters the field, destroy all enemy traps.",
    image: null,
    imagePosition: { x: 0, y: 0 },
    imageScale: 1,
    symbol: null,
    template: "ethereal",
    rarity: "Common",
    font: "quicksand",
    hideStats: false,
    customColors: {
      background: "",
      title: "",
      description: "",
      stats: "",
    },
  });

  // Handle Text Inputs
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Color Changes
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => {
      const newColors = {
        ...prev.customColors,
        [name]: value,
      };

      // If changing "description" (mapped to Text Color picker), update all text fields
      if (name === "description") {
        newColors.title = value;
        newColors.stats = value;
      }

      return {
        ...prev,
        customColors: newColors,
      };
    });
  };

  // Handle Image Uploads
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "symbol"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData((prev) => ({
          ...prev,
          [field]: reader.result as string,
          // Reset position/scale on new image load
          ...(field === "image"
            ? { imagePosition: { x: 0, y: 0 }, imageScale: 1 }
            : {}),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Image Adjust (Drag/Zoom)
  const handleImageAdjust = (
    position: { x: number; y: number },
    scale: number
  ) => {
    setCardData((prev) => ({
      ...prev,
      imagePosition: position,
      imageScale: scale,
    }));
  };

  // Handle Template Selection
  const handleTemplateSelect = (template: CardData["template"]) => {
    setCardData((prev) => ({ ...prev, template }));
  };

  // Function to Download Card
  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.download = `${cardData.name.replace(/\s+/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to download card:", err);
        alert("Failed to generate image. Please try again.");
      }
    }
  };

  // Template Options for Thumbnail Selector
  const templates: { id: CardData["template"]; name: string; color: string }[] =
    [
      {
        id: "ethereal",
        name: "Ethereal",
        color: "bg-[#e8dcd8] border-[#bcaaa4]",
      },
      { id: "hero", name: "Hero", color: "bg-gray-800 border-green-500" },
      { id: "landbound", name: "Landbound", color: "bg-black border-gray-800" },
    ];

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center font-sans text-gray-900">
      <h1 className="text-4xl font-extrabold mb-10 text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
        TCG Card Generator
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* --- LEFT COLUMN: CONTROLS (Span 4) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            {/* Template Selector (Thumbnails) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Template
              </label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`
                      relative h-20 rounded-lg border-2 transition-all duration-200 overflow-hidden flex flex-col items-center justify-center gap-1 cursor-pointer
                      ${
                        cardData.template === t.id
                          ? "ring-2 ring-blue-500 ring-offset-2 border-transparent scale-105 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }
                      ${t.color}
                    `}
                  >
                    {/* Mini representation */}
                    <div
                      className={`w-full h-2 ${
                        t.id === "mystic" ? "bg-[#7aa2f7]" : "bg-[#8e5e5e]"
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${
                        t.id === "mystic" || t.id === "hero"
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Card Details: Rarity & Font */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Card Details
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Rarity
                  </label>
                  <select
                    name="rarity"
                    value={cardData.rarity}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Resource">Resource</option>
                    <option value="Item">Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Font
                  </label>
                  <select
                    name="font"
                    value={cardData.font}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="quicksand">Quicksand (Default)</option>
                    <option value="inter">Inter</option>
                    <option value="cinzel">Cinzel</option>
                    <option value="playfair">Playfair Display</option>
                    <option value="press-start">Arcade</option>
                    <option value="vt323">Pixel</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Card Color
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    type="color"
                    name="background"
                    value={cardData.customColors?.background || "#ffffff"}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {cardData.customColors?.background || "Default"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    type="color"
                    name="description"
                    value={cardData.customColors?.description || "#000000"}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {cardData.customColors?.description || "Default"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Border Color
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    type="color"
                    name="border"
                    value={cardData.customColors?.border || "#bcaaa4"}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {cardData.customColors?.border || "Default"}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Card Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={cardData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter card name..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideStats"
                  checked={cardData.hideStats || false}
                  onChange={(e) =>
                    setCardData((prev) => ({
                      ...prev,
                      hideStats: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="hideStats"
                  className="text-sm font-medium text-gray-700 select-none cursor-pointer"
                >
                  Hide Stats
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Health
                  </label>
                  <input
                    type="number"
                    name="health"
                    value={cardData.health}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Attack
                  </label>
                  <input
                    type="number"
                    name="attack"
                    value={cardData.attack}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={cardData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Card ability..."
              />
            </div>

            {/* Uploads */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Main Art
                </label>
                <label
                  className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed ${
                    cardData.image
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  } rounded-lg cursor-pointer transition-colors overflow-hidden relative group`}
                >
                  {cardData.image ? (
                    <>
                      <img
                        src={cardData.image}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-medium text-blue-600 text-xs">
                        Change Image
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-6 h-6 text-gray-400 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <p className="text-[10px] text-gray-500">Upload Image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "image")}
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Symbol Icon
                </label>
                <label
                  className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed ${
                    cardData.symbol
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  } rounded-lg cursor-pointer transition-colors overflow-hidden relative group`}
                >
                  {cardData.symbol ? (
                    <>
                      <img
                        src={cardData.symbol}
                        alt="Preview"
                        className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-medium text-blue-600 text-xs">
                        Change Icon
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-6 h-6 text-gray-400 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        ></path>
                      </svg>
                      <p className="text-[10px] text-gray-500">Upload Icon</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "symbol")}
                  />
                </label>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadCard}
              className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Download High-Res Card
            </button>
          </div>
        </div>

        {/* --- RIGHT COLUMN: PREVIEW (Span 8) --- */}
        <div className="lg:col-span-8 flex flex-col items-center justify-start pt-8 bg-gray-200/50 rounded-3xl border border-gray-200/60 min-h-[600px]">
          <div className="mb-6 flex items-center gap-2 text-gray-500 text-sm uppercase tracking-wide font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Preview
          </div>

          <div className="scale-110 transform transition-transform duration-500">
            <CardPreview
              data={cardData}
              cardRef={cardRef}
              onImageAdjust={handleImageAdjust}
            />
          </div>

          <div className="mt-12 max-w-md text-center space-y-2">
            <p className="text-sm text-gray-500 font-medium">
              💡 Pro Tip: Drag the image to position it perfectly. Scroll to
              zoom in/out.
            </p>
            <p className="text-xs text-gray-400">
              Generated images are high-resolution PNGs suitable for printing or
              digital use.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
