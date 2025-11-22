export type CardData = {
  name: string;
  health: number;
  attack: number;
  description: string;
  image: string | null; // The main art
  imagePosition: { x: number; y: number }; // Offset for the image
  imageScale: number; // Zoom level
  symbol: string | null; // The element/class icon
  template: 'ethereal' | 'mystic' | 'landbound' | 'hero'; // Predefined styles
  customColors?: {
    background?: string;
    title?: string;
    description?: string;
    stats?: string;
  };
};