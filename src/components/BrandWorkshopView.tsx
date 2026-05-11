import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Target, Palette, Type, Globe, Compass, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    id: "purpose",
    title: "Core Purpose",
    description: "Define the 'Why' behind your brand.",
    icon: <Compass size={24} />,
    questions: [
      "What core problem does your brand solve?",
      "Who is your absolute ideal audience?",
      "What are the three core values you'll never compromise on?"
    ]
  },
  {
    id: "persona",
    title: "Brand Persona",
    description: "If your brand was a person, who would they be?",
    icon: <Target size={24} />,
    questions: [
      "Is the tone more serious or playful?",
      "How does your brand talk to its community?",
      "What personality traits should people associate with you?"
    ]
  },
  {
    id: "visuals",
    title: "Visual DNA",
    description: "The mood, style, and visual language.",
    icon: <Palette size={24} />,
    questions: [
      "Which design styles resonate most (Brutalism, Bauhaus, etc)?",
      "What primary emotion should your colors evoke?",
      "Do you prefer sharp, geometric lines or organic, flowing shapes?"
    ]
  },
  {
    id: "identity",
    title: "Identity Check",
    description: "Synthesizing name, fonts, and core assets.",
    icon: <CheckCircle2 size={24} />,
    questions: [
      "Does the potential brand name feel authentic?",
      "Which font pairings represent the 'voice' best?",
      "Is the identity consistent across all digital touchpoints?"
    ]
  }
];

export function BrandWorkshopView({ entity, onUpdate }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      synthesizeBrand();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const synthesizeBrand = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
        // AI Logic would go here to update brand details based on answers
        setIsSynthesizing(false);
        alert("Brand DNA Synthesized! Your brand details have been updated based on the workshop.");
    }, 3000);
  };

  const currentStepData = STEPS[currentStep];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
            <div>
                <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-[var(--text-primary)]">Brand Workshop</h1>
                <p className="text-[var(--text-secondary)] mt-2 italic flex items-center gap-2">
                    <Sparkles size={16} className="text-[var(--accent)]" /> Guided AI Brand Creation Flow
                </p>
            </div>
            <div className="flex gap-2">
                {STEPS.map((_, i) => (
                    <div 
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? "w-8 bg-[var(--accent)]" : i < currentStep ? "w-4 bg-[var(--text-primary)] opacity-40" : "w-4 bg-[var(--border-color)]"}`}
                    />
                ))}
            </div>
        </div>

        <section className="flex-1 flex flex-col gap-12">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-12"
                >
                    <div className="lg:col-span-2 space-y-6">
                        <div className="w-16 h-16 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-[24px] flex items-center justify-center text-[var(--accent)]">
                            {currentStepData.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">{currentStepData.title}</h3>
                            <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">{currentStepData.description}</p>
                        </div>
                        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                                <Sparkles size={12} /> AI Strategy Tip
                             </h4>
                             <p className="text-xs text-indigo-500/80 leading-relaxed italic">
                                "Think about the emotional resonance. A brand isn't just what you do, it's how you make people feel when you do it."
                             </p>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-8">
                        {currentStepData.questions.map((q, i) => (
                            <div key={i} className="space-y-3">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{q}</label>
                                <textarea 
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 focus:border-[var(--accent)] outline-none transition-all text-sm min-h-[100px] resize-none"
                                    placeholder="Type your thoughts here..."
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex justify-between items-center">
            <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-0 transition-all"
            >
                <ArrowLeft size={18} /> Previous Step
            </button>
            <button 
                onClick={handleNext}
                className="group flex items-center gap-3 px-10 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all"
            >
                {currentStep === STEPS.length - 1 ? (
                    isSynthesizing ? "Finalizing DNA..." : "Synthesize Brand"
                ) : (
                    <>Next Step <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
            </button>
        </div>
      </div>

      {isSynthesizing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex flex-col items-center justify-center text-center p-12">
            <div className="w-64 h-64 relative mb-12">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-4 border-indigo-500 rounded-full"
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-r-4 border-cyan-500 rounded-full opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={48} className="text-white animate-pulse" />
                </div>
            </div>
            <h2 className="text-4xl font-display font-black uppercase text-white tracking-widest mb-4">Synthesizing DNA</h2>
            <p className="text-xl text-white/40 italic">Cogito AI is weaving your answers into a cohesive brand identity...</p>
        </div>
      )}
    </div>
  );
}
