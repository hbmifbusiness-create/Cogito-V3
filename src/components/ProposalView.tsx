import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Sparkles, Send, Share2, Eye, ShieldCheck, Zap } from "lucide-react";

export function ProposalView({ entity, onUpdate }: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState(entity.proposal || null);

  const generateProposal = () => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
      const newProposal = {
        title: `${entity.name} Strategic Proposal`,
        date: new Date().toLocaleDateString(),
        summary: `This proposal outlines the strategic direction for ${entity.name}. Focused on leveraging current market trends and the brand's unique identity, we aim to scale operations by 40% over the next quarter.`,
        objectives: [
          "Redefine visual identity for digital-first spaces",
          "Establish high-impact community engagement protocols",
          "Streamline financial reporting and asset management"
        ],
        nextSteps: [
            "Finalize moodboard and brand guidelines",
            "Initialize social media cross-posting campaign",
            "Conduct quarterly financial review"
        ],
        author: "Cogito AI Intelligence"
      };
      setProposal(newProposal);
      onUpdate({ ...entity, proposal: newProposal });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-8 overflow-y-auto custom-scrollbar">
      {!proposal ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full"></div>
                <div className="w-24 h-24 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-[32px] flex items-center justify-center relative z-10">
                    <FileText size={40} className="text-[var(--text-muted)]" />
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-[var(--text-primary)]">Strategic Proposals</h2>
                <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
                    Generate production-ready project proposals and brand summaries powered by Cogito AI. 
                    Our analysis engine synthesizes your strategy, moodboards, and financial data into a cohesive roadmap.
                </p>
            </div>
            <button 
                onClick={generateProposal}
                disabled={isGenerating}
                className="group relative px-12 py-5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="flex items-center gap-3 relative z-10">
                    {isGenerating ? <Zap className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isGenerating ? "Synthesizing Strategy..." : "Generate AI Proposal"}
                </span>
            </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full space-y-12 pb-24">
            {/* Proposal Content */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] p-12 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 flex gap-3">
                    <button className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:bg-[var(--bg-muted)] transition-colors"><Share2 size={18} /></button>
                    <button className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:bg-[var(--bg-muted)] transition-colors"><Download size={18} /></button>
                </div>

                <div className="flex items-center gap-4 mb-12">
                    <div className="px-4 py-2 bg-[var(--accent)] text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Verified by Cogito AI
                    </div>
                    <span className="text-xs font-mono opacity-40">{proposal.date}</span>
                </div>

                <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-[var(--text-primary)] mb-8 leading-[0.9]">
                    {proposal.title}
                </h1>

                <div className="space-y-12">
                    <section>
                         <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)] mb-4">Executive Summary</h3>
                         <p className="text-xl text-[var(--text-secondary)] leading-relaxed font-medium italic border-l-4 border-[var(--accent)] pl-8">
                             "{proposal.summary}"
                         </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)] mb-4">Key Objectives</h3>
                            <ul className="space-y-4">
                                {proposal.objectives.map((obj: string, i: number) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="w-6 h-6 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">{i+1}</div>
                                        <p className="text-[var(--text-secondary)] font-bold">{obj}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)] mb-4">Next Steps</h3>
                            <ul className="space-y-4">
                                {proposal.nextSteps.map((step: string, i: number) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                                        <p className="text-[var(--text-secondary)] font-bold">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500"></div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">{proposal.author}</p>
                            <p className="text-[10px] opacity-40">Intelligence Protocol v4.2</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-3 px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-bold text-sm">
                        <Send size={16} /> Submit to Brand Team
                    </button>
                </div>
            </motion.div>

            {/* AI Assistant Context */}
            <div className="grid grid-cols-3 gap-6">
                <button className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] text-left hover:border-[var(--accent)] transition-all group">
                    <Sparkles className="text-purple-500 mb-4 group-hover:animate-spin-slow" size={24} />
                    <h4 className="font-bold text-[var(--text-primary)]">Tone Adjustment</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Transform the proposal into Formal, Bold, or Minimal styles.</p>
                </button>
                <button className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] text-left hover:border-[var(--accent)] transition-all group">
                    <Zap className="text-cyan-500 mb-4" size={24} />
                    <h4 className="font-bold text-[var(--text-primary)]">Quick Summary</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Condense this 4-page proposal into a single slide or tweet.</p>
                </button>
                <button 
                  onClick={() => setProposal(null)}
                  className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] text-left hover:border-red-500 transition-all group"
                >
                    <RefreshCw className="text-rose-500 mb-4" size={24} />
                    <h4 className="font-bold text-[var(--text-primary)]">Regenerate Data</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Sync proposal with newest financial and moodboard updates.</p>
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
