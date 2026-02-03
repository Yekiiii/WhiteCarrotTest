import React, { useState } from "react";
import { type Company, type Section, type Theme, type SectionTheme } from "../../types";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ColorPicker } from "./ColorPicker";
import { StylePresets, type StylePreset } from "./StylePresets";
import api from "../../lib/axios";

interface EditorSidebarProps {
  company: Company;
  saving: boolean;
  onThemeChange: (field: string, value: string) => void;
  onThemeBatchUpdate: (updates: Partial<Theme>) => void;
  onContentChange: (field: string, value: string) => void;
  onSectionsChange: (sections: Section[]) => void;
  onSave: () => void;
}

// SVG Icon Components
const Icons = {
  home: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  text: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  gallery: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  rocket: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  code: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  eye: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  eyeOff: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  chevronUp: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  upload: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "System Default", value: "system-ui, -apple-system, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "DM Sans", value: "DM Sans, sans-serif" },
  { label: "Source Sans Pro", value: "Source Sans Pro, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Playfair Display", value: "Playfair Display, serif" },
  { label: "Georgia", value: "Georgia, serif" },
];

const FONT_SIZE_OPTIONS = [
  { label: "Small (14px)", value: "14px" },
  { label: "Normal (16px)", value: "16px" },
  { label: "Large (18px)", value: "18px" },
  { label: "Extra Large (20px)", value: "20px" },
];

const BORDER_RADIUS_OPTIONS = [
  { label: "None", value: "0" },
  { label: "Subtle", value: "0.25rem" },
  { label: "Rounded", value: "0.5rem" },
  { label: "More Rounded", value: "0.75rem" },
  { label: "Pill", value: "1rem" },
  { label: "Full", value: "9999px" },
];

const SECTION_TYPE_CONFIG = {
  hero: { label: "Hero Banner", icon: Icons.home },
  text: { label: "Text Block", icon: Icons.text },
  gallery: { label: "Image Gallery", icon: Icons.gallery },
  video: { label: "Video", icon: Icons.video },
  jobs: { label: "Job Listings", icon: Icons.briefcase },
  cta: { label: "Call to Action", icon: Icons.rocket },
  custom: { label: "Custom HTML", icon: Icons.code },
} as const;

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  company,
  saving,
  onThemeChange,
  onThemeBatchUpdate,
  // onContentChange,
  onSectionsChange,
  onSave,
}) => {
  const { theme, sections } = company;
  const [activeTab, setActiveTab] = useState<"sections" | "design" | "advanced">("sections");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);

  const handleApplyPreset = (preset: StylePreset) => {
    onThemeBatchUpdate({
      primaryColor: preset.styles.primaryColor,
      secondaryColor: preset.styles.secondaryColor,
      accentColor: preset.styles.accentColor,
      fontFamily: preset.styles.fontFamily,
      headingFont: preset.styles.headingFont,
      borderRadius: preset.styles.borderRadius,
      spacing: preset.styles.spacing as Theme["spacing"],
      buttonStyle: preset.styles.buttonStyle as Theme["buttonStyle"],
      preset: preset.id,
    });
  };

  // Section handlers
  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    onSectionsChange(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const updateSectionConfig = (sectionId: string, configUpdates: Record<string, unknown>) => {
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, config: { ...s.config, ...configUpdates } } : s
      )
    );
  };

  const updateSectionTheme = (sectionId: string, themeUpdates: Partial<SectionTheme>) => {
    onSectionsChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, theme: { ...s.theme, ...themeUpdates } } : s
      )
    );
  };

  const addSection = (type: Section["type"]) => {
    const newSection: Section = {
      id: `${type}-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      subtitle: "",
      content: type === "text" ? "Add your content here..." : "",
      enabled: true,
      order: sections.length,
      config: type === "gallery" ? { imageUrls: [] } : {},
    };
    onSectionsChange([...sections, newSection]);
    setExpandedSection(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter((s) => s.id !== sectionId);
    newSections.forEach((s, i) => (s.order = i));
    onSectionsChange(newSections);
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const index = sortedSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sortedSections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [sortedSections[index], sortedSections[targetIndex]] = [sortedSections[targetIndex], sortedSections[index]];
    sortedSections.forEach((s, i) => (s.order = i));
    onSectionsChange(sortedSections);
  };

  const getDefaultTitle = (type: string): string => {
    const defaults: Record<string, string> = {
      hero: "Welcome",
      text: "About Us",
      jobs: "Open Positions",
      gallery: "Our Team",
      video: "Our Story",
      cta: "Join Us",
      custom: "Custom Section",
    };
    return defaults[type] || "New Section";
  };

  const getSectionIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      hero: Icons.home,
      text: Icons.text,
      jobs: Icons.briefcase,
      gallery: Icons.gallery,
      video: Icons.video,
      cta: Icons.rocket,
      custom: Icons.code,
    };
    return iconMap[type] || Icons.text;
  };

  // Image upload handler
  const handleImageUpload = async (sectionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadingSectionId(sectionId);

    try {
      const section = sections.find((s) => s.id === sectionId);
      const currentImages = (section?.config?.imageUrls as string[]) || [];
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post<{ url: string }>("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        newUrls.push(response.data.url);
      }

      updateSectionConfig(sectionId, { imageUrls: [...currentImages, ...newUrls] });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image(s)");
    } finally {
      setUploading(false);
      setUploadingSectionId(null);
    }
  };

  // Single Image Upload (for Hero Background)
  const handleSingleImageUpload = async (sectionId: string, file: File | null) => {
    if (!file) return;

    setUploading(true);
    setUploadingSectionId(sectionId);

    try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post<{ url: string }>("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Also stringify the url for backgroundValue just in case, or we use separate fields
        updateSectionConfig(sectionId, { 
            backgroundImageUrl: response.data.url, 
            backgroundType: "image" 
        });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      setUploadingSectionId(null);
    }
  };

  const removeImage = (sectionId: string, imageUrl: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const currentImages = (section?.config?.imageUrls as string[]) || [];
    updateSectionConfig(sectionId, { imageUrls: currentImages.filter((url) => url !== imageUrl) });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Render section-specific fields
  const renderSectionFields = (section: Section) => {
    switch (section.type) {
      case "hero":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={section.subtitle || ""}
                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            
            {/* Background Settings */}
            <div className="pt-2 border-t border-gray-100">
               <label className="block text-xs font-medium text-gray-700 mb-2">Background Style</label>
               <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 mb-3">
                  {(["image", "color", "gradient"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateSectionConfig(section.id, { backgroundType: type })}
                      className={`flex-1 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
                         (section.config?.backgroundType || "image") === type
                           ? "bg-white shadow-sm text-blue-600 ring-1 ring-black/5"
                           : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
               </div>

               {/* Conditional Inputs based on Type */}
               {(section.config?.backgroundType || "image") === "image" && (
                 <div>
                    {section.config?.backgroundImageUrl ? (
                        <div className="relative group aspect-video mb-2">
                        <img 
                            src={section.config.backgroundImageUrl.startsWith("/") ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${section.config.backgroundImageUrl}` : section.config.backgroundImageUrl}
                            alt="Hero Background" 
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                            onClick={() => updateSectionConfig(section.id, { backgroundImageUrl: "" })}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {Icons.x}
                        </button>
                        </div>
                    ) : (
                        <label className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all uppercase font-bold text-xs tracking-wider">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSingleImageUpload(section.id, e.target.files?.[0] || null)}
                            disabled={uploading && uploadingSectionId === section.id}
                        />
                        {uploading && uploadingSectionId === section.id ? (
                            <span className="text-gray-500">Uploading...</span>
                        ) : (
                            <>
                            {Icons.upload}
                            <span className="text-gray-600">Upload Background</span>
                            </>
                        )}
                        </label>
                    )}
                 </div>
               )}

               {(section.config?.backgroundType === "color") && (
                   <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Color Code</label>
                       <div className="flex gap-2">
                           <input
                            type="color"
                            value={(section.config?.backgroundValue as string) || theme.primaryColor}
                            onChange={(e) => updateSectionConfig(section.id, { backgroundValue: e.target.value })}
                            className="h-9 w-9 p-0 border border-gray-200 rounded cursor-pointer"
                           />
                           <input
                            type="text"
                            value={(section.config?.backgroundValue as string) || ""}
                            onChange={(e) => updateSectionConfig(section.id, { backgroundValue: e.target.value })}
                             className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                             placeholder="#3B82F6"
                           />
                       </div>
                   </div>
               )}

               {(section.config?.backgroundType === "gradient") && (
                   <div className="space-y-3">
                        <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">Gradient CSS</label>
                         <input
                            type="text"
                            value={(section.config?.backgroundValue as string) || ""}
                            onChange={(e) => updateSectionConfig(section.id, { backgroundValue: e.target.value })}
                             className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                             placeholder="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
                           />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
                                "linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)",
                                "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"
                            ].map((grad, i) => (
                                <button
                                  key={i}
                                  onClick={() => updateSectionConfig(section.id, { backgroundValue: grad })}
                                  className="w-full h-8 rounded border border-gray-200 hover:scale-105 transition-transform"
                                  style={{ background: grad }}
                                  title="Apply Preset"
                                />
                            ))}
                        </div>
                   </div>
               )}

               <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Overlay Opacity</label>
                    <input 
                       type="range"
                       min="0"
                       max="1"
                       step="0.1"
                       value={section.config?.overlayOpacity ?? 0.4}
                       onChange={(e) => updateSectionConfig(section.id, { overlayOpacity: parseFloat(e.target.value) })}
                       className="w-full"
                    />
               </div>
            </div>
          </>
        );

      case "text":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                {(["left", "center", "right"] as const).map((align) => (
                   <button
                     key={align}
                     onClick={() => updateSectionConfig(section.id, { layout: align })}
                     className={`flex-1 py-1 text-xs rounded-md capitalize transition-all ${
                       (section.config?.layout || "center") === align
                         ? "bg-white shadow-sm text-blue-600 font-semibold ring-1 ring-black/5"
                         : "text-gray-500 hover:text-gray-700"
                     }`}
                   >
                     {align}
                   </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="Section title..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle (optional)</label>
              <input
                type="text"
                value={section.subtitle || ""}
                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="Optional subtitle..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={section.content || ""}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                placeholder="Add your content..."
              />
            </div>
          </>
        );

      case "gallery":
        const imageUrls = (section.config?.imageUrls as string[]) || [];
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Gallery Images</label>
              
              {/* Image grid */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={url.startsWith("/") ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${url}` : url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(section.id, url)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {Icons.x}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(section.id, e.target.files)}
                  disabled={uploading && uploadingSectionId === section.id}
                />
                {uploading && uploadingSectionId === section.id ? (
                  <span className="text-sm text-gray-500">Uploading...</span>
                ) : (
                  <>
                    {Icons.upload}
                    <span className="text-sm text-gray-600">Upload Images</span>
                  </>
                )}
              </label>
            </div>
          </>
        );

      case "video":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Video URL</label>
              <input
                type="text"
                value={(section.config?.videoUrl as string) || ""}
                onChange={(e) => updateSectionConfig(section.id, { videoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-[10px] text-gray-400 mt-1">Supports YouTube and Vimeo URLs</p>
            </div>
          </>
        );

      case "jobs":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={section.subtitle || ""}
                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="Find the role that fits you best"
              />
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              Job listings are automatically pulled from your job postings.
            </p>
          </>
        );

      case "cta":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={section.subtitle || ""}
                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="Ready to make an impact?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={(section.config?.ctaButtonText as string) || "Get Started"}
                onChange={(e) => updateSectionConfig(section.id, { ctaButtonText: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Button URL</label>
              <input
                type="text"
                value={(section.config?.ctaButtonUrl as string) || ""}
                onChange={(e) => updateSectionConfig(section.id, { ctaButtonUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="https://..."
              />
            </div>
          </>
        );

      case "custom":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Custom HTML</label>
              <textarea
                value={section.content || ""}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none bg-gray-50"
                placeholder="<div>Your custom HTML...</div>"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
        <h1 className="font-semibold text-gray-900 truncate tracking-tight">{company.name}</h1>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1 font-bold">Careers Page Editor</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 p-1 bg-gray-50/30">
        {["sections", "design", "advanced"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-300 capitalize ${
              activeTab === tab
                ? "text-blue-600 bg-white shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ============ SECTIONS TAB ============ */}
        {activeTab === "sections" && (
          <div className="p-3 space-y-2">
            
            {/* Dynamic Sections */}
            {sortedSections.map((section, index) => (
              <div
                key={section.id}
                className={`rounded-xl border transition-all ${
                  expandedSection === section.id
                    ? "border-blue-300 bg-blue-50/30 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                {/* Section Header */}
                <div
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                >
                  <span className={`${section.enabled ? "text-blue-600" : "text-gray-400"}`}>
                    {getSectionIcon(section.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-gray-900 truncate block">
                      {section.title || "Untitled Section"}
                    </span>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wide">
                      {section.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); updateSection(section.id, { enabled: !section.enabled }); }}
                      className={`p-1.5 rounded-md transition-all ${section.enabled ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}
                      title={section.enabled ? "Hide section" : "Show section"}
                    >
                      {section.enabled ? Icons.eye : Icons.eyeOff}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, "up"); }}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all disabled:opacity-30"
                    >
                      {Icons.chevronUp}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, "down"); }}
                      disabled={index === sortedSections.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all disabled:opacity-30"
                    >
                      {Icons.chevronDown}
                    </button>
                    <span className={`transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}>
                      {Icons.chevronDown}
                    </span>
                  </div>
                </div>

                {/* Section Content (Expanded) */}
                {expandedSection === section.id && (
                  <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
                    {renderSectionFields(section)}

                    {/* Section-specific Theme Override */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Section Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Background</label>
                          <input
                            type="color"
                            value={section.theme?.backgroundColor || theme.backgroundColor}
                            onChange={(e) => updateSectionTheme(section.id, { backgroundColor: e.target.value })}
                            className="w-full h-8 rounded-md cursor-pointer border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Text</label>
                          <input
                            type="color"
                            value={section.theme?.textColor || theme.textColor}
                            onChange={(e) => updateSectionTheme(section.id, { textColor: e.target.value })}
                            className="w-full h-8 rounded-md cursor-pointer border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Accent</label>
                          <input
                            type="color"
                            value={section.theme?.accentColor || theme.accentColor}
                            onChange={(e) => updateSectionTheme(section.id, { accentColor: e.target.value })}
                            className="w-full h-8 rounded-md cursor-pointer border border-gray-200"
                          />
                        </div>
                      </div>
                      {section.theme && Object.keys(section.theme).length > 0 && (
                        <button
                          onClick={() => updateSection(section.id, { theme: undefined })}
                          className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Reset to global theme
                        </button>
                      )}
                    </div>

                    {/* Delete Section */}
                    <div className="pt-2">
                      <button
                        onClick={() => deleteSection(section.id)}
                        disabled={sections.length <= 1}
                        className="w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {Icons.trash}
                        Delete Section
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Section */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Add Section</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SECTION_TYPE_CONFIG) as Array<keyof typeof SECTION_TYPE_CONFIG>).map((type) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 hover:border-gray-200"
                  >
                    <span className="text-gray-500">{SECTION_TYPE_CONFIG[type].icon}</span>
                    <span>{SECTION_TYPE_CONFIG[type].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ DESIGN TAB ============ */}
        {activeTab === "design" && (
          <>
            <CollapsiblePanel
              title="Style Presets"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
            >
              <StylePresets currentPreset={theme.preset} onApplyPreset={handleApplyPreset} />
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Global Colors"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              }
            >
              <div className="space-y-4">
                <ColorPicker label="Primary Color" value={theme.primaryColor} onChange={(color) => onThemeChange("primaryColor", color)} />
                <ColorPicker label="Secondary Color" value={theme.secondaryColor} onChange={(color) => onThemeChange("secondaryColor", color)} />
                <ColorPicker label="Accent Color" value={theme.accentColor} onChange={(color) => onThemeChange("accentColor", color)} />
                <ColorPicker label="Background Color" value={theme.backgroundColor} onChange={(color) => onThemeChange("backgroundColor", color)} />
                <ColorPicker label="Text Color" value={theme.textColor} onChange={(color) => onThemeChange("textColor", color)} />
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Typography"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              }
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Body Font</label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => onThemeChange("fontFamily", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none transition-all cursor-pointer"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Heading Font</label>
                  <select
                    value={theme.headingFont}
                    onChange={(e) => onThemeChange("headingFont", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none transition-all cursor-pointer"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Base Font Size</label>
                  <select
                    value={theme.baseFontSize}
                    onChange={(e) => onThemeChange("baseFontSize", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none transition-all cursor-pointer"
                  >
                    {FONT_SIZE_OPTIONS.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Layout & Spacing"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Border Radius</label>
                  <select
                    value={theme.borderRadius}
                    onChange={(e) => onThemeChange("borderRadius", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none transition-all cursor-pointer"
                  >
                    {BORDER_RADIUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Spacing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["compact", "normal", "relaxed"].map((spacing) => (
                      <button
                        key={spacing}
                        type="button"
                        onClick={() => onThemeChange("spacing", spacing)}
                        className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          theme.spacing === spacing
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50 bg-white"
                        }`}
                      >
                        {spacing}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Button Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "rounded", label: "Rounded" },
                      { id: "pill", label: "Pill" },
                      { id: "sharp", label: "Sharp" },
                      { id: "minimal", label: "Minimal" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => onThemeChange("buttonStyle", style.id)}
                        className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          theme.buttonStyle === style.id
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50 bg-white"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Images & Assets"
              icon={Icons.gallery}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={theme.logoUrl}
                    onChange={(e) => onThemeChange("logoUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  {theme.logoUrl && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <img src={theme.logoUrl} alt="Logo preview" className="h-10 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={theme.bannerUrl}
                    onChange={(e) => onThemeChange("bannerUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  {theme.bannerUrl && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <img src={theme.bannerUrl} alt="Banner preview" className="h-16 w-full object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>
            </CollapsiblePanel>
          </>
        )}

        {/* ============ ADVANCED TAB ============ */}
        {activeTab === "advanced" && (
          <>
            <CollapsiblePanel
              title="Custom CSS"
              icon={Icons.code}
            >
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Add custom CSS to further customize your careers page.</p>
                <textarea
                  value={theme.customCSS}
                  onChange={(e) => onThemeChange("customCSS", e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 text-xs font-mono border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 resize-none bg-gray-50/50 text-gray-700 outline-none transition-all"
                  placeholder={`/* Example */
.hero-section {
  background: linear-gradient(...);
}
.job-card:hover {
  transform: translateY(-4px);
}`}
                />
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="CSS Reference"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              defaultOpen={false}
            >
              <div className="space-y-2 text-xs">
                <p className="text-gray-600 mb-3">Available CSS classes:</p>
                <div className="space-y-1">
                  {[
                    { cls: ".hero-section", desc: "Hero banner" },
                    { cls: ".section", desc: "Any section" },
                    { cls: ".section-title", desc: "Section headings" },
                    { cls: ".job-card", desc: "Job cards" },
                    { cls: ".apply-button", desc: "Apply buttons" },
                    { cls: ".footer", desc: "Page footer" },
                  ].map((item) => (
                    <div key={item.cls} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                      <code className="text-blue-600 font-mono">{item.cls}</code>
                      <span className="text-gray-500">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsiblePanel>
          </>
        )}
      </div>

      {/* Footer with Save Button */}
      <div className="px-4 py-4 border-t border-gray-100 bg-white">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-black/5"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};
