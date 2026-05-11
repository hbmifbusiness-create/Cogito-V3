import React, { useState, useRef } from "react";
import { 
  Plus, 
  Upload, 
  Share2, 
  Sparkles, 
  Trash2, 
  Grid, 
  Layout, 
  Check, 
  X,
  RefreshCw,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Moodboard, MoodboardItem, MoodboardSection, WorkspaceEntity } from "../types";
import { fetchPinterestBoards, fetchBoardPins } from "../services/pinterestService";

interface Props {
  entity: WorkspaceEntity;
  onUpdate: (updates: Partial<WorkspaceEntity>) => void;
}

export function MoodboardView({ entity, onUpdate }: Props) {
  const brand = entity.brandDetails!;
  const moodboard = brand.moodboard || { items: [], sections: [] };
  const pinterest = brand.pinterest || { connected: false, boards: [] };

  const [uploading, setUploading] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const [showPinterestBoardPicker, setShowPinterestBoardPicker] = useState(false);
  const [selectedPinBoard, setSelectedPinBoard] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMoodboard = (updates: Partial<Moodboard>) => {
    onUpdate({
      brandDetails: {
        ...brand,
        moodboard: {
          ...moodboard,
          ...updates,
        }
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newItems: MoodboardItem[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // In this environment, we don't have a real backend to save files, 
        // so we'll use URL.createObjectURL for demo purposes.
        // In a real app, you'd upload to S3/Firebase Storage.
        const url = URL.createObjectURL(file);
        newItems.push({
            id: `mb-${Date.now()}-${i}`,
            url,
            type: 'image',
            tags: [],
            suggestedTags: [],
            x: 0,
            y: 0,
        });
    }

    updateMoodboard({ items: [...moodboard.items, ...newItems] });
    setUploading(false);
  };

  const handlePinterestConnect = async () => {
    try {
        const res = await fetch("/api/auth/pinterest/url");
        if (!res.ok) {
            const errData = await res.json();
            alert(`Pinterest Auth Error: ${errData.error || res.statusText}\n\nPlease ensure you have configured PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET in the AI Studio Secrets panel.`);
            return;
        }
        const { url } = await res.json();
        
        if (!url) {
            alert("Could not retrieve Pinterest authorization URL.");
            return;
        }
        
        const win = window.open(url, "PinterestAuth", "width=600,height=700");
        
        const messageHandler = (event: MessageEvent) => {
            if (event.data.type === 'OAUTH_AUTH_SUCCESS') {
                const { tokens } = event.data;
                onUpdate({
                    brandDetails: {
                        ...brand,
                        pinterest: {
                            connected: true,
                            accessToken: tokens.access_token,
                            boards: []
                        }
                    }
                });
                loadPinterestBoards(tokens.access_token);
                window.removeEventListener('message', messageHandler);
            }
        };
        
        window.addEventListener('message', messageHandler);
    } catch (err) {
        console.error("Pinterest connect failed", err);
    }
  };

  const loadPinterestBoards = async (token: string) => {
      const items = await fetchPinterestBoards(token);
      onUpdate({
          brandDetails: {
              ...brand,
              pinterest: {
                  ...brand.pinterest!,
                  boards: items.map((i: any) => ({
                      id: i.id,
                      name: i.name,
                      image: i.image_thumbnail_url
                  }))
              }
          }
      });
      setShowPinterestBoardPicker(true);
  };

  const importPinterestBoard = async (boardId: string) => {
      if (!pinterest.accessToken) return;
      
      const pins = await fetchBoardPins(pinterest.accessToken, boardId);
      const newItems: MoodboardItem[] = pins.map((p: any, idx: number) => ({
          id: `pin-${p.id}-${idx}`,
          url: p.media.images['600x'].url,
          type: 'image',
          tags: [],
          suggestedTags: [],
          x: 0,
          y: 0,
          name: p.title
      }));
      
      updateMoodboard({ items: [...moodboard.items, ...newItems] });
      setShowPinterestBoardPicker(false);
  };

  const runAnalysis = async (itemId: string) => {
      const item = moodboard.items.find(i => i.id === itemId);
      if (!item) return;

      setAnalyzingIds(prev => [...prev, itemId]);
      
      try {
          const res = await fetch("/api/ai/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: item.url })
          });
          
          if (!res.ok) throw new Error("AI analysis failed");
          const result = await res.json();
          
          if (result) {
              const updatedItems = moodboard.items.map(i => 
                  i.id === itemId ? { ...i, suggestedTags: result.tags, style: result.style, theme: result.theme, palette: result.palette } : i
              );
              updateMoodboard({ items: updatedItems });
          }
      } catch (err) {
          console.error("AI Analysis error", err);
          alert("AI Analysis failed. Make sure the image URL is accessible.");
      } finally {
          setAnalyzingIds(prev => prev.filter(id => id !== itemId));
      }
  };

  const acceptSuggestions = (itemId: string) => {
      const updatedItems = moodboard.items.map(i => {
          if (i.id === itemId && i.suggestedTags) {
              return { ...i, tags: Array.from(new Set([...i.tags, ...i.suggestedTags])), suggestedTags: [] };
          }
          return i;
      });
      updateMoodboard({ items: updatedItems });
  };

  const addSection = (name: string) => {
      const newSection: MoodboardSection = {
          id: `sec-${Date.now()}`,
          name,
      };
      updateMoodboard({ sections: [...moodboard.sections, newSection] });
  };

  const moveItemToSection = (itemId: string, sectionId: string) => {
       const updatedItems = moodboard.items.map(i => 
          i.id === itemId ? { ...i, sectionId } : i
      );
      updateMoodboard({ items: updatedItems });
  };

  const autoSortByAI = () => {
       // Create sections based on themes or styles found in items
       const themes = Array.from(new Set(moodboard.items.map(i => i.theme).filter(Boolean)));
       const newSections: MoodboardSection[] = themes.map(t => ({
           id: `ai-sec-${t}`,
           name: t!,
       }));
       
       const updatedItems = moodboard.items.map(i => {
           if (i.theme) {
               return { ...i, sectionId: `ai-sec-${i.theme}` };
           }
           return i;
       });
       
       updateMoodboard({ 
           sections: [...moodboard.sections, ...newSections],
           items: updatedItems 
       });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header / Controls */}
      <div className="flex items-center justify-between bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-text)] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
                <Upload size={16} /> Bulk Upload
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
            />
            
            <button 
                onClick={handlePinterestConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E60023] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
                 Pinterest
            </button>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => addSection('New Section')}
                className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-muted)]"
                title="Add Section"
            >
                <Layout size={18} />
            </button>
            <button 
                onClick={autoSortByAI}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
            >
                <Sparkles size={16} /> AI Auto-Sort
            </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-12 pb-24">
        {/* Uncategorized Items */}
        <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 px-2">Uncategorized</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {moodboard.items.filter(i => !i.sectionId).map(item => (
                    <MoodboardCard 
                        key={item.id} 
                        item={item} 
                        isAnalyzing={analyzingIds.includes(item.id)}
                        onAnalyze={() => runAnalysis(item.id)}
                        onAcceptSuggestions={() => acceptSuggestions(item.id)}
                        onDelete={() => updateMoodboard({ items: moodboard.items.filter(i => i.id !== item.id) })}
                        sections={moodboard.sections}
                        onMove={(secId) => moveItemToSection(item.id, secId)}
                    />
                ))}
            </div>
        </section>

        {/* Defined Sections */}
        <AnimatePresence>
            {moodboard.sections.map(section => (
                <section key={section.id} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                           <Layout size={16} className="text-[var(--accent)]" />
                           <h3 className="text-sm font-bold uppercase tracking-widest">{section.name}</h3>
                        </div>
                        <button 
                            onClick={() => updateMoodboard({ sections: moodboard.sections.filter(s => s.id !== section.id) })}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[100px] border-2 border-dashed border-transparent hover:border-[var(--border-color)] rounded-2xl p-2 transition-colors">
                        {moodboard.items.filter(i => i.sectionId === section.id).map(item => (
                            <MoodboardCard 
                                key={item.id} 
                                item={item} 
                                isAnalyzing={analyzingIds.includes(item.id)}
                                onAnalyze={() => runAnalysis(item.id)}
                                onAcceptSuggestions={() => acceptSuggestions(item.id)}
                                onDelete={() => updateMoodboard({ items: moodboard.items.filter(i => i.id !== item.id) })}
                                sections={moodboard.sections}
                                onMove={(secId) => moveItemToSection(item.id, secId)}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </AnimatePresence>
      </div>

      {/* Pinterest Board Picker Modal */}
      {showPinterestBoardPicker && (
          <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Import Pinterest Board</h3>
                      <button onClick={() => setShowPinterestBoardPicker(false)}><X size={24} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
                      {pinterest.boards.map(board => (
                          <button 
                            key={board.id}
                            onClick={() => importPinterestBoard(board.id)}
                            className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all text-left"
                          >
                              {board.image && <img src={board.image} className="w-full h-32 object-cover rounded-lg" />}
                              <p className="font-bold">{board.name}</p>
                              <div className="flex items-center gap-1 text-xs opacity-60">
                                  <Plus size={12} /> Import Pins
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function MoodboardCard({ item, onAnalyze, isAnalyzing, onAcceptSuggestions, onDelete, sections, onMove }: { 
    item: MoodboardItem, 
    onAnalyze: () => void, 
    isAnalyzing: boolean,
    onAcceptSuggestions: () => void,
    onDelete: () => void,
    sections: MoodboardSection[],
    onMove: (secId: string) => void
}) {
    const [showActions, setShowActions] = useState(false);

    return (
        <motion.div 
            layout
            className="group relative rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="aspect-[4/5] relative">
                <img src={item.url} className="w-full h-full object-cover" />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end gap-1">
                        <button 
                            onClick={onDelete}
                            className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={onAnalyze}
                            disabled={isAnalyzing}
                            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-text)] text-xs font-bold transition-transform hover:scale-105 active:scale-95 ${isAnalyzing ? 'animate-pulse' : ''}`}
                        >
                            {isAnalyzing ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Tags Section (if any) */}
            {(item.suggestedTags && item.suggestedTags.length > 0) ? (
                <div className="p-3 bg-[var(--accent)]/10 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">AI Suggestions</span>
                        <div className="flex gap-1">
                            <button onClick={onAcceptSuggestions} className="p-1 rounded bg-[var(--accent)] text-[var(--accent-text)]"><Check size={8} /></button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {item.suggestedTags.map(tag => (
                            <span key={tag} className="text-[10px] bg-white/50 px-2 py-1 rounded border border-[var(--border-color)]">#{tag}</span>
                        ))}
                    </div>
                    {item.style && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px]">
                            <span className="opacity-60">Style:</span> <span className="font-bold">{item.style}</span>
                        </div>
                    )}
                </div>
            ) : item.tags.length > 0 && (
                <div className="p-3">
                     <div className="flex flex-wrap gap-1">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-[var(--bg-surface)] px-2 py-1 rounded opacity-70">#{tag}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Move to Section */}
            <div className="border-t border-[var(--border-color)] p-2">
                <select 
                    className="w-full text-[10px] bg-transparent outline-none cursor-pointer"
                    value={item.sectionId || ''}
                    onChange={(e) => onMove(e.target.value)}
                >
                    <option value="">Move to section...</option>
                    {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>
        </motion.div>
    );
}
