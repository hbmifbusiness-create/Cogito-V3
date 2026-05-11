import React, { useState, useEffect } from "react";
import { SYSTEM_TODAY, getTaskComputedState } from "../utils";
import { DatePicker, PRIORITY_COLORS } from "./Pickers";
import {
  ChevronDown,
  Tag,
  AlignLeft,
  GripVertical,
  Trash2,
  Plus,
  Check,
  X,
  Zap,
  CheckCircle,
  FolderClosed,
  Play,
  Circle,
} from "lucide-react";
import { motion } from "framer-motion";

export function ModalDialog({ 
  onClose, 
  onSave, 
  entities = [], 
  initialType = "project", 
  initialBrandId,
  initialProjectId,
  initialEventId,
  editingEntity = null, // If provided, we are editing
  onNewChild,
  calendarConfig
}: any) {
  const isEditing = !!editingEntity;
  const [type, setType] = useState(editingEntity?.type || initialType);
  const [name, setName] = useState(editingEntity?.name || editingEntity?.title || "");
  const [color, setColor] = useState(editingEntity?.color || "bg-blue-500");
  
  // Brand Details
  const [brandLogo, setBrandLogo] = useState(editingEntity?.brandDetails?.logo || "");
  const [brandColors, setBrandColors] = useState(editingEntity?.brandDetails?.colors || { main: "#000000", support: "#666666", secondary: "#999999" });
  const [brandFonts, setBrandFonts] = useState(editingEntity?.brandDetails?.fonts || { primary: "Inter", secondary: "Inter", support: "Inter" });

  // Specific Details
  const [description, setDescription] = useState(
      editingEntity?.description || 
      editingEntity?.projectDetails?.description || 
      editingEntity?.eventDetails?.description || 
      ""
  );
  const [notes, setNotes] = useState(
      editingEntity?.notes || 
      editingEntity?.projectDetails?.notes || 
      editingEntity?.eventDetails?.notes || 
      ""
  );
  const [contacts, setContacts] = useState<string[]>(
      editingEntity?.projectDetails?.contacts || 
      editingEntity?.eventDetails?.contacts || 
      []
  );
  const [newContact, setNewContact] = useState("");
  
  // Event Specific
  const [time, setTime] = useState(editingEntity?.eventDetails?.time || "");
  const [location, setLocation] = useState(editingEntity?.eventDetails?.location || "");
  const [financials, setFinancials] = useState(editingEntity?.eventDetails?.financials || editingEntity?.financials || { cost: 0, earnings: 0 });

  // Task Specific (Blocks, Status, Priority)
  const [status, setStatus] = useState(editingEntity?.status || (type === 'project' || type === 'event' ? 'idea' : 'todo'));
  const [priority, setPriority] = useState(editingEntity?.priority || "none");
  const [blocks, setBlocks] = useState<any[]>(editingEntity?.blocks || []);
  const [socialTags, setSocialTags] = useState<string[]>(editingEntity?.socialTags || []);

  // Tags
  const [brandTags, setBrandTags] = useState<string[]>(editingEntity?.brandTags || (initialBrandId ? [initialBrandId] : []));
  const [projectTags, setProjectTags] = useState<string[]>(editingEntity?.projectTags || (initialProjectId ? [initialProjectId] : []));
  const [eventTags, setEventTags] = useState<string[]>(editingEntity?.eventTags || (initialEventId ? [initialEventId] : []));

  const colors = [
    "bg-blue-500",
    "bg-[var(--accent)]",
    "bg-purple-500",
    "bg-pink-500",
    "bg-rose-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-slate-500",
  ];

  const brandsList = entities.filter((e: any) => e.type === "brand");
  const projectsList = entities.filter((e: any) => e.type === "project");
  const eventsList = entities.filter((e: any) => e.type === "event");

  // Child Items lists
  const childEvents = entities.filter((e: any) => e.type === 'event' && e.projectTags?.includes(editingEntity?.id || initialProjectId));
  const childTasks = entities.filter((e: any) => (e.type === 'task' || (e.tasks && e.tasks.length > 0)) && (
    (type === 'project' && e.projectTags?.includes(editingEntity?.id || initialProjectId)) ||
    (type === 'event' && e.eventTags?.includes(editingEntity?.id || initialEventId))
  ));

  const handleAddContact = () => {
    if (newContact.trim()) {
      setContacts([...contacts, newContact.trim()]);
      setNewContact("");
    }
  };

  const handleAddBlock = () => {
    setBlocks([...blocks, { id: `b${Date.now()}`, name: "", startDate: SYSTEM_TODAY, endDate: "", completed: false }]);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const data: any = {
        name,
        type,
        color,
        brandTags,
        projectTags,
        eventTags,
        description,
        notes,
    };

    if (type === 'brand') {
      data.brandDetails = { 
        logo: brandLogo, 
        colors: brandColors, 
        fonts: brandFonts,
        description,
        notes
      };
    } else if (type === 'project') {
      data.projectDetails = { description, notes, contacts };
      data.status = status;
    } else if (type === 'event') {
      data.eventDetails = { 
        time, 
        location, 
        description, 
        notes, 
        contacts,
        financials: { ...financials, net: financials.earnings - financials.cost }
      };
      data.status = status;
    } else if (type === 'task') {
      data.blocks = blocks;
      data.status = status;
      data.priority = priority;
      data.socialTags = socialTags;
      data.financials = financials;
    }

    if (isEditing) {
        onSave({ ...editingEntity, ...data }, blocks);
    } else {
        onSave(name, type, color, brandTags, data);
    }
  };

  const getHexForType = () => {
     if (type === 'task') return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '#3A3A42';
     switch(type) {
         case 'brand': return '#000000';
         case 'project': return '#3B82F6';
         case 'event': return '#F59E0B';
         default: return '#64748B';
     }
  };

  const headerColor = getHexForType();

  const StatusRow = () => {
    if (type !== 'project') return null;

    const statuses = [
      { id: 'idea', label: 'idea', actionLabel: 'Rethink', color: 'blue', icon: Circle, patternIcon: Circle },
      { id: 'ongoing', label: 'ongoing', actionLabel: 'Kickstart', color: 'amber', icon: Play, patternIcon: Play },
      { id: 'complete', label: 'complete', actionLabel: 'Complete', color: 'emerald', icon: Check, patternIcon: Check },
      { id: 'scrapped', label: 'scrapped', actionLabel: 'Scrap', color: 'rose', icon: Trash2, patternIcon: Trash2 },
    ];

    const patternPositions = [
        { top: '10%', left: '15%', size: 8 },
        { top: '40%', left: '5%', size: 6 },
        { top: '70%', left: '12%', size: 7 },
        { top: '20%', right: '15%', size: 7 },
        { top: '50%', right: '8%', size: 8 },
        { top: '80%', right: '14%', size: 6 },
        { top: '15%', left: '35%', size: 5 },
        { top: '65%', right: '35%', size: 5 },
        { top: '45%', left: '45%', size: 4 },
    ];

    return (
      <div className="flex gap-2 w-full max-w-md">
        {statuses.map((s) => {
          const isActive = status === s.id;
          const config = {
              blue: { active: 'bg-blue-600', text: 'text-blue-500', hover: 'hover:text-blue-500', shadow: 'shadow-blue-500/20' },
              amber: { active: 'bg-amber-400', text: 'text-amber-400', hover: 'hover:text-amber-400', shadow: 'shadow-amber-400/20' },
              emerald: { active: 'bg-emerald-500', text: 'text-emerald-500', hover: 'hover:text-emerald-500', shadow: 'shadow-emerald-500/20' },
              rose: { active: 'bg-rose-500', text: 'text-rose-500', hover: 'hover:text-rose-500', shadow: 'shadow-rose-500/20' },
          }[s.color as keyof typeof config];

          const PatternIcon = s.patternIcon as any;

          return (
            <button
              key={s.id}
              disabled={isActive}
              onClick={() => setStatus(s.id)}
              className={`relative flex-1 py-3 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all overflow-hidden group border ${
                isActive 
                  ? `${config.active} text-white shadow-lg ${config.shadow} border-transparent` 
                  : `bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-color)]`
              }`}
            >
              {/* Pattern Layer */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'}`}>
                {patternPositions.map((pos, idx) => (
                    <PatternIcon 
                        key={idx} 
                        size={pos.size} 
                        className={`absolute ${isActive ? 'text-white' : config.text}`} 
                        style={{ 
                            top: pos.top, 
                            left: pos.left, 
                            right: (pos as any).right,
                         }} 
                        fill={(s.id === 'ongoing' || isActive) ? 'currentColor' : 'none'}
                    />
                ))}
              </div>
              
              <span className={`relative z-10 transition-colors duration-200 ${!isActive ? config.hover : ''}`}>
                {isActive ? s.label : s.actionLabel}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[5000] p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={editingEntity?.id ? `card-${editingEntity.id}` : undefined}
        className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] border border-[var(--border-color)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        initial={!editingEntity?.id ? { opacity: 0, scale: 0.95, y: 10 } : false}
        animate={!editingEntity?.id ? { opacity: 1, scale: 1, y: 0 } : false}
        exit={!editingEntity?.id ? { opacity: 0, scale: 0.95, y: 10 } : { opacity: 0 }}
      >
        <div className="px-8 py-6 flex flex-col shrink-0 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center w-full gap-8">
            <div className="flex items-center gap-6 flex-1">
               <h3 className="font-black text-xl text-[var(--text-primary)] uppercase tracking-tighter shrink-0">
                  {isEditing ? 'Edit' : 'New'} {type}
               </h3>
               {type === 'project' && <StatusRow />}
               {type === 'event' && (
                  <div className="flex bg-[var(--bg-muted)] rounded-lg p-1 gap-1 border border-[var(--border-color)]">
                     {['idea', 'ongoing', 'complete'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setStatus(s)}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-[var(--accent)] text-black shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                          {s}
                        </button>
                     ))}
                  </div>
               )}
               {type === 'task' && (
                  <div className="flex bg-[var(--bg-muted)] rounded-lg p-1 gap-1 border border-[var(--border-color)]">
                     {['todo', 'in-progress', 'done'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setStatus(s)}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-[var(--accent)] text-black shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                          {s.replace('-', ' ')}
                        </button>
                     ))}
                  </div>
               )}
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:bg-[var(--bg-muted)] p-2 rounded-xl transition-colors border border-[var(--border-color)] shadow-sm"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Header Section: Name */}
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-transparent hover:border-[var(--border-color)] focus:border-[var(--accent)] text-3xl font-black text-[var(--text-primary)] placeholder:text-[var(--text-primary)]/30 focus:ring-0 transition-colors px-0 py-2"
                placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} Title...`}
              />
            </div>
            {type !== 'brand' && type !== 'project' && (
                <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                    <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-9 h-9 rounded-full shadow-sm ${c} ${color === c ? "ring-4 ring-offset-2 ring-[var(--accent)]/50 scale-110" : "hover:scale-110"} transition-all`}
                    />
                ))}
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Details */}
            <div className="space-y-6">
              {type === 'brand' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Logo URL</label>
                     <input 
                       type="text" 
                       value={brandLogo} 
                       onChange={(e) => setBrandLogo(e.target.value)}
                       className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs"
                       placeholder="https://..."
                     />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(brandColors).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex flex-col gap-1">
                        <label className="text-[8px] font-black uppercase text-[var(--text-muted)]">{k}</label>
                        <input 
                          type="color" 
                          value={v} 
                          onChange={(e) => setBrandColors({...brandColors, [k]: e.target.value})}
                          className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Fonts</label>
                    <input 
                       type="text" 
                       value={brandFonts.primary} 
                       onChange={(e) => setBrandFonts({...brandFonts, primary: e.target.value})}
                       className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs"
                       placeholder="Primary Font"
                     />
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] mb-3 uppercase tracking-widest">
                  <AlignLeft size={14} /> {type === 'brand' ? 'Mission' : 'Description'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[100px] resize-none"
                  placeholder="Tell the story..."
                />
              </div>

              {type === 'event' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                      Time / Date
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      placeholder="e.g. 21:00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      placeholder="Venue name..."
                    />
                  </div>
                </div>
              )}

              {type === 'task' && (
                 <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Priority</label>
                        <div className="flex gap-1">
                            {['low', 'medium', 'high', 'urgent'].map(p => (
                                <button 
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${priority === p ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'border-[var(--border-color)] text-[var(--text-muted)]'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                   <label className="block text-[10px] font-black text-[var(--text-muted)] mb-3 uppercase tracking-widest">Blocks</label>
                   <div className="space-y-2">
                     {blocks.map((block, idx) => (
                       <div key={block.id} className="flex flex-col gap-2 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                         <div className="flex gap-2">
                            <input 
                                value={block.name}
                                onChange={(e) => setBlocks(blocks.map((b, i) => i === idx ? {...b, name: e.target.value} : b))}
                                className="flex-1 bg-transparent border-0 font-bold text-sm"
                                placeholder="Block name..."
                            />
                            <button onClick={() => setBlocks(blocks.filter((_, i) => i !== idx))} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            <DatePicker 
                                value={block.startDate} 
                                onChange={(v: string) => setBlocks(blocks.map((b, i) => i === idx ? {...b, startDate: v} : b))}
                                calendarConfig={calendarConfig}
                                allowClear={true}
                            />
                            <DatePicker 
                                value={block.endDate} 
                                onChange={(v: string) => setBlocks(blocks.map((b, i) => i === idx ? {...b, endDate: v} : b))}
                                calendarConfig={calendarConfig}
                                allowClear={true}
                            />
                         </div>
                       </div>
                     ))}
                     <button onClick={handleAddBlock} className="w-full py-3 border border-dashed border-[var(--border-color)] rounded-xl text-xs font-black opacity-50 hover:opacity-100 flex items-center justify-center gap-2 hover:bg-[var(--bg-muted)] transition-all">
                        <Plus size={14}/> Add Milestone Block
                     </button>
                   </div>
                 </div>
              )}

              {(type === 'project' || type === 'event') && (
                <div>
                  <label className="block text-[10px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                    Private Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[80px] resize-none"
                    placeholder="Shared internal thoughts..."
                  />
                </div>
              )}
            </div>

            {/* Right Column: Tags & Children */}
            <div className="space-y-6">
              {type !== 'brand' && (
                <div className="space-y-6 bg-[var(--bg-muted)]/50 p-6 rounded-2xl border border-[var(--border-color)]">
                  {/* Brand Tags */}
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] mb-3 uppercase tracking-widest">
                      <Tag size={12} /> Brand Identity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {brandsList.map((b: any) => (
                        <button
                          key={b.id}
                          onClick={() => setBrandTags(brandTags.includes(b.id) ? brandTags.filter((id) => id !== b.id) : [...brandTags, b.id])}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black transition-all ${brandTags.includes(b.id) ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20" : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]"}`}
                        >
                          {b.brandDetails?.logo && <img src={b.brandDetails.logo} className="w-3 h-3 object-contain rounded-sm" />}
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Tags (for events & tasks) */}
                  {(type === 'event' || type === 'task') && projectsList.length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] mb-3 uppercase tracking-widest">
                        <Tag size={12} /> Associated Project
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {projectsList.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => setProjectTags(projectTags.includes(p.id) ? projectTags.filter((id) => id !== p.id) : [...projectTags, p.id])}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black transition-all ${projectTags.includes(p.id) ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20" : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]"}`}
                          >
                            <FolderClosed size={10} />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Event Tags (for tasks) */}
                  {type === 'task' && eventsList.length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] mb-3 uppercase tracking-widest">
                        <Tag size={12} /> Event Trigger
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {eventsList.map((ev: any) => (
                          <button
                            key={ev.id}
                            onClick={() => setEventTags(eventTags.includes(ev.id) ? eventTags.filter((id) => id !== ev.id) : [...eventTags, ev.id])}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black transition-all ${eventTags.includes(ev.id) ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]"}`}
                          >
                            <Zap size={10} />
                            {ev.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Child Item Buttons & Lists */}
              {(type === 'project' || type === 'event') && (
                <div className="space-y-6">
                   <div className="flex gap-2">
                     {type === 'project' && (
                        <button 
                          onClick={() => onNewChild('event', { brandTags, projectTags: [editingEntity?.id || initialProjectId] })}
                          className="flex-1 py-3 bg-[var(--accent)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/10"
                        >
                          <Plus size={14} strokeWidth={3}/> New Event
                        </button>
                     )}
                     <button 
                        onClick={() => onNewChild('task', { brandTags, projectTags: type === 'project' ? [editingEntity?.id || initialProjectId] : projectTags, eventTags: type === 'event' ? [editingEntity?.id || initialEventId] : [] })}
                        className="flex-1 py-3 bg-[var(--bg-muted)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-surface-hover)] transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} strokeWidth={3}/> New Task
                      </button>
                   </div>

                   {/* Sub-item Lists */}
                   {(childEvents.length > 0 || childTasks.length > 0) && (
                      <div className="bg-[var(--bg-muted)]/30 p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
                        {type === 'project' && childEvents.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em] block">Connected Events</label>
                                <div className="space-y-1">
                                    {childEvents.map(e => (
                                    <div key={e.id} className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs font-bold flex items-center gap-2">
                                        <Zap size={12} className="text-amber-500" /> {e.name}
                                    </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {childTasks.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em] block">Connected Tasks</label>
                                <div className="space-y-1">
                                    {childTasks.map(e => (
                                    <div key={e.id} className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs font-bold flex items-center gap-2">
                                        <CheckCircle size={12} className="text-emerald-500" /> {e.name}
                                    </div>
                                    ))}
                                </div>
                            </div>
                        )}
                      </div>
                   )}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] mb-3 uppercase tracking-widest">
                  Key Contacts
                </label>
                <div className="space-y-2 mb-3">
                  {contacts.map((contact, i) => (
                    <div key={i} className="flex justify-between items-center bg-[var(--bg-primary)] px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm group">
                      <span>{contact}</span>
                      <button onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Name / Phone / Email..."
                  />
                  <button onClick={handleAddContact} className="p-2 bg-[var(--accent)] text-black rounded-xl hover:brightness-110">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {(type === 'event' || type === 'task') && (
                <div className="p-6 bg-[var(--bg-muted)] border border-[var(--border-color)] rounded-2xl space-y-4">
                  <label className="block text-[10px] font-black text-[var(--text-muted)] mb-1 uppercase tracking-widest">
                    Financial Status
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase">Target Cost</span>
                      <div className="flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-2 rounded-xl border border-[var(--border-color)]">
                         <span className="text-[10px] opacity-40 italic">£</span>
                         <input
                            type="number"
                            value={financials.cost}
                            onChange={(e) => setFinancials({ ...financials, cost: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent border-0 text-sm font-bold focus:ring-0"
                         />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase">Earnings</span>
                      <div className="flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-2 rounded-xl border border-[var(--border-color)]">
                         <span className="text-[10px] opacity-40 italic">£</span>
                         <input
                            type="number"
                            value={financials.earnings}
                            onChange={(e) => setFinancials({ ...financials, earnings: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent border-0 text-sm font-bold focus:ring-0"
                         />
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Net {financials.earnings - financials.cost >= 0 ? 'Profit' : 'Loss'}</span>
                    <span className={`text-lg font-black tracking-tighter ${financials.earnings - financials.cost >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      £{(financials.earnings - financials.cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex justify-end items-center gap-3 shrink-0">
            <button
                onClick={onClose}
                className="px-6 py-2 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] rounded-xl transition-colors text-sm"
            >
                Discard
            </button>
            <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-10 py-2 bg-[var(--accent)] text-black font-black hover:brightness-110 rounded-xl transition-all disabled:opacity-50 text-sm shadow-xl shadow-[var(--accent)]/10 uppercase tracking-widest"
            >
                {isEditing ? 'Confirm Updates' : `Create ${type}`}
            </button>
        </div>
      </motion.div>
    </div>
  );
}
