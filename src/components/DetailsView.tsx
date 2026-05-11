import React, { useState } from "react";
import { WorkspaceEntity } from "../types";

export function DetailsView({
  entity,
  onUpdate,
}: {
  entity: WorkspaceEntity;
  onUpdate: (e: WorkspaceEntity) => void;
}) {
  const [mission, setMission] = useState(entity.brandDetails?.mission || "");
  const [description, setDescription] = useState(entity.brandDetails?.description || "");
  const [name, setName] = useState(entity.name);
  const [brandColors, setBrandColors] = useState(entity.brandDetails?.colors || { main: "#000000", support: "#666666", secondary: "#999999" });
  const [brandFonts, setBrandFonts] = useState(entity.brandDetails?.fonts || { primary: "Inter", secondary: "Inter", support: "Inter" });

  const save = () => {
    onUpdate({
      ...entity,
      name,
      brandDetails: {
        ...entity.brandDetails,
        mission,
        description,
        colors: brandColors,
        fonts: brandFonts,
        history: entity.brandDetails?.history || [],
      },
    });
  };

  return (
    <div className="p-8 h-full overflow-y-auto w-full max-w-4xl mx-auto flex flex-col gap-8 custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Brand Details</h2>
        <button
          onClick={save}
          className="px-8 py-2 bg-[var(--accent)] text-black font-black hover:brightness-110 rounded-xl transition-all shadow-xl shadow-[var(--accent)]/10 uppercase tracking-widest text-sm"
        >
          Save Identity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Brand Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors text-xl font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Brand Mission</label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={3}
              className="bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors resize-none"
              placeholder="What is the mission?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Detailed Bio</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors resize-none"
              placeholder="Detailed brand story..."
            />
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Identity Colors</label>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(brandColors).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex items-center justify-between bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]">
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">{k}</span>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-mono opacity-40">{v}</span>
                       <input 
                         type="color" 
                         value={v} 
                         onChange={(e) => setBrandColors({...brandColors, [k]: e.target.value})}
                         className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                       />
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Typography Palette</label>
              <div className="space-y-3">
                 {Object.entries(brandFonts).map(([k, v]: [string, any]) => (
                   <div key={k} className="flex flex-col gap-2">
                     <span className="text-[9px] font-black uppercase opacity-40 ml-1">{k} Font</span>
                     <input 
                        type="text" 
                        value={v} 
                        onChange={(e) => setBrandFonts({...brandFonts, [k]: e.target.value})}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm font-bold"
                      />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
