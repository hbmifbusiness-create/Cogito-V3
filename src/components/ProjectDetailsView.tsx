import React, { useState } from "react";
import { WorkspaceEntity } from "../types";
import { ProgressRing } from "./Pickers";
import { Target, X, CheckCircle, Clock, AlertTriangle, Trash2, Plus, Zap, Sparkles } from "lucide-react";

export function ProjectDetailsView({
  entity,
  entities,
  onUpdate,
  onNewChild,
}: {
  entity: WorkspaceEntity;
  entities: WorkspaceEntity[];
  onUpdate: (e: WorkspaceEntity) => void;
  onNewChild: (type: any, context: any) => void;
}) {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(
    entity.type === 'project' 
      ? (entity.projectDetails?.description || "") 
      : (entity.eventDetails?.description || "")
  );
  const [notes, setNotes] = useState(
    entity.type === 'project' 
      ? (entity.projectDetails?.notes || "") 
      : (entity.eventDetails?.notes || "")
  );
  
  const [contacts, setContacts] = useState<string[]>(
    entity.type === 'project'
      ? (entity.projectDetails?.contacts || [])
      : (entity.eventDetails?.contacts || [])
  );
  const [newContact, setNewContact] = useState("");

  const [location, setLocation] = useState(entity.eventDetails?.location || "");
  const [time, setTime] = useState(entity.eventDetails?.time || "");
  const [financials, setFinancials] = useState(entity.eventDetails?.financials || { cost: 0, earnings: 0 });

  const brands = entities.filter((e) => e.type === "brand");
  const currentTags = entity.brandTags || [];

  const handleAddContact = () => {
    if (newContact.trim()) {
      setContacts([...contacts, newContact.trim()]);
      setNewContact("");
    }
  };

  const removeContact = (idx: number) => {
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const save = () => {
    const updates: any = { 
      ...entity, 
      name, 
      brandTags: currentTags 
    };

    if (entity.type === 'project') {
      updates.projectDetails = { ...entity.projectDetails, description, notes, contacts };
    } else {
      updates.eventDetails = { ...entity.eventDetails, description, notes, contacts, location, time, financials };
    }

    onUpdate(updates);
  };

  // Compute stats
  const totalTasks = (entity?.tasks || []).length;
  const completedTasks = (entity?.tasks || []).filter((t) => t.status === "complete").length;
  const remainingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const missedTasks = (entity?.tasks || []).filter((t) => t.status === "missed").length;
  const inProgressTasks = (entity?.tasks || []).filter((t) => t.status === "in progress").length;

  const subEvents = entities.filter(e => e.type === 'event' && e.projectTags?.includes(entity.id));
  const subTasks = entities.filter(e => e.type === 'task' && (
      (entity.type === 'project' && e.projectTags?.includes(entity.id)) ||
      (entity.type === 'event' && e.eventTags?.includes(entity.id))
  ));

  return (
    <div className="p-8 h-full overflow-y-auto w-full max-w-4xl mx-auto flex flex-col gap-8 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <h2 className="text-3xl font-display font-bold tracking-tight uppercase tracking-tighter">
             {entity.type} Details
           </h2>
           <span className="px-3 py-1 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-color)] text-[var(--accent)] text-xs font-black uppercase tracking-widest shadow-inner">
             {((entity.status || 'idea') as string).charAt(0).toUpperCase() + ((entity.status || 'idea') as string).slice(1)}
           </span>
           <button
             onClick={() => alert("Generating AI Progress Report... This will open in the 'proposed' tab.")}
             className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all ml-2"
           >
             <Sparkles size={12} /> AI Report
           </button>
        </div>
        <button
          onClick={save}
          className="px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sm shadow-[var(--accent)]/10"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-text)",
          }}
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Info */}
          <div className="space-y-6 bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors text-xl font-bold"
              />
            </div>

            {entity.type === 'event' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Time / Date</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors resize-none text-sm"
                placeholder="Add a detailed description..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Internal Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors resize-none text-sm"
                placeholder="Private notes..."
              />
            </div>

            {/* Strategy & Constraints Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Strategic Goals</label>
                 <textarea
                   value={entity.brandDetails?.mission || ""}
                   onChange={(e) => onUpdate({ ...entity, brandDetails: { ...entity.brandDetails, mission: e.target.value }})}
                   rows={3}
                   className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors resize-none text-sm"
                   placeholder="What are the key objectives for this project?"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Key Constraints</label>
                 <textarea
                   value={entity.brandDetails?.tagline || ""}
                   onChange={(e) => onUpdate({ ...entity, brandDetails: { ...entity.brandDetails, tagline: e.target.value }})}
                   rows={3}
                   className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--accent)] outline-none transition-colors resize-none text-sm"
                   placeholder="Deadlines, budget limits, or technical requirements..."
                 />
               </div>
            </div>

            {/* Sub-Items Hierarchy Section */}
            {(entity.type === 'project' || entity.type === 'event') && (
              <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)] space-y-6">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Workspace Breakdown</label>
                   <div className="flex gap-2">
                     {entity.type === 'project' && (
                       <button 
                        onClick={() => onNewChild('event', { brandTags: entity.brandTags, projectTags: [entity.id] })}
                        className="px-3 py-2 bg-[var(--accent)] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 flex items-center gap-2"
                       >
                         <Plus size={12} strokeWidth={3}/> New Event
                       </button>
                     )}
                     <button 
                        onClick={() => onNewChild('task', { brandTags: entity.brandTags, projectTags: entity.type === 'project' ? [entity.id] : [], eventTags: entity.type === 'event' ? [entity.id] : [] })}
                        className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-surface-hover)] flex items-center gap-2"
                      >
                        <Plus size={12} strokeWidth={3}/> New Task
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {entity.type === 'project' && (
                     <div className="space-y-3">
                        <h4 className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em]">Connected Events</h4>
                        <div className="space-y-1">
                          {subEvents.length === 0 && <p className="text-[10px] opacity-40 italic">No events tagged.</p>}
                          {subEvents.map(e => (
                             <div key={e.id} className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] text-sm font-bold flex items-center gap-2">
                               <Zap size={14} className="text-[var(--accent)]" /> {e.name}
                             </div>
                          ))}
                        </div>
                     </div>
                   )}
                   <div className="space-y-3">
                      <h4 className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em]">Connected Tasks</h4>
                      <div className="space-y-1">
                        {subTasks.length === 0 && <p className="text-[10px] opacity-40 italic">No tasks tagged.</p>}
                        {subTasks.map(e => (
                             <div key={e.id} className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] text-sm font-bold flex items-center gap-2">
                               <CheckCircle size={14} className="text-emerald-500" /> {e.name}
                             </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contacts */}
            <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)]">
               <label className="text-[10px] font-black opacity-50 uppercase tracking-widest block mb-4">Key Contacts</label>
               <div className="space-y-2 mb-4">
                 {contacts.map((contact, i) => (
                   <div key={i} className="flex justify-between items-center bg-[var(--bg-primary)] px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm group">
                     <span className="font-medium">{contact}</span>
                     <button onClick={() => removeContact(i)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))}
                 {contacts.length === 0 && <p className="text-xs opacity-40 italic">No contacts added yet.</p>}
               </div>
               <div className="flex gap-2">
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Add contact..."
                  />
                  <button onClick={handleAddContact} className="p-2 bg-[var(--accent)] text-black rounded-lg hover:brightness-110">
                    <Plus size={18} />
                  </button>
               </div>
            </div>

            {/* Brand Tags */}
            <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)]">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest block mb-4">Related Brands</label>
              <div className="flex flex-wrap gap-2">
                {brands.length === 0 && (
                  <div className="text-xs opacity-50 bg-[var(--bg-primary)] py-2 px-4 rounded-lg border border-[var(--border-color)]">No brands available.</div>
                )}
                {brands.map((brand) => {
                  const isTagged = entity.brandTags?.includes(brand.id);
                  return (
                    <button
                      key={brand.id}
                      onClick={() => {
                        const newTags = isTagged ? entity.brandTags?.filter(t => t !== brand.id) : [...(entity.brandTags||[]), brand.id];
                        onUpdate({ ...entity, brandTags: newTags });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black transition-all border ${
                        isTagged 
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-black shadow-sm' 
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] opacity-100'
                      }`}
                    >
                      {brand.brandDetails?.logo ? (
                        <img src={brand.brandDetails.logo} className="w-3.5 h-3.5 object-contain rounded-sm" />
                       ) : (
                        <Target size={12} />
                      )}
                      {brand.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Progress Ring Card */}
          <div className="bg-[var(--bg-muted)] p-8 rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center gap-6 text-center shadow-inner">
            <h3 className="font-black opacity-40 uppercase tracking-widest text-[10px] w-full text-left">Overall Completion</h3>
            <div className="relative">
              <ProgressRing percent={progress} size={160} strokeWidth={10} color="var(--accent)" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black tracking-tighter">{progress}%</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ready</span>
              </div>
            </div>
          </div>

          {/* Event Specific: Financial Summary */}
          {entity.type === 'event' && (
             <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-6">
               <h3 className="font-black opacity-40 uppercase tracking-widest text-[10px]">Financial Summary</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold opacity-60">Estimated Costs</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] opacity-40">£</span>
                       <input 
                         type="number" 
                         value={financials.cost} 
                         onChange={(e) => setFinancials({...financials, cost: parseFloat(e.target.value) || 0})}
                         className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2 py-1 w-20 text-right text-xs font-bold"
                       />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold opacity-60">Actual Earnings</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] opacity-40">£</span>
                       <input 
                         type="number" 
                         value={financials.earnings} 
                         onChange={(e) => setFinancials({...financials, earnings: parseFloat(e.target.value) || 0})}
                         className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2 py-1 w-20 text-right text-xs font-bold"
                       />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest">Net Result</span>
                    <span className={`text-lg font-black tracking-tighter ${financials.earnings - financials.cost >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      £{(financials.earnings - financials.cost).toFixed(2)}
                    </span>
                  </div>
               </div>
             </div>
          )}

          {/* Stats Summary */}
          <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-5">
            <h3 className="font-black opacity-40 uppercase tracking-widest text-[10px]">Task Summary</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span>Complete</span>
                </div>
                <span className="font-black text-lg">{completedTasks}</span>
              </div>
              
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span>Active</span>
                </div>
                <span className="font-black text-lg">{inProgressTasks}</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] opacity-30"></div>
                  <span>Remaining</span>
                </div>
                <span className="font-black text-lg opacity-40">{remainingTasks}</span>
              </div>

              {missedTasks > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] group">
                  <div className="flex items-center gap-3 text-sm font-bold text-rose-500">
                    <AlertTriangle size={16} />
                    <span>Missed Deadline</span>
                  </div>
                  <span className="font-black text-lg text-rose-500">{missedTasks}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
