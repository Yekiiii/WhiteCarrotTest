import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Section } from "../../types";

// Human-readable labels and descriptions for each section type
const SECTION_META: Record<Section["type"], { title: string; description: string }> = {
  hero: {
    title: "Hero",
    description: "Main banner and introduction",
  },
  text: {
    title: "Text Block",
    description: "Rich text content section",
  },
  gallery: {
    title: "Gallery",
    description: "Image gallery or team photos",
  },
  video: {
    title: "Video",
    description: "Embedded video content",
  },
  jobs: {
    title: "Open Positions",
    description: "List of current job openings",
  },
  cta: {
    title: "Call to Action",
    description: "Button with call to action",
  },
  custom: {
    title: "Custom",
    description: "Custom HTML content",
  },
};

interface DraggableSectionCardProps {
  section: Section;
  onToggle: (id: string) => void;
}

export const DraggableSectionCard: React.FC<DraggableSectionCardProps> = ({
  section,
  onToggle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: !section.enabled, // Disabled sections can't be dragged
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Elevate card while dragging
    zIndex: isDragging ? 50 : "auto",
  };

  const meta = SECTION_META[section.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 bg-white border rounded-lg
        transition-shadow duration-150
        ${isDragging ? "shadow-lg ring-2 ring-blue-400" : "shadow-sm"}
        ${!section.enabled ? "opacity-50 bg-gray-50" : "hover:shadow-md"}
      `}
    >
      {/* Drag Handle - only interactive when enabled */}
      <button
        type="button"
        className={`
          flex-shrink-0 p-1 rounded text-gray-400
          ${section.enabled ? "cursor-grab hover:text-gray-600 hover:bg-gray-100 active:cursor-grabbing" : "cursor-not-allowed"}
        `}
        {...(section.enabled ? { ...attributes, ...listeners } : {})}
        aria-label="Drag to reorder"
        tabIndex={section.enabled ? 0 : -1}
      >
        {/* Hamburger/Grip icon (≡) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Section Info */}
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{meta.title}</h3>
        <p className="text-sm text-gray-500 truncate">{meta.description}</p>
      </div>

      {/* Toggle Switch */}
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={section.enabled}
          onChange={() => onToggle(section.id)}
          className="sr-only peer"
          aria-label={`Toggle ${meta.title} section`}
        />
        <div
          className={`
            w-11 h-6 rounded-full peer
            peer-focus:ring-2 peer-focus:ring-blue-300
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:border after:border-gray-300 after:rounded-full
            after:h-5 after:w-5 after:transition-all
            ${section.enabled 
              ? "bg-blue-600 after:translate-x-5 after:border-white" 
              : "bg-gray-200"
            }
          `}
        />
      </label>
    </div>
  );
};
