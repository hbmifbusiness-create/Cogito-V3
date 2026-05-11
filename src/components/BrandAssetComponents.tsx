import React, { useState } from "react";
import {
  Copy,
  Check,
  Lock,
  Unlock,
  AlignLeft,
  Info,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

export function ColorItem({ color, onChange, onRemove, canRemove }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-color)]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg shadow-sm border border-white/20 transition-transform active:scale-95"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col gap-1 w-24">
          <div className="flex items-center gap-1">
            <span
              className="text-xs font-mono uppercase font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {color}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-[var(--bg-surface-hover)] rounded ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-14 left-0 z-50 p-4 rounded-xl border shadow-2xl space-y-3"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex justify-between items-center mb-2 gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Edit Color
              </span>
              {canRemove && (
                <button
                  onClick={() => {
                    onRemove();
                    setIsOpen(false);
                  }}
                  className="text-xs text-red-500 hover:underline font-bold"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs font-bold text-[var(--text-muted)]">
                HEX
              </span>
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 text-sm font-mono bg-[var(--bg-primary)] border border-[var(--border-color)] outline-none uppercase font-bold p-2 rounded"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useCallback, useRef, useEffect, useMemo } from 'react';

// A small utility for mapping HSL to Hex
const hslToRgb = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export function ColorGeneratorModal({ currentColors, onClose, onApply }: any) {
  const [method, setMethod] = useState("analogous");
  const baseL = 50;
  const [baseHsl, setBaseHsl] = useState<[number, number, number]>([180, 100, 50]);
  
  // Initialize from current colors if possible
  useEffect(() => {
    if (currentColors && currentColors.length > 0) {
      const [r, g, b] = hexToRgb(currentColors[0]);
      setBaseHsl(rgbToHsl(r, g, b) as [number, number, number]);
    }
  }, []);

  // Compute harmonized colors
  const generatedColors = useMemo(() => {
    const [h, s, l] = baseHsl;
    let hues: number[] = [];
    
    switch (method) {
      case "analogous":
        hues = [h - 30, h - 15, h, h + 15, h + 30];
        break;
      case "monochromatic":
        return [
          [h, s, Math.min(l + 30, 100)],
          [h, s, Math.min(l + 15, 100)],
          [h, s, l],
          [h, s, Math.max(l - 15, 0)],
          [h, s, Math.max(l - 30, 0)]
        ];
      case "triadic":
        hues = [h, h, h + 120, h + 240, h + 240];
        break;
      case "complementary":
        hues = [h - 15, h, h, h + 180, h + 195];
        break;
      case "split-complementary":
        hues = [h - 150, h - 150, h, h + 150, h + 150];
        break;
      case "double-split":
        hues = [h - 30, h, h + 30, h + 150, h + 210];
        break;
      case "square":
        hues = [h, h + 90, h + 180, h + 270, h + 270];
        break;
      case "compound":
        hues = [h - 20, h, h + 20, h + 160, h + 180];
        break;
      case "shades":
        return [
          [h, s, Math.min(l + 40, 100)],
          [h, s, Math.min(l + 20, 100)],
          [h, s, l],
          [h, s, Math.max(l - 20, 0)],
          [h, s, Math.max(l - 40, 0)]
        ];
      default:
        hues = [h - 30, h - 15, h, h + 15, h + 30];
    }
    
    return hues.map(hue => [(hue + 360) % 360, s, l]);
  }, [baseHsl, method]);

  const wheelRef = useRef<HTMLDivElement>(null);

  const handlePointer = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // Calculate angle in degrees
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 360 + 90) % 360; // adjust so 0 is top
    
    // Calculate distance from center [0, 1]
    const distance = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width / 2));
    
    setBaseHsl([Math.round(angle), Math.round(distance * 100), baseHsl[2]]);
  }, [baseHsl]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons > 0) handlePointer(e);
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [handlePointer]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="rounded-2xl p-6 border shadow-2xl w-full max-w-4xl"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3
            className="text-xl font-black uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Colour Wheel (Adobe-style)
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-primary)]" style={{ color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Rules Sidebar */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)]">Harmony Rule</h4>
            {[
              { id: "analogous", label: "Analogous" },
              { id: "monochromatic", label: "Monochromatic" },
              { id: "triadic", label: "Triad" },
              { id: "complementary", label: "Complementary" },
              { id: "split-complementary", label: "Split Complementary" },
              { id: "double-split", label: "Double Split Complementary" },
              { id: "square", label: "Square" },
              { id: "compound", label: "Compound" },
              { id: "shades", label: "Shades" },
            ].map(rule => (
              <button
                key={rule.id}
                onClick={() => setMethod(rule.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${method === rule.id ? 'bg-[var(--accent)] font-bold' : 'hover:bg-[var(--bg-primary)] font-medium text-[var(--text-secondary)]'}`}
                style={{ color: method === rule.id ? 'var(--accent-text)' : '' }}
              >
                {rule.label}
              </button>
            ))}
          </div>

          {/* Color Wheel Section */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div 
              ref={wheelRef}
              onPointerDown={handlePointer}
              className="relative w-80 h-80 rounded-full cursor-crosshair select-none touch-none shadow-xl border-4"
              style={{
                borderColor: "var(--bg-primary)",
                background: 'conic-gradient(from 180deg, red, magenta, blue, aqua, lime, yellow, red)',
              }}
            >
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle closest-side, #808080 0%, transparent 100%)',
                  mixBlendMode: 'luminosity',
                  opacity: 0.8
                }}
              />
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle closest-side, white 0%, transparent 100%)',
                }}
              />
              
              {/* Nodes */}
              {generatedColors.map((hsl, i) => {
                const angleRad = (hsl[0] - 90) * (Math.PI / 180);
                const r = (hsl[1] / 100) * (160 - 12); // radius mapped to saturation
                const cx = 160 + r * Math.cos(angleRad);
                const cy = 160 + r * Math.sin(angleRad);
                const isBase = i === 2;

                return (
                  <div 
                    key={i}
                    className={`absolute w-6 h-6 rounded-full border-[3px] shadow-md transform -translate-x-1/2 -translate-y-1/2 ${isBase ? 'z-20 scale-125' : 'z-10'} transition-all duration-75`}
                    style={{
                      left: cx,
                      top: cy,
                      backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
                      borderColor: isBase ? 'white' : 'var(--border-color)',
                      pointerEvents: 'none'
                    }}
                  />
                );
              })}
            </div>

            {/* Lightness Slider */}
            <div className="mt-8 w-full max-w-sm flex items-center gap-4">
              <span className="text-xs uppercase font-bold text-[var(--text-muted)]">Lightness</span>
              <input 
                type="range"
                min="0"
                max="100"
                value={baseHsl[2]}
                onChange={(e) => setBaseHsl([baseHsl[0], baseHsl[1], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Selected Colors Preview */}
        <div className="mt-8 flex rounded-xl overflow-hidden shadow-inner h-24 border border-[var(--border-color)]">
          {generatedColors.map((hsl, i) => {
            const hex = rgbToHex(...hslToRgb(hsl[0], hsl[1], hsl[2]) as [number, number, number]);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end pb-3 relative group" style={{ backgroundColor: hex }}>
                <span className="bg-black/40 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {hex}
                </span>
                {i === 2 && <div className="absolute top-2 right-2 text-white"><Check size={12} /></div>}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all"
            style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(generatedColors.map(hsl => rgbToHex(...hslToRgb(hsl[0], hsl[1], hsl[2]) as [number, number, number])))}
            className="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 shadow-lg"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            Apply to Brand
          </button>
        </div>
      </div>
    </div>
  );
}

export function SocialMediaDimensionsModal({ onClose }: any) {
  const specs = [
    {
      platform: "Instragram",
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
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="rounded-2xl flex flex-col border shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div
          className="p-6 border-b shrink-0 flex justify-between items-center"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h3
            className="text-xl font-black uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Social & Web Dimensions
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--bg-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {specs.map((spec) => (
            <div key={spec.platform}>
              <h4
                className="font-bold text-lg mb-3"
                style={{ color: "var(--accent)" }}
              >
                {spec.platform}
              </h4>
              <div
                className="w-full border rounded-xl overflow-hidden"
                style={{ borderColor: "var(--border-color)" }}
              >
                <table
                  className="w-full text-left text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  <thead
                    className="bg-[var(--bg-primary)] border-b"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <tr className="uppercase text-[10px] tracking-widest">
                      <th className="p-3">Asset Type</th>
                      <th className="p-3">Dimensions (px)</th>
                      <th className="p-3">Ratio</th>
                      <th className="p-3">Max Size</th>
                      <th className="p-3">Format</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    {spec.items.map((item) => (
                      <tr
                        key={item.name}
                        className="hover:bg-[var(--bg-primary)]/50"
                      >
                        <td className="p-3 font-bold">{item.name}</td>
                        <td className="p-3 font-mono text-[var(--text-secondary)]">
                          {item.w} x {item.h}
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {item.r}
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {item.size}
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          PNG/JPG
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UploadImageModal({ onClose, onUpload }: any) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [type, setType] = useState("logo");
  const [customType, setCustomType] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setFileUrl(url);
      const img = new Image();
      img.onload = () => {
        setDimensions({ w: img.width, h: img.height });
      };
      img.src = url;
    }
  };

  const handleSave = () => {
    if (file && fileUrl) {
      onUpload({
        id: Date.now().toString(),
        url: fileUrl,
        name: file.name,
        type,
        customType: type === "other" ? customType : undefined,
        width: dimensions.w,
        height: dimensions.h,
        size: file.size,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="rounded-2xl p-6 border shadow-2xl max-w-md w-full"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <h3
          className="text-xl font-black uppercase tracking-wider mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Upload Image
        </h3>

        {!fileUrl ? (
          <div
            className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => document.getElementById("imageUpload")?.click()}
          >
            <Upload size={32} style={{ color: "var(--text-muted)" }} />
            <span
              className="mt-4 font-bold text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Click to Upload
            </span>
            <input
              type="file"
              id="imageUpload"
              className="hidden"
              accept="image/*"
              onChange={handleFile}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="flex justify-center bg-[var(--bg-primary)] p-4 rounded-xl border"
              style={{ borderColor: "var(--border-color)" }}
            >
              <img src={fileUrl} className="max-h-48 object-contain" />
            </div>
            <div>
              <label
                className="text-xs uppercase font-bold tracking-widest block mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Image Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="logo">Logo</option>
                <option value="profile">Profile Picture</option>
                <option value="post">Post / Banner</option>
                <option value="other">Other</option>
              </select>
            </div>
            {type === "other" && (
              <div>
                <label
                  className="text-xs uppercase font-bold tracking-widest block mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Custom Type
                </label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 rounded-lg text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setFileUrl(null)}
                className="flex-1 py-3 rounded-lg font-bold text-sm bg-[var(--bg-primary)] border hover:opacity-80 transition-opacity"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Retake
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-lg font-black text-sm transition-opacity hover:opacity-90 shadow-sm"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-text)",
                }}
              >
                Save Asset
              </button>
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-primary)]"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export function CompatibilityCheckModal({ image, specs, onClose }: any) {
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const toggleSpec = (s: string) => {
    if (selectedSpecs.includes(s)) {
      setSelectedSpecs(selectedSpecs.filter((x: string) => x !== s));
    } else {
      setSelectedSpecs([...selectedSpecs, s]);
    }
  };

  const getRatio = (w: number, h: number) => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  };

  const checkCompatibility = (specItem: any) => {
    if (specItem.r === "Any") return { ok: true, msg: "Any ratio is fine" };
    const parts = specItem.r.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0])) {
      // Check if ratio matches or is close
      const targetRatio = parts[0] / parts[1];
      const actualRatio = image.width / image.height;
      if (Math.abs(targetRatio - actualRatio) < 0.1) {
        return { ok: true, msg: "Ratio matches perfectly" };
      }
      return { ok: false, msg: `Ratio mismatch. Expected ${specItem.r}.` };
    }
    return { ok: true, msg: "-" };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="rounded-2xl p-6 border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <h3
          className="text-xl font-black uppercase tracking-wider mb-6 shrink-0"
          style={{ color: "var(--text-primary)" }}
        >
          Compatibility Check
        </h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-primary)]"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={20} />
        </button>

        <div className="flex gap-8 overflow-hidden h-full mt-4">
          <div className="w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-4">
            <div
              className="bg-[var(--bg-primary)] rounded-xl border p-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              <img
                src={image.url}
                className="w-full object-contain rounded-lg bg-[var(--bg-surface)]"
                style={{ maxHeight: "200px" }}
              />
            </div>
            <div className="space-y-1 mt-2">
              <p
                className="text-xs uppercase font-bold tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Name
              </p>
              <p
                className="text-sm font-bold truncate max-w-full"
                style={{ color: "var(--text-primary)" }}
              >
                {image.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p
                  className="text-xs uppercase font-bold tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Dimensions
                </p>
                <p
                  className="text-sm font-mono truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {image.width} x {image.height}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase font-bold tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Ratio
                </p>
                <p
                  className="text-sm font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  {getRatio(image.width, image.height)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase font-bold tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Size
                </p>
                <p
                  className="text-sm font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  {(image.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="mt-4 mb-4">
              <p
                className="text-xs uppercase font-bold tracking-widest mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Select Platforms
              </p>
              <div className="space-y-4">
                {specs.map((s: any) => (
                  <div key={s.platform}>
                    <div
                      className="font-bold text-sm mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {s.platform}
                    </div>
                    {s.items.map((item: any) => {
                      const id = `${s.platform}-${item.name}`;
                      return (
                        <label
                          key={id}
                          className="flex gap-2 items-center text-xs mb-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpecs.includes(id)}
                            onChange={() => toggleSpec(id)}
                          />
                          <span style={{ color: "var(--text-primary)" }}>
                            {item.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="w-2/3 overflow-y-auto custom-scrollbar border-l pl-8"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="space-y-4">
              {selectedSpecs.length === 0 ? (
                <div
                  className="text-sm py-12 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  Select platforms on the left to check compatibility.
                </div>
              ) : (
                selectedSpecs.map((specId) => {
                  const [platform, itemName] = specId.split("-");
                  const specDef = specs
                    .find((s: any) => s.platform === platform)
                    ?.items.find((i: any) => i.name === itemName);
                  if (!specDef) return null;
                  const result = checkCompatibility(specDef);

                  return (
                    <div
                      key={specId}
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4
                          className="font-bold text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {platform} / {specDef.name}
                        </h4>
                        {result.ok ? (
                          <span className="text-xs font-bold px-2 py-1 bg-green-500/20 rounded text-green-500">
                            Compatible
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-1 bg-red-500/20 rounded text-red-500">
                            Warning
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                        <div>
                          <p
                            className="uppercase font-bold tracking-widest mb-1 opacity-50"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Target Ratio
                          </p>
                          <p style={{ color: "var(--text-primary)" }}>
                            {specDef.r}
                          </p>
                        </div>
                        <div>
                          <p
                            className="uppercase font-bold tracking-widest mb-1 opacity-50"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Feedback
                          </p>
                          <p style={{ color: "var(--text-primary)" }}>
                            {result.msg}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
