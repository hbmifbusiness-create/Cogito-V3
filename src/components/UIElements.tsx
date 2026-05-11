import React from 'react';

// Buttons
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ variant = 'primary', className = '', ...props }) => {
  const baseStyle = "flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-all rounded-lg outline-none min-h-[40px] px-4";
  const variants = {
    primary: "bg-[var(--accent)] text-[var(--accent-text)] hover:brightness-110 active:scale-95 shadow-md",
    secondary: "bg-[var(--bg-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 border border-[var(--border-color)]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]/50",
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
};

// Text Fields and Password Fields
export const TextField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{label}</label>}
      <input 
        className={`w-full bg-[var(--bg-muted)] border border-[var(--border-color)] rounded-lg px-4 min-h-[40px] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`} 
        {...props} 
      />
      {error && <span className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{error}</span>}
    </div>
  );
};

// Toggle Switches
export const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string }> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)] border border-[var(--border-color)]'}`}>
        <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      {label && <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">{label}</span>}
    </label>
  );
};

// Badges
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'accent' | 'danger' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: "bg-[var(--bg-muted)] text-[var(--text-secondary)] border-[var(--border-color)]",
    accent: "bg-[var(--accent)] text-black border-[var(--accent)]",
    danger: "bg-red-500/20 text-red-500 border-red-500/50"
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-solid ${styles[variant]}`}>
      {children}
    </span>
  );
};

// Cards
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const ExpandableCard: React.FC<{ 
  headerNode: React.ReactNode; 
  compactContent: React.ReactNode; 
  expandedContent: React.ReactNode; 
  className?: string;
}> = ({ headerNode, compactContent, expandedContent, className = '' }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-[var(--accent)] ring-opacity-50' : ''} ${className}`}>
      <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-muted)]/10 flex justify-between items-center gap-4">
        <div className="flex-1 min-w-0">{headerNode}</div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--accent)] hover:text-black transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className={`p-6 transition-all duration-300 ${isExpanded ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-muted)]/5'}`}>
        {isExpanded ? expandedContent : compactContent}
      </div>
    </div>
  );
};
