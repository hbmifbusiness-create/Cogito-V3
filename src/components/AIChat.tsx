import React, { useState } from 'react';
import { Sparkles, X, Send, User, Bot, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your workspace intelligence assistant. I've just been updated with a comprehensive guide on 60+ graphic design styles including Brutalism, Bauhaus, Cybercore, and more. I can help you analyze your brand strategy, suggest aesthetics for your next project, or manage your workspace. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');

  const DESIGN_STYLES_KNOWLEDGE = `
Design Styles Reference (Updated with Cogito Focus Styles):

- BRUTALISM: Raw, unpolished, and bold. Features heavy grid-based structures, high-contrast monochrome or limited palettes, and visible structural elements. Uses sans-serif typography like Archivo Black. Ideal for making a strong, uncompromising statement.
- GRUNGE: Distressed, dirty, and textured. Irregular shapes, muted earthy colors (burgundy, charcoal), and layered, hand-drawn elements. Reflects a rebellious, non-conformist energy.
- ANTHROPOMORPHIC: Friendly, playful, and expressive. Attributes human-like characteristics to non-human elements. Soft curves, expressive icons, and organic, warm colors (amber, cream).
- BAUHAUS: Geometric clarity and functional simplicity. Rooted in primary colors (red, blue, yellow) and clean, balanced layouts. Focuses on the harmony between art and industry using sans-serif fonts like Montserrat.
- CYBERCORE: Futuristic, digital, and neon-lit. Metallic chrome textures, cyan/pink/blue gradients, and digital speed aesthetics. High-tech, forward-thinking energy.
- RUBBERHOSE: 1920s animation spirit. Bouncy, flexible limbs, black-and-white or high-contrast limited color, and whimsical, playful motion. Expressive and nostalgic.

Other Styles:
- Acanthus: Decorative stylized leaves, classical symmetry.
- Art Deco: Bold geometric, symmetry, metallic, high-contrast type.
- Art Nouveau: Flowing organic lines, nature-inspired detail.
- Aurora: Luminous gradients, soft cosmic glow.
- Baroque: Dramatic lavish ornamentation, intense contrast.
- Bento Grid: Organized sections, clean UI compartmentalization.
- Biomorphic: Soft organic forms, nature-based flow.
- Bohemian: Global influences, layered textures, earthy.
- Chinoiserie: East Asian motifs via Western lens, intricate.
- Conceptual Sketch (Doodle): Spontaneous, playful unpolished energy.
- Coquette: Romantic, soft pastel, bows and lace, nostalgic.
- Ethereal: Soft hues, blurry/dreamy imagery.
- Farmhouse/Cottage-core: Rustic simplicity, cozy countryside.
- Filigree: Intricate patterns, lacy, jewelry-inspired.
- Future Medieval: Ancient symbols + digital futuristic aesthetics.
- Gothic: Dramatic darkness, grandeur, blackletter type.
- Graffiti: Urban, spray-painted, rebellious raw energy.
- Japandi: Japanese minimalism + Scandi warmth, organic.
- Kawaii: Cute, rounded, pastel, cartoon characters.
- Kidcore: Childhood visuals, crayons, playful imperfection.
- Kitsch: Ironic tackiness, retro pop culture, humorous.
- Luxury Typography: Refined custom fonts, elegant scripts.
- Memphis: Bold geometry, 80s patterns, loud colors.
- Mixed Media: Multi-medium layering, unexpected juxtapositions.
- Mystical Western: Cowboy + celestial, spiritual symbols.
- Naive: Childlike, openly human, imperfect honesty.
- Neoclassical: Classically balanced, simple grandeur.
- Pixel Art: 8-bit, blocky nostalgia, colorful grids.
- Pointillism: Tiny dots blending visually, tactile.
- Pop Art: Repetition, vivid colors, consumerist icons.
- Risograph: Layered spot colors, grain, tactile ink.
- Romantasy: Medieval symbols, ornate type, dramatic lighting.
- Rocketpunk: Mid-century science forward, space-age optimism.
- Rubberhose: 1920s animation, bendy limbs, playful motion.
- Shabby Chic: Distressed pastel florals, vintage charm.
- Steampunk: Victorian tech, brass gears, steam power.
- Synthwave: Retro 80s, neon sunset grids.
- Tenebrism: Darkness as active element, extreme contrast.
- 3x3 Grid: Structured 9-box layout, orderly.
- Trinket: Curated archives, catalog-style collections.
- Type-collage: Type as main visual material, layered.
- Vaporwave: Glitchy, Greek busts, 90s nostalgia.
- Victorian: Highly ornate, maximalist florals, jewel tones.
- Y2K: Metallic chrome, neon gradients, bubble fonts.
`;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemInstruction: `You are the Cogito AI Creative Director for a DJ management and brand strategy platform. 
          You have expert knowledge of the following design styles: ${DESIGN_STYLES_KNOWLEDGE}.
          Help the user brainstorm ideas for their brands, projects, and events. 
          Provide strategic, analytical, and creative advice. 
          Keep responses concise but insightful.`
        })
      });

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.content
        }]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (error: any) {
      console.error("AI Chat failed:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}. Please check your GEMINI_API_KEY.`
      }]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            className="fixed top-4 right-4 bottom-4 w-[450px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-[40px] flex flex-col z-[101] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[var(--accent)] text-black rounded-2xl shadow-lg shadow-[var(--accent)]/20">
                  <Sparkles size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Creative AI</h3>
                  <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Workspace Intelligence Active</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-muted)] rounded-xl transition-all"
              >
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[var(--bg-muted)]' : 'bg-[var(--accent)] text-black'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-[24px] text-[13px] leading-relaxed font-medium ${
                    msg.role === 'user' 
                    ? 'bg-[var(--bg-muted)]/50 text-[var(--text-primary)] rounded-tr-none' 
                    : 'bg-[var(--bg-muted)] text-[var(--text-primary)] rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-surface)]/50 backdrop-blur-xl">
              <div className="relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask me anything about your brands..."
                  className="w-full bg-[var(--bg-muted)]/50 border border-[var(--border-color)] rounded-3xl p-4 pr-14 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)] transition-all resize-none h-[100px] custom-scrollbar"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute bottom-4 right-4 p-2 bg-[var(--accent)] text-black rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:bg-[var(--bg-muted)]"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">
                 <div className="flex items-center gap-2">
                   <Command size={10} />
                   <span>Enter to Send</span>
                 </div>
                 <span>Analysis Powered by Gemini</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
