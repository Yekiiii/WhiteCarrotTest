import React from "react";

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    fontFamily: string;
    borderRadius: string;
  };
  styles: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    headingFont: string;
    borderRadius: string;
    spacing: string;
    buttonStyle: string;
  };
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary",
    preview: {
      primary: "#3B82F6",
      secondary: "#1E40AF",
      accent: "#10B981",
      fontFamily: "Inter",
      borderRadius: "0.5rem",
    },
    styles: {
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
      accentColor: "#10B981",
      fontFamily: "Inter, system-ui, sans-serif",
      headingFont: "Inter, system-ui, sans-serif",
      borderRadius: "0.5rem",
      spacing: "normal",
      buttonStyle: "rounded",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
    preview: {
      primary: "#18181B",
      secondary: "#3F3F46",
      accent: "#71717A",
      fontFamily: "System",
      borderRadius: "0.25rem",
    },
    styles: {
      primaryColor: "#18181B",
      secondaryColor: "#3F3F46",
      accentColor: "#71717A",
      fontFamily: "system-ui, -apple-system, sans-serif",
      headingFont: "system-ui, -apple-system, sans-serif",
      borderRadius: "0.25rem",
      spacing: "relaxed",
      buttonStyle: "minimal",
    },
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold and energetic",
    preview: {
      primary: "#7C3AED",
      secondary: "#EC4899",
      accent: "#F59E0B",
      fontFamily: "Poppins",
      borderRadius: "1rem",
    },
    styles: {
      primaryColor: "#7C3AED",
      secondaryColor: "#EC4899",
      accentColor: "#F59E0B",
      fontFamily: "Poppins, sans-serif",
      headingFont: "Poppins, sans-serif",
      borderRadius: "1rem",
      spacing: "normal",
      buttonStyle: "pill",
    },
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional and trustworthy",
    preview: {
      primary: "#1E40AF",
      secondary: "#1E3A8A",
      accent: "#0F766E",
      fontFamily: "Source Sans",
      borderRadius: "0.375rem",
    },
    styles: {
      primaryColor: "#1E40AF",
      secondaryColor: "#1E3A8A",
      accentColor: "#0F766E",
      fontFamily: "Source Sans Pro, sans-serif",
      headingFont: "Source Sans Pro, sans-serif",
      borderRadius: "0.375rem",
      spacing: "compact",
      buttonStyle: "rounded",
    },
  },
  {
    id: "startup",
    name: "Startup",
    description: "Fresh and innovative",
    preview: {
      primary: "#059669",
      secondary: "#0D9488",
      accent: "#6366F1",
      fontFamily: "DM Sans",
      borderRadius: "0.75rem",
    },
    styles: {
      primaryColor: "#059669",
      secondaryColor: "#0D9488",
      accentColor: "#6366F1",
      fontFamily: "DM Sans, sans-serif",
      headingFont: "DM Sans, sans-serif",
      borderRadius: "0.75rem",
      spacing: "normal",
      buttonStyle: "rounded",
    },
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Elegant and sophisticated",
    preview: {
      primary: "#78350F",
      secondary: "#92400E",
      accent: "#B45309",
      fontFamily: "Playfair",
      borderRadius: "0",
    },
    styles: {
      primaryColor: "#78350F",
      secondaryColor: "#92400E",
      accentColor: "#B45309",
      fontFamily: "Georgia, serif",
      headingFont: "Playfair Display, serif",
      borderRadius: "0",
      spacing: "relaxed",
      buttonStyle: "sharp",
    },
  },
];

interface StylePresetsProps {
  currentPreset?: string;
  onApplyPreset: (preset: StylePreset) => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({
  currentPreset,
  onApplyPreset,
}) => {
  return (
    <div className="space-y-2">
      {STYLE_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onApplyPreset(preset)}
          className={`w-full p-3 rounded-xl border transition-all duration-300 text-left hover:shadow-sm ${
            currentPreset === preset.id
              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10"
              : "border-gray-100 hover:border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-[13px] text-gray-900 tracking-tight">{preset.name}</span>
            {currentPreset === preset.id && (
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
          </div>
          <p className="text-[11px] text-gray-400 mb-3 leading-tight font-medium">{preset.description}</p>
          
          {/* Preview swatches */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
              style={{ backgroundColor: preset.preview.primary }}
            />
            <div
              className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
              style={{ backgroundColor: preset.preview.secondary }}
            />
            <div
              className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
              style={{ backgroundColor: preset.preview.accent }}
            />
            <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{preset.preview.fontFamily}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
