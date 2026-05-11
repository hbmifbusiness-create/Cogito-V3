import React, { useState, useRef, useEffect } from "react";
import {
  WorkspaceEntity,
  FontDetails,
  BrandHistoryEntry,
  BrandImage,
} from "../types";
import {
  Paintbrush,
  Type,
  Camera,
  AlignLeft,
  X,
  Upload,
  Copy,
  Info,
  Check,
  Image as ImageIcon,
  Plus,
  Lock,
  Unlock,
  Download,
  GripVertical,
  ChevronDown,
  Save,
  FileBox,
} from "lucide-react";
import {
  ColorItem,
  ColorGeneratorModal,
  UploadImageModal,
  CompatibilityCheckModal,
  SocialMediaDimensionsModal,
} from "./BrandAssetComponents";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { MoodboardView } from "./MoodboardView";

export function BrandManagementView({
  entity,
  onUpdate,
  initialTab = "current_branding",
}: {
  entity: WorkspaceEntity;
  onUpdate: (e: WorkspaceEntity) => void;
  initialTab?: string;
}) {
  const brand = entity.brandDetails || {
    logo: "",
    icons: [],
    images: [],
    colors: ["#0A0A0A", "#FFFFFF", "#CFFF04"],
    fonts: [],
    history: [],
  };

  const [activeTab, setActiveTab] = useState(initialTab); 

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [dimsModalOpen, setDimsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<
    "logo" | "icon" | "image" | false
  >(false);
  const [checkingImage, setCheckingImage] = useState<any>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const socialSpecs = [
    {
      platform: "Instagram",
      items: [
        { name: "Profile", w: 1080, h: 1080, r: "1:1", size: "8MB" },
        { name: "Square Post", w: 1080, h: 1080, r: "1:1", size: "30MB" },
        { name: "Portrait Post", w: 1080, h: 1350, r: "4:5", size: "30MB" },
        { name: "Story/Reel", w: 1080, h: 1920, r: "9:16", size: "4GB (Reel)" },
      ],
    },
    {
      platform: "YouTube",
      items: [
        { name: "Profile", w: 800, h: 800, r: "1:1", size: "4MB" },
        { name: "Banner", w: 2048, h: 1152, r: "16:9", size: "6MB" },
        { name: "Thumbnail", w: 1280, h: 720, r: "16:9", size: "2MB" },
        { name: "Shorts", w: 1080, h: 1920, r: "9:16", size: "10MB" },
      ],
    },
    {
      platform: "Facebook",
      items: [
        { name: "Profile", w: 1080, h: 1080, r: "1:1", size: "8MB" },
        { name: "Cover", w: 1640, h: 856, r: "1.91:1", size: "8MB" },
        { name: "Post", w: 1200, h: 630, r: "1.91:1", size: "30MB" },
      ],
    },
    {
      platform: "X (Twitter)",
      items: [
        { name: "Profile", w: 400, h: 400, r: "1:1", size: "2MB" },
        { name: "Banner", w: 1500, h: 500, r: "3:1", size: "2MB" },
        { name: "In-Stream", w: 1600, h: 900, r: "16:9", size: "5MB" },
      ],
    },
    {
      platform: "Squarespace",
      items: [
        { name: "Favicon", w: 300, h: 300, r: "1:1", size: "100KB" },
        { name: "Main Logo", w: 1000, h: 500, r: "Any", size: "20MB" },
      ],
    },
  ];

  const handleUpdate = (updates: any) => {
    onUpdate({
      ...entity,
      brandDetails: {
        ...brand,
        ...updates,
      },
    });
  };

  const colorsArray = Array.isArray(brand.colors)
    ? brand.colors
    : Object.values(brand.colors) as string[];

  const fontsArray = Array.isArray(brand.fonts)
    ? brand.fonts
    : (Object.entries(brand.fonts).map(([k, v]) => ({
        id: `f-${k}`,
        name: v as string,
        type: k,
        fontFamilyType: "sans-serif",
        weightsAndStyles: "Regular",
        substitutions: "Arial",
        spacing: { kerning: "0", tracking: "0", leading: "1.5" },
        formatting: {
          capitalization: "Sentence case",
          colorValues: { pantone: "", cmyk: "", rgbHex: "#000000" },
          allowedEffects: "None",
        },
      })) as FontDetails[]);

  const handleColorChange = (index: number, newColor: string) => {
    if (Array.isArray(brand.colors)) {
      const newColors = [...brand.colors];
      newColors[index] = newColor;
      handleUpdate({ colors: newColors });
    } else {
      const keys = Object.keys(brand.colors);
      const newColors = { ...brand.colors, [keys[index]]: newColor };
      handleUpdate({ colors: newColors });
    }
  };

  const addColor = () => {
    if (Array.isArray(brand.colors)) {
      handleUpdate({ colors: [...brand.colors, "#cccccc"] });
    } else {
      handleUpdate({
        colors: { ...brand.colors, [`extra_${Date.now()}`]: "#cccccc" },
      });
    }
  };

  const removeColor = (i: number) => {
    if (Array.isArray(brand.colors)) {
      handleUpdate({ colors: brand.colors.filter((_, idx) => idx !== i) });
    } else {
      const keys = Object.keys(brand.colors);
      const newColors = { ...brand.colors };
      delete (newColors as any)[keys[i]];
      handleUpdate({ colors: newColors });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFontIndex, setActiveFontIndex] = useState<number | null>(null);

  const addFont = () => {
    const newFont: FontDetails = {
      id: `f${Date.now()}`,
      name: "New Font",
      type: "Primary",
      fontFamilyType: "sans-serif",
      weightsAndStyles: "Regular",
      substitutions: "Arial",
      spacing: { kerning: "0", tracking: "0", leading: "1.5" },
      formatting: {
        capitalization: "Sentence case",
        colorValues: { pantone: "", cmyk: "", rgbHex: "#000000" },
        allowedEffects: "None",
      },
    };
    if (Array.isArray(brand.fonts)) {
      handleUpdate({ fonts: [...brand.fonts, newFont] });
    } else {
      handleUpdate({ fonts: { ...brand.fonts, [`font_${Date.now()}`]: "New Font" } });
    }
  };

  const removeFont = (index: number) => {
    if (Array.isArray(brand.fonts)) {
      handleUpdate({ fonts: brand.fonts.filter((_, i) => i !== index) });
    } else {
      const keys = Object.keys(brand.fonts);
      const newFonts = { ...brand.fonts };
      delete (newFonts as any)[keys[index]];
      handleUpdate({ fonts: newFonts });
    }
  };

  const updateFont = (index: number, updates: Partial<FontDetails>) => {
    if (Array.isArray(brand.fonts)) {
      const newFonts = [...brand.fonts];
      newFonts[index] = { ...newFonts[index], ...updates };
      handleUpdate({ fonts: newFonts });
    } else {
        const keys = Object.keys(brand.fonts);
        const newFonts = { ...brand.fonts, [keys[index]]: updates.name || (brand.fonts as any)[keys[index]] };
        handleUpdate({ fonts: newFonts });
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    if (!Array.isArray(brand.fonts)) return;
    const items = Array.from(brand.fonts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    handleUpdate({ fonts: items });
  };

  const saveToVault = () => {
    const newEntry: BrandHistoryEntry = {
      id: `bh${Date.now()}`,
      date: new Date().toLocaleString(),
      description: `Brand configuration saved`,
      data: {
        logo: brand.logo,
        icons: brand.icons,
        colors: brand.colors as any,
        fonts: brand.fonts as any,
      },
    };
    handleUpdate({ history: [newEntry, ...brand.history] });
    setShowSaveConfirm(false);
  };

  return (
    <div
      className="h-full w-full flex flex-col relative"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={(e) => {
          // Upload logic here
        }}
      />

      {generatorOpen && (
        <ColorGeneratorModal
          currentColors={brand.colors}
          onClose={() => setGeneratorOpen(false)}
          onApply={(newColors: string[]) => {
            handleUpdate({ colors: newColors });
            setGeneratorOpen(false);
          }}
        />
      )}
      {dimsModalOpen && (
        <SocialMediaDimensionsModal onClose={() => setDimsModalOpen(false)} />
      )}
      {uploadModalOpen && (
        <UploadImageModal
          onClose={() => setUploadModalOpen(false)}
          onUpload={(img: any) => {
            if (uploadModalOpen === "logo") handleUpdate({ logo: img.url });
            else if (uploadModalOpen === "icon")
              handleUpdate({ icons: [...(brand.icons || []), img] });
            else handleUpdate({ images: [...(brand.images || []), img] });
            setUploadModalOpen(false);
          }}
        />
      )}
      {checkingImage && (
        <CompatibilityCheckModal
          image={checkingImage}
          specs={socialSpecs}
          onClose={() => setCheckingImage(null)}
        />
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="rounded-2xl p-6 border shadow-2xl max-w-sm w-full relative"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            <button
              onClick={() => setShowSaveConfirm(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[var(--bg-primary)] rounded"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-bold mb-2">Save to Vault</h3>
            <p className="text-sm opacity-80 mb-6">
              Would you like to save the current brand configuration to the
              vault?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-2 rounded-lg font-bold text-sm bg-[var(--bg-primary)] border hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-color)" }}
              >
                Cancel
              </button>
              <button
                onClick={saveToVault}
                className="flex-1 py-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-90 shadow-sm"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-text)",
                }}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar w-full">
        <div className="w-full space-y-12">
          {activeTab === "current_branding" && (
            <>
              <div className="flex justify-end pr-2">
                <button
                  onClick={() => setShowSaveConfirm(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-lg font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 hover:brightness-110 btn-active-shade"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--accent-text)",
                  }}
                >
                  <Save size={16} strokeWidth={3} /> Save to Vault
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Section */}
                <div
                  className="rounded-2xl p-6 border shadow-sm flex flex-col"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <ImageIcon style={{ color: "var(--accent)" }} size={20} />
                      <h3 className="font-bold text-lg uppercase tracking-wider">
                        Logo
                      </h3>
                    </div>
                    <button
                      onClick={() => setUploadModalOpen("logo")}
                      className="text-xs font-bold px-4 py-2"
                      style={{ color: "var(--accent)" }}
                    >
                      + Add
                    </button>
                  </div>
                  {brand.logo ? (
                    <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                      <img
                        src={brand.logo}
                        className="w-48 h-48 object-contain rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"
                      />
                      <button
                        onClick={() => handleUpdate({ logo: "" })}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex-1 flex items-center justify-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No logo uploaded.
                    </div>
                  )}
                </div>

                {/* Icons Section */}
                <div
                  className="rounded-2xl p-6 border shadow-sm flex flex-col"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Camera style={{ color: "var(--accent)" }} size={20} />
                      <h3 className="font-bold text-lg uppercase tracking-wider">
                        Icons
                      </h3>
                    </div>
                    <button
                      onClick={() => setUploadModalOpen("icon")}
                      className="text-xs font-bold px-4 py-2"
                      style={{ color: "var(--accent)" }}
                    >
                      + Add
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 content-start">
                    {brand.icons?.map((img: BrandImage) => (
                      <div
                        key={img.id}
                        className="aspect-square flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-lg p-2 relative group cursor-pointer"
                        onClick={() => setCheckingImage(img)}
                      >
                        <img
                          src={img.url}
                          className="w-full h-full object-contain"
                        />
                        <button
                          className="absolute bottom-2 right-2 p-1 bg-red-500/20 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate({
                              icons: brand.icons?.filter(
                                (i) => i.id !== img.id,
                              ),
                            });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {(!brand.icons || brand.icons.length === 0) && (
                      <div
                        className="col-span-3 text-center text-sm mt-4"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No icons uploaded.
                      </div>
                    )}
                  </div>
                </div>

                {/* Colors Section */}
                <div
                  className="rounded-2xl p-6 border shadow-sm col-span-1 md:col-span-2"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Paintbrush
                        style={{ color: "var(--accent)" }}
                        size={20}
                      />
                      <h3 className="font-bold text-lg uppercase tracking-wider">
                        Colour Scheme
                      </h3>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setGeneratorOpen(true)}
                        className="text-xs font-bold flex items-center gap-1 border px-3 py-2 rounded-lg bg-[var(--bg-primary)] hover:opacity-80 transition-opacity whitespace-nowrap"
                        style={{
                          color: "var(--text-primary)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        Generator
                      </button>
                      <button
                        onClick={addColor}
                        className="text-xs font-bold px-4 py-2"
                        style={{ color: "var(--accent)" }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {colorsArray.map((c, i) => (
                      <ColorItem
                        key={i}
                        color={c as string}
                        onChange={(v: string) => handleColorChange(i, v)}
                        onRemove={() => removeColor(i)}
                        canRemove={colorsArray.length > 1}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography Section */}
                <div
                  className="rounded-2xl p-6 border shadow-sm col-span-1 md:col-span-2"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Type style={{ color: "var(--accent)" }} size={20} />
                      <h3 className="font-bold text-lg uppercase tracking-wider">
                        Typography
                      </h3>
                    </div>
                    <button
                      onClick={addFont}
                      className="text-xs font-bold px-4 py-2"
                      style={{ color: "var(--accent)" }}
                    >
                      + Add
                    </button>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="fontsList" isDropDisabled={false}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {fontsArray.map((font, index) => (
                            <Draggable
                              key={font.id}
                              draggableId={font.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden"
                                >
                                  <div className="bg-[var(--bg-surface)] p-3 border-b border-[var(--border-color)] flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="p-1 cursor-grab opacity-50 hover:opacity-100"
                                    >
                                      <GripVertical size={18} />
                                    </div>
                                    <div className="flex-1 flex items-center gap-4">
                                      {/* Dropdown for Type */}
                                      <div className="relative group">
                                        <button className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1">
                                          {font.type} <ChevronDown size={12} />
                                        </button>
                                        <div className="absolute top-full left-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-32">
                                          {[
                                            "Primary",
                                            "Secondary",
                                            "Tertiary",
                                            "Display",
                                            "Body",
                                          ].map((opt) => (
                                            <button
                                              key={opt}
                                              onClick={() =>
                                                updateFont(index, { type: opt })
                                              }
                                              className="block w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-muted)]"
                                            >
                                              {opt}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <input
                                        value={font.name}
                                        onChange={(e) =>
                                          updateFont(index, {
                                            name: e.target.value,
                                          })
                                        }
                                        className="text-lg font-bold bg-transparent outline-none flex-1 font-display"
                                        placeholder="Font Name"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setActiveFontIndex(index);
                                          fileInputRef.current?.click();
                                        }}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
                                        title="Upload Font File"
                                      >
                                        <Upload size={16} />
                                      </button>
                                      {font.fileUrl && (
                                        <button
                                          onClick={() =>
                                            alert("Downloading font...")
                                          }
                                          className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors text-[var(--accent)]"
                                          title="Redownload Font"
                                        >
                                          <Download size={16} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => removeFont(index)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                        title="Remove"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                        Specifications
                                      </h4>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Font Family Type
                                        </label>
                                        <select
                                          value={font.fontFamilyType}
                                          onChange={(e: any) =>
                                            updateFont(index, {
                                              fontFamilyType: e.target.value,
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        >
                                          <option value="serif">Serif</option>
                                          <option value="sans-serif">
                                            Sans-Serif
                                          </option>
                                          <option value="monospace">
                                            Monospace
                                          </option>
                                          <option value="display">
                                            Display
                                          </option>
                                          <option value="handwriting">
                                            Handwriting
                                          </option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Weights & Styles
                                        </label>
                                        <input
                                          value={font.weightsAndStyles}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              weightsAndStyles: e.target.value,
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Substitutions / Web-Safe
                                        </label>
                                        <input
                                          value={font.substitutions}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              substitutions: e.target.value,
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                        Spacing
                                      </h4>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Kerning
                                        </label>
                                        <input
                                          value={font.spacing.kerning}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              spacing: {
                                                ...font.spacing,
                                                kerning: e.target.value,
                                              },
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Tracking
                                        </label>
                                        <input
                                          value={font.spacing.tracking}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              spacing: {
                                                ...font.spacing,
                                                tracking: e.target.value,
                                              },
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Leading
                                        </label>
                                        <input
                                          value={font.spacing.leading}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              spacing: {
                                                ...font.spacing,
                                                leading: e.target.value,
                                              },
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                        Formatting
                                      </h4>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Capitalization
                                        </label>
                                        <input
                                          value={font.formatting.capitalization}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              formatting: {
                                                ...font.formatting,
                                                capitalization: e.target.value,
                                              },
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          RGB / HEX
                                        </label>
                                        <input
                                          value={
                                            font.formatting.colorValues.rgbHex
                                          }
                                          onChange={(e) =>
                                            updateFont(index, {
                                              formatting: {
                                                ...font.formatting,
                                                colorValues: {
                                                  ...font.formatting
                                                    .colorValues,
                                                  rgbHex: e.target.value,
                                                },
                                              },
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <label className="text-[10px] opacity-70">
                                          Allowed Effects
                                        </label>
                                        <input
                                          value={font.formatting.allowedEffects}
                                          onChange={(e) =>
                                            updateFont(index, {
                                              formatting: {
                                                ...font.formatting,
                                                allowedEffects: e.target.value,
                                              },
                                            })
                                          }
                                          className="bg-transparent border-b border-[var(--border-color)] outline-none py-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </>
          )}

          {activeTab === "asset_history" && (
            <div
              className="rounded-2xl p-6 border shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <FileBox style={{ color: "var(--accent)" }} size={20} />
                <h3 className="font-bold text-lg uppercase tracking-wider">
                  Asset Vault
                </h3>
              </div>
              {brand.history.length === 0 ? (
                <div
                  className="text-sm text-center py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  No historical changes tracked yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {brand.history.map((h, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)] transition-colors group"
                    >
                      <div
                        className="w-1 rounded-full self-stretch"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold">{h.description}</p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {h.date}
                          </p>
                        </div>
                        {h.data && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {h.data.colors && h.data.colors.length > 0 && (
                              <div className="flex max-w-[120px] rounded overflow-hidden">
                                {h.data.colors.slice(0, 4).map((c, idx) => (
                                  <div
                                    key={idx}
                                    className="h-4 flex-1"
                                    style={{ backgroundColor: c }}
                                  ></div>
                                ))}
                              </div>
                            )}
                            {h.data.fonts && (
                              <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-[var(--bg-muted)] items-center flex inline-flex">
                                {h.data.fonts.length} Fonts
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="hidden group-hover:flex items-center gap-2 px-2">
                        <button
                          onClick={() => alert("Opening file wrapper...")}
                          className="px-3 py-2 rounded bg-[var(--bg-muted)] text-xs font-bold hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => alert("Downloading package...")}
                          className="p-2 rounded bg-[var(--bg-muted)] text-xs hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "brand_guidelines" && (
            <div className="p-8 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-xl">
              Brand Guidelines UI...
            </div>
          )}

          {activeTab === "moodboard" && (
            <MoodboardView 
              entity={entity} 
              onUpdate={(updates) => onUpdate({ ...entity, ...updates })} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
