import React, { useState } from "react";
import { WorkspaceEntity, Task } from "../types";
import {
  Target,
  Zap,
  FolderClosed,
  CheckSquare,
  Plus,
  Filter,
  Search,
  Pencil,
} from "lucide-react";
import { ProgressRing } from "./Pickers";
import { calcProjectProgress } from "../utils";

import { ExpandableCard } from "./UIElements";

export function AllEntitiesListView({
  type,
  entities,
  onSelect,
  onNew,
  onEdit,
  activeFilter,
}: {
  type: "brand" | "event" | "project";
  entities: WorkspaceEntity[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onEdit: (entity: WorkspaceEntity) => void;
  activeFilter?: string;
}) {
  const effectiveTab = activeFilter || "all";

  const filteredByStatus = entities
    .filter((e) => e.type === type)
    .filter((e) => {
      if (effectiveTab === "all") return true;
      if (type === "project") return (e.status || "idea") === effectiveTab;
      return (e.status || "active") === effectiveTab;
    });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {filteredByStatus.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-muted)]/30">
            <p className="font-bold text-sm">No {type}s found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredByStatus.map((entity) => {
              const progress = calcProjectProgress(entity);
              return (
                <div
                  key={entity.id}
                  onClick={() => onSelect(entity.id)}
                  className="group relative flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 text-left transition-all hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 overflow-hidden cursor-pointer"
                >
                  {/* Dashboard hover tool tip */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] text-[var(--bg-surface)] px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-100 shadow-xl shadow-[var(--accent)]/20 z-20 pointer-events-none">
                    Open Dashboard
                  </div>

                  <div className="flex items-center justify-between mb-4 relative z-10 pointer-events-none">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${entity.color} shadow-sm`}
                      ></span>
                      {entity.status && (
                        <span className="px-2 py-1 rounded-md bg-[var(--bg-muted)] text-[var(--accent)] text-[9px] font-black uppercase tracking-widest border border-[var(--border-color)]">
                          {entity.status}
                        </span>
                      )}
                    </div>
                    {(entity.tasks || []).length > 0 && (
                      <ProgressRing
                        percent={progress}
                        size={28}
                        strokeWidth={3}
                        showNumber={false}
                      />
                    )}
                  </div>
                  <h4 className="text-lg font-black text-[var(--text-primary)] truncate w-full mb-1 tracking-tight relative z-10 pointer-events-none">
                    {entity.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 mb-4 relative z-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                    {entity.type === 'project' ? entity.projectDetails?.description : entity.eventDetails?.description || "No description."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border-color)] relative z-30">
                    <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-black opacity-60">
                      {(entity.tasks || []).length} Task
                      {(entity.tasks || []).length !== 1 ? "s" : ""}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(entity);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-all"
                    >
                      <Pencil size={12} /> <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AllTasksListView({
  entities,
  onSelectTask,
  activeFilter,
}: {
  entities: WorkspaceEntity[];
  onSelectTask: (task: Task) => void;
  activeFilter?: string;
}) {
  const allTasks = entities.flatMap((e) => e.tasks || []);
  const filteredTasks = allTasks.filter((t) => {
    if (!activeFilter || activeFilter === "all") return true;
    return t.status === activeFilter;
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-muted)]/30">
            <p className="font-bold text-sm">No tasks found matching this filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="w-full flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${task.color}`}></div>
                <div className="font-bold text-[var(--text-primary)]">{task.title}</div>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-md text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)]">
                  {task.status}
                </span>
                <span className="px-2 py-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-md text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)]">
                  {task.priority}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function TotalFinancesView({
  entities,
}: {
  entities: WorkspaceEntity[];
}) {
  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4 opacity-50">
          Total Finances Dashboard Pending
        </h2>
        <p className="text-[var(--text-muted)]">
          Will calculate all cost/earnings from financial fields on tasks and
          brands.
        </p>
      </div>
    </div>
  );
}
