import React, { useState } from "react";
import { Check, ChevronDown, Share2, ExternalLink, Moon, Sun, Monitor, Cloud, Fingerprint, Accessibility, Calendar as CalendarIcon, Info, Github, Twitter, Instagram } from "lucide-react";

export function SettingsView({
  entities,
  theme,
  setTheme,
  activeTab,
  calendarConfig,
  setCalendarConfig,
  activeBrandThemeId,
  setActiveBrandThemeId,
  accessibilitySettings,
  setAccessibilitySettings,
}: any) {
  const brandEntities = entities.filter((e: any) => e.type === "brand");
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);

  const themePresets = [
    { id: "brutalism", name: "Brutalism", description: "Bold, raw and heavy typography", primary: "#000000", font: "Archivo Black" },
    { id: "grunge", name: "Grunge", description: "Rough textures and distressed details", primary: "#991B1B", font: "Special Elite" },
    { id: "anthropomorphic", name: "Anthropomorphic", description: "Soft shapes and playful energy", primary: "#F59E0B", font: "Fredoka" },
    { id: "bauhaus", name: "Bauhaus", description: "Geometric clarity and primary colors", primary: "#DC2626", font: "Montserrat" },
    { id: "cybercore", name: "Cybercore", description: "Neon gradients and digital speed", primary: "#38BDF8", font: "Orbitron" },
    { id: "rubberhose", name: "Rubberhose", description: "Vintage cartoon bouncy aesthetic", primary: "#18181B", font: "Bungee" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-12 max-w-5xl mx-auto w-full custom-scrollbar">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-[var(--text-primary)]">
          {activeTab === 'appearance' ? 'Appearance & Theme' : 
           activeTab === 'accounts' ? 'Linked Accounts' :
           activeTab === 'accessibility' ? 'Accessibility' :
           activeTab === 'calendar' ? 'Calendar Settings' : 'System Information'}
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Configure how the workspace looks and behaves to match your creative flow.
        </p>
      </div>

      {activeTab === "appearance" && (
        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Cloud size={20} className="text-[var(--accent)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Base Mode</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', name: 'Light', icon: <Sun size={20} /> },
                { id: 'dark', name: 'Dark', icon: <Moon size={20} /> },
                { id: 'system', name: 'System', icon: <Monitor size={20} /> }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTheme(m.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 ${theme === m.id ? 'border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--text-primary)]' : 'border-[var(--border-color)] hover:border-[var(--text-muted)] text-[var(--text-secondary)]'}`}
                >
                  {m.icon}
                  <span className="font-bold">{m.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Fingerprint size={20} className="text-[var(--accent)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Visual Style & Typography</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themePresets.map((preset) => (
                <button
                  key={preset.id}
                  className={`p-6 rounded-3xl border-2 text-left transition-all group relative overflow-hidden ${theme === preset.id ? 'border-[var(--accent)] bg-[var(--bg-surface)]' : 'border-[var(--border-color)] hover:border-[var(--text-muted)] bg-[var(--bg-muted)]/10'}`}
                  onClick={() => setTheme(preset.id)}
                >
                  <div className="relative z-10">
                    <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">{preset.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{preset.description}</p>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-[var(--text-muted)]">
                          Font: {preset.font}
                        </span>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                    </div>
                  </div>
                  {theme === preset.id && (
                    <div className="absolute top-4 right-4 text-[var(--accent)]">
                      <Check size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-8 border-t border-[var(--border-color)] pt-8">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[var(--bg-surface)] to-transparent rounded-3xl border border-[var(--border-color)]">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Dynamic Brand Theming</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Automatically adapt the UI colors based on your active brand entity.</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setBrandsDropdownOpen(!brandsDropdownOpen)}
                    className={`px-6 py-3 rounded-xl border flex items-center gap-3 font-bold transition-all ${theme === 'brand' ? 'border-[var(--accent)] text-[var(--text-primary)] bg-[var(--bg-surface)]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                  >
                    {theme === 'brand' ? entities.find((e: any) => e.id === activeBrandThemeId)?.name || 'Select Brand' : 'Disabled'}
                    <ChevronDown size={16} className={`transition-transform ${brandsDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {brandsDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-2xl z-30 p-2 overflow-hidden backdrop-blur-xl">
                      {brandEntities.map((b: any) => (
                        <button
                          key={b.id}
                          className="w-full text-left p-3 hover:bg-[var(--bg-muted)] rounded-xl flex flex-col gap-1 transition-colors"
                          onClick={() => {
                            setTheme("brand");
                            setActiveBrandThemeId(b.id);
                            setBrandsDropdownOpen(false);
                          }}
                        >
                          <span className="font-bold text-sm text-[var(--text-primary)]">{b.name}</span>
                          <div className="flex gap-1">
                            {b.brandDetails?.colors?.slice(0, 4).map((c: string, i: number) => (
                              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="space-y-12">
          <section className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Social Integration</h2>
            <div className="space-y-4">
              {[
                { name: 'Github', icon: <Github size={20} />, connected: true, handle: '@henry_dj', type: 'text' },
                { name: 'Twitter / X', icon: <Twitter size={20} />, connected: false, handle: '', type: 'text' },
                { name: 'Instagram', icon: <Instagram size={20} />, connected: false, handle: '', type: 'password' }
              ].map((acc) => (
                <div key={acc.name} className="p-1 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)]/50">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-primary)]">
                         {acc.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{acc.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {acc.connected ? `Connected as ${acc.handle}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${acc.connected ? 'bg-[var(--bg-muted)] text-[var(--text-primary)]' : 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20'}`}>
                      {acc.connected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                  {!acc.connected && (
                    <div className="px-5 pb-5 pt-2 flex gap-3">
                      <input 
                        type={acc.type} 
                        placeholder={acc.type === 'password' ? 'API Key / Password' : 'Handle / Profile Link'} 
                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                      <button className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-xs font-black uppercase tracking-widest">Save</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Professional Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[var(--bg-muted)]/20 border border-[var(--border-color)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Fingerprint size={24} />
                  </div>
                  <span className="text-[10px] font-black bg-blue-500/20 text-blue-500 px-2 py-1 rounded">BETA</span>
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">Spotify Insights</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Connect your artist profile to sync track data and performance metrics.</p>
                <button className="w-full mt-6 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl font-bold text-xs hover:bg-[var(--bg-muted)] transition-colors">Setup Integration</button>
              </div>
              <div className="p-6 rounded-2xl bg-[var(--bg-muted)]/20 border border-[var(--border-color)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                    <Cloud size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">Mixcloud / SoundCloud</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Import your latest mixes directly into your Reach Schedule tabs.</p>
                <button className="w-full mt-6 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl font-bold text-xs hover:bg-[var(--bg-muted)] transition-colors">Link Mixes</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "accessibility" && (
        <div className="space-y-12">
          <section className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] p-8">
            <div className="flex items-center gap-4 mb-8">
               <Accessibility size={24} className="text-[var(--accent)]" />
               <h2 className="text-2xl font-bold text-[var(--text-primary)]">Standard Features</h2>
            </div>
            
            <div className="space-y-6">
              {[
                { title: 'Easy Reading Mode', desc: 'Increases font sizes and line heights for better screen legibility.', active: false },
                { title: 'High Contrast Mode', desc: 'Forces a strictly black and white visual style across the whole app.', active: false },
                { title: 'Reduced Motion', desc: 'Disables smooth transitions and animations for a static experience.', active: true },
                { title: 'Screen Reader Optimizations', desc: 'Adds detailed ARIA labels and semantic structure to all complex UI trees.', active: true }
              ].map((feature, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-[var(--border-color)]/30 last:border-0">
                  <div className="max-w-md">
                    <h4 className="font-bold text-[var(--text-primary)]">{feature.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{feature.desc}</p>
                  </div>
                  <button 
                    onClick={() => {
                        if (i === 0) setAccessibilitySettings({ ...accessibilitySettings, readingMode: !accessibilitySettings.readingMode });
                        if (i === 1) setAccessibilitySettings({ ...accessibilitySettings, highContrast: !accessibilitySettings.highContrast });
                        if (i === 2) setAccessibilitySettings({ ...accessibilitySettings, reducedMotion: !accessibilitySettings.reducedMotion });
                    }}
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                        (i === 0 && accessibilitySettings.readingMode) || 
                        (i === 1 && accessibilitySettings.highContrast) || 
                        (i === 2 && accessibilitySettings.reducedMotion) ||
                        (i === 3) // Screen reader optimization always on for demo
                        ? "bg-[var(--accent)]" : "bg-[var(--bg-muted)] border border-[var(--border-color)]"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        (i === 0 && accessibilitySettings.readingMode) || 
                        (i === 1 && accessibilitySettings.highContrast) || 
                        (i === 2 && accessibilitySettings.reducedMotion) ||
                        (i === 3)
                        ? "translate-x-6" : "translate-x-0"}`}></div>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-[var(--bg-muted)]/20 rounded-[32px] border border-[var(--border-color)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Font Scaling</h3>
                <div className="flex gap-4">
                    {['sm', 'md', 'lg', 'xl'].map((size) => (
                        <button
                            key={size}
                            onClick={() => setAccessibilitySettings({ ...accessibilitySettings, fontSize: size })}
                            className={`flex-1 py-4 rounded-xl border-2 font-black uppercase tracking-widest transition-all ${accessibilitySettings.fontSize === size ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)] shadow-lg shadow-[var(--accent)]/20" : "border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
          </section>

          <section className="p-8 bg-black text-white rounded-[32px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-20 blur-[100px] -mr-32 -mt-32"></div>
            <h3 className="text-xl font-bold relative z-10">Language & Region</h3>
            <p className="text-white/60 text-sm mt-1 relative z-10">Set your preferred communication language and time zone.</p>
            
            <div className="mt-8 flex gap-4 relative z-10">
              <div className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/10">
                 <span className="text-[10px] uppercase font-black text-white/40">Language</span>
                 <p className="font-bold mt-1">English (United Kingdom)</p>
              </div>
              <div className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/10">
                 <span className="text-[10px] uppercase font-black text-white/40">Time Zone</span>
                 <p className="font-bold mt-1">GMT+00:00 (London)</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <section className="bg-[var(--bg-surface)] p-8 rounded-[32px] border border-[var(--border-color)]">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 text-[var(--text-muted)]">Work Week Context</h3>
              <div className="flex gap-3">
                {["monday", "sunday"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setCalendarConfig({ ...calendarConfig, startDay: day })}
                    className={`flex-1 py-4 rounded-2xl border-2 capitalize font-bold transition-all ${calendarConfig.startDay === day ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]" : "border-[var(--border-color)] text-[var(--text-secondary)]"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-[var(--bg-surface)] p-8 rounded-[32px] border border-[var(--border-color)]">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 text-[var(--text-muted)]">Datetime Display</h3>
              <div className="flex gap-3">
                {["d/m/y", "m/d/y"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setCalendarConfig({ ...calendarConfig, format: fmt })}
                    className={`flex-1 py-4 rounded-2xl border-2 uppercase font-bold transition-all ${calendarConfig.format === fmt ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]" : "border-[var(--border-color)] text-[var(--text-secondary)]"}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 rounded-[32px] space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-xl">National Calendar Overlays</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Automatically highlights meaningful holidays and observance days.</p>
              </div>
              <button
                onClick={() => setCalendarConfig({ ...calendarConfig, nationalCalendar: !calendarConfig.nationalCalendar })}
                className={`w-14 h-8 rounded-full flex items-center p-2 transition-colors ${calendarConfig.nationalCalendar ? "bg-[var(--accent)]" : "bg-gray-400/30"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${calendarConfig.nationalCalendar ? "translate-x-6" : "translate-x-0"}`}></div>
              </button>
            </div>
            
            <div className="h-px bg-[var(--border-color)]" />

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-xl">Google Calendar Bi-Sync</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Connect your Google Workspace or Personal account to keep Cogito in sync.</p>
              </div>
              <button
                onClick={() => setCalendarConfig({ ...calendarConfig, googleSynced: !calendarConfig.googleSynced })}
                className={`px-8 py-4 rounded-2xl font-black transition-all shadow-xl text-sm uppercase tracking-widest ${calendarConfig.googleSynced ? "bg-[var(--bg-muted)] text-[var(--text-primary)]" : "bg-[var(--accent)] text-black"}`}
              >
                {calendarConfig.googleSynced ? "Disconnect API" : "Authorize Google"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-12 pb-24">
          <div className="flex items-center justify-between bg-[var(--bg-surface)] p-8 rounded-[32px] border border-[var(--border-color)]">
            <div>
              <h3 className="font-display font-bold text-3xl uppercase text-[var(--text-primary)] leading-none">Security & Governance</h3>
              <p className="text-sm opacity-60 mt-2 text-[var(--text-secondary)]">Legal documentation and data control protocols.</p>
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-muted)] text-sm font-bold transition-all"><Share2 size={16} /> Share Policy</button>
               <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-bold transition-all shadow-xl shadow-black/10"><ExternalLink size={16} /> Web Version</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
               <div className="w-12 h-12 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mb-6">
                 <Fingerprint size={24} />
               </div>
               <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Data Sovereignty</h4>
               <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                 Cogito operates on a "Local First" architecture. Your DJ sets, brand strategies, and financial logs never leave your device unless you explicitly trigger an AI analysis or social sync.
               </p>
            </div>
            <div className="p-8 rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
               <div className="w-12 h-12 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mb-6">
                 <Cloud size={24} />
               </div>
               <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Cloud Edge Computing</h4>
               <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                 Moodboard analysis uses ephemeral edge processing. Images sent to Google Gemini are processed in-memory and discarded immediately after thematic extraction is complete.
               </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-6 px-4">
             <h4 className="text-[var(--text-primary)] font-bold text-xl">Service Level Guarantees</h4>
             <p>Our commitment to professional DJ management includes 256-bit encryption for all OAuth tokens and zero-knowledge storage for brand identity vaults. Users can export their entire workspace as a portable JSON archive at any time.</p>
          </div>
        </div>
      )}
    </div>
  );
}
