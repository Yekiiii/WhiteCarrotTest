import React, { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  // Blues
  "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF",
  // Purples
  "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6",
  // Greens
  "#10B981", "#059669", "#047857", "#065F46",
  // Reds
  "#EF4444", "#DC2626", "#B91C1C", "#991B1B",
  // Oranges
  "#F97316", "#EA580C", "#C2410C", "#9A3412",
  // Yellows
  "#F59E0B", "#D97706", "#B45309", "#92400E",
  // Pinks
  "#EC4899", "#DB2777", "#BE185D", "#9D174D",
  // Teals
  "#14B8A6", "#0D9488", "#0F766E", "#115E59",
  // Grays
  "#6B7280", "#4B5563", "#374151", "#1F2937",
  // Dark
  "#18181B", "#000000",
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  const handleHexBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(value);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      {/* Color Preview Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 border border-gray-100 rounded-lg hover:border-gray-200 transition-all bg-white hover:bg-gray-50/50 shadow-sm"
      >
        <div
          className="w-5 h-5 rounded-md border border-black/5 shadow-inner flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-xs text-gray-600 font-mono tracking-tighter">{value}</span>
        <svg
          className={`w-3 h-3 ml-auto text-gray-300 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Color Picker Panel */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Hex Input */}
          <div className="mb-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Hex Color</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                placeholder="#000000"
                className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-8 rounded-lg border border-gray-100 cursor-pointer p-0.5"
              />
            </div>
          </div>

          {/* Preset Swatches */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Presets</label>
            <div className="grid grid-cols-8 gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${
                    value === color ? "border-gray-900 ring-2 ring-offset-1 ring-blue-500" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
