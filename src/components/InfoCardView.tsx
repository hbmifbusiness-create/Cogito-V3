import React from 'react';
import { WorkspaceEntity } from '../types';
import { Target, Paintbrush, BarChart, DollarSign, Image as ImageIcon, Activity } from 'lucide-react';

export function InfoCardView({ entity }: { entity: WorkspaceEntity }) {
  const brand = entity.brandDetails;
  if (!brand) return null;

  // Helpers to check if field exists
  const hasData = (val: any) => {
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  };

  // Finance Summary
  const income = brand.financials?.earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const oneOffExpenses = brand.financials?.oneOffCosts?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const recurringExpenses = brand.financials?.recurringCosts?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const expenses = oneOffExpenses + recurringExpenses;
  const profit = income - expenses;

  return (
      <div className="h-full overflow-y-auto custom-scrollbar w-full flex flex-col items-center bg-[var(--bg-primary)]">
        <div className="p-8 w-full max-w-6xl space-y-12 pb-24">
            {/* Header summary */}
            <div className="space-y-4">
               <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter border-b-8 border-[var(--accent)] pb-2 inline-block">Brand Manifesto</h2>
               <p className="text-sm font-black uppercase tracking-widest opacity-40">Complete Brand Intelligence & Identity Summary</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vitals Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Core Strategy */}
                    {(hasData(entity.name) || hasData(brand.mission) || hasData(brand.description)) && (
                        <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="text-[var(--accent)]" size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs opacity-60">Core Strategy</h3>
                            </div>
                            {hasData(entity.name) && (
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40">Identity Name</label>
                                    <p className="text-3xl font-bold font-display">{entity.name}</p>
                                </div>
                            )}
                            {hasData(brand.mission) && (
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40">The Mission</label>
                                    <p className="text-lg md:text-xl font-medium leading-relaxed italic text-[var(--text-primary)]">"{brand.mission}"</p>
                                </div>
                            )}
                            {hasData(brand.description) && (
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40">Brand Narrative</label>
                                    <p className="opacity-80 leading-relaxed text-sm whitespace-pre-wrap">{brand.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Identity Assets */}
                    {(hasData(brand.logo) || hasData(brand.colors) || hasData(brand.fonts)) && (
                        <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-8">
                             <div className="flex items-center gap-2 mb-4">
                                <Paintbrush className="text-[var(--accent)]" size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs opacity-60">Visual Identity</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {hasData(brand.logo) && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 block mb-3">Primary Mark</label>
                                        <div className="bg-[var(--bg-primary)] p-8 rounded-2xl border border-[var(--border-color)] flex items-center justify-center min-h-[200px]">
                                           <img src={brand.logo} alt="Logo" className="max-h-40 object-contain hover:scale-105 transition-transform" />
                                        </div>
                                    </div>
                                 )}

                                 {hasData(brand.colors) && (
                                     <div>
                                        <label className="text-[10px] font-black uppercase opacity-40 block mb-3">Colour Palette</label>
                                        <div className="flex flex-wrap gap-3">
                                            {Array.isArray(brand.colors) ? brand.colors.map((c, i) => (
                                                <div key={i} className="group relative">
                                                    <div className="w-14 h-14 rounded-2xl border border-[var(--border-color)] shadow-sm transition-transform hover:scale-110 active:scale-95" style={{ backgroundColor: c }} />
                                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-surface)] px-1 rounded border border-[var(--border-color)] z-10">{c}</span>
                                                </div>
                                            )) : Object.entries(brand.colors).map(([name, c], i) => (
                                                <div key={i} className="flex items-center gap-3 bg-[var(--bg-primary)] px-4 py-2 rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors">
                                                    <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: c as string }} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{name}</span>
                                                        <span className="text-[9px] font-mono opacity-40">{c as string}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                 )}
                            </div>

                            {hasData(brand.fonts) && (
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-40 block mb-3">Typography System</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                         {Array.isArray(brand.fonts) ? brand.fonts.map((f, i) => (
                                             <div key={i} className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] hover:shadow-md transition-all">
                                                <span className="text-[9px] font-black uppercase opacity-30 block mb-1">{f.type}</span>
                                                <span className="font-bold text-sm block truncate">{f.name}</span>
                                                <span className="text-[8px] opacity-40 uppercase tracking-widest">{f.fontFamilyType}</span>
                                             </div>
                                         )) : Object.entries(brand.fonts).map(([type, name], i) => (
                                             <div key={i} className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)]">
                                                <span className="text-[9px] font-black uppercase opacity-30 block mb-1">{type}</span>
                                                <span className="font-bold text-sm block truncate">{name as string}</span>
                                             </div>
                                         ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mood Summary */}
                    <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm border-l-8 border-l-[var(--accent)]">
                         <div className="flex items-center gap-2 mb-6">
                            <Activity className="text-[var(--accent)]" size={20} />
                            <h3 className="font-bold uppercase tracking-widest text-xs opacity-60">Brand Vibe & Atmosphere</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-8 bg-[var(--bg-muted)]/10 rounded-2xl italic text-[var(--text-secondary)] border border-[var(--border-color)]/20 relative group">
                                <div className="absolute -top-3 -right-3 bg-[var(--accent)] text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">AI Predicted</div>
                                <p className="text-base leading-relaxed">
                                    Based on the active visual markers and brand narrative, the atmosphere is defined by a sense of modern impact and structured elegance. 
                                    The chosen palette suggests a core of stability with highlights of distinctive energy, while the typography system reinforces 
                                    a narrative of professional clarity and authoritative presence. The resulting "vibe" is one of considered innovation—designed 
                                    to bridge the gap between traditional reliability and future-focused agility.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-[10px] font-black uppercase bg-[var(--accent)] text-black px-6 py-2 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/20">Refine AI Summary</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    {/* Finance Snapshot */}
                    <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl shadow-[var(--accent)]/5">
                         <div className="flex items-center gap-2 mb-8 text-[var(--accent)]">
                            <DollarSign size={20} />
                            <h3 className="font-black uppercase tracking-widest text-xs">Full-Cycle Outcome</h3>
                        </div>
                        <div className="space-y-8">
                             <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase opacity-40">Total Revenue</span>
                                    <span className="text-xs font-bold opacity-60">Verified Lifetime</span>
                                </div>
                                <span className="text-xl font-bold font-mono text-green-500">+${income.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase opacity-40">Total Burn</span>
                                    <span className="text-xs font-bold opacity-60">Operational Overhead</span>
                                </div>
                                <span className="text-xl font-bold font-mono text-red-500">-${expenses.toLocaleString()}</span>
                             </div>
                             <div className="pt-6 border-t-2 border-dashed border-[var(--border-color)] flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest">Net Profit</span>
                                <span className={`text-4xl font-black font-mono tracking-tighter ${profit >= 0 ? "text-[var(--accent)]" : "text-red-500"}`}>
                                    ${profit.toLocaleString()}
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* Reach Snapshot */}
                    <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm">
                         <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
                            <BarChart size={20} />
                            <h3 className="font-black uppercase tracking-widest text-xs">Market Reach</h3>
                        </div>
                        <div className="space-y-6">
                            <p className="text-xs opacity-60 uppercase font-black leading-tight tracking-wider">The brand identity is currently propagating across marketing layers. Visibility thresholds are maintaining positive alignment with strategy goals.</p>
                            <div className="space-y-2">
                                 <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--accent)] w-3/4 animate-pulse" />
                                 </div>
                                 <div className="flex justify-between items-baseline">
                                    <span className="text-[9px] font-black uppercase opacity-40">Strategic Visibility Index</span>
                                    <span className="text-lg font-black text-[var(--accent)]">78%</span>
                                 </div>
                            </div>
                        </div>
                    </div>

                     {/* Physical Assets */}
                     <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm">
                         <div className="flex items-center gap-2 mb-8 text-[var(--accent)]">
                            <ImageIcon size={20} />
                            <h3 className="font-black uppercase tracking-widest text-xs">Identity Assets</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-6 bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--border-color)] group hover:border-[var(--accent)] transition-colors">
                                 <span className="block text-4xl font-black mb-1 group-hover:scale-110 transition-transform">{brand.icons?.length || 0}</span>
                                 <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">Iconography</span>
                            </div>
                            <div className="text-center p-6 bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--border-color)] group hover:border-[var(--accent)] transition-colors">
                                 <span className="block text-4xl font-black mb-1 group-hover:scale-110 transition-transform">{brand.images?.length || 0}</span>
                                 <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">Imagery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
}
