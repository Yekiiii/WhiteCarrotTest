import React, { useState } from "react";

interface CollapsiblePanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50/50 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{icon}</span>}
          <span className="font-semibold text-gray-700 text-[13px] tracking-tight">{title}</span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};
