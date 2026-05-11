import React from "react";
import { WorkspaceEntity } from "../types";
import { Plus, CheckSquare } from "lucide-react";
import { calcProjectProgress } from "../utils";
import { ProgressRing } from "./Pickers";

export function Sidebar({
  entities,
  brandId,
  onSelect,
  activeId,
  onNewEntity,
  onNewTask,
}: {
  entities: WorkspaceEntity[];
  brandId: string;
  onSelect: (id: string, forceEdit?: boolean) => void;
  activeId: string;
  onNewEntity: (type?: any) => void;
  onNewTask: (entityId: string) => void;
}) {
  const brandEntities = entities.filter(
    (e) =>
      e.type !== "brand" &&
      (e.parentId === brandId ||
       e.brandTags?.includes(brandId))
  );

  return (
    <div className="w-80 border-r border-[var(--border-color)] bg-[var(--bg-surface)] h-full flex flex-col">
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]/50">
        <span className="font-bold text-[var(--text-muted)] uppercase tracking-widest text-xs">
          Workspace
        </span>
        <div className="relative group">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-[var(--accent)] text-black rounded-lg text-xs font-bold shadow-sm hover:brightness-110 transition-all"
          >
            <Plus size={14} strokeWidth={3} /> Add Item
          </button>
          <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50">
            <button
              onClick={() => onNewEntity('project')}
              className="w-full text-left px-4 py-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors border-b border-[var(--border-color)]"
            >
              New Project
            </button>
            <button
              onClick={() => onNewEntity('event')}
              className="w-full text-left px-4 py-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors border-b border-[var(--border-color)]"
            >
              New Event
            </button>
            <button
              onClick={() => onNewTask(brandId)}
              className="w-full text-left px-4 py-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              New Task
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {brandEntities.map((entity) => {
          const progress = calcProjectProgress(entity);
          return (
            <button
              key={entity.id}
              onClick={() => onSelect(entity.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-semibold border ${activeId === entity.id ? "bg-[var(--bg-muted)] text-[var(--text-primary)] border-[var(--border-color)] shadow-sm" : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]/50"}`}
            >
              <span
                className={`w-3 h-3 rounded-full ${entity.color} shadow-sm shrink-0 flex items-center justify-center text-black/50`}
              ></span>
              <div className="flex flex-col items-start flex-1 overflow-hidden">
                <span className="truncate w-full text-left">{entity.name}</span>
                <span className="text-[9px] uppercase tracking-widest opacity-50 flex items-center gap-1">
                  {entity.type}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(entity.tasks || []).length > 0 && (
                  <ProgressRing
                    percent={progress}
                    size={24}
                    strokeWidth={2.5}
                    showNumber={false}
                    className="opacity-90"
                  />
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(entity.id, true);
                  }}
                  className="p-1 px-2 rounded-md hover:bg-black/10 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Edit
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
