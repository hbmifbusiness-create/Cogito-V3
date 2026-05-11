import React, { useState } from "react";
import { Task, Project } from "../types";
import { getTaskComputedState, calcTaskProgress } from "../utils";
import { motion } from "framer-motion";
import {
  ProgressRing,
  InlinePriorityPicker,
  EXCLAMATION_PATTERN,
  TICK_PATTERN,
  MISSED_COLOR,
} from "./Pickers";
import { Check, Trash2 } from "lucide-react";

export function BoardView({ project, onEditTask, onUpdateTaskField }: any) {
  const [activeTab, setActiveTab] = useState("todo");
  const tabs = [
    { id: "todo", label: "To Do" },
    { id: "in-progress", label: "In Progress" },
    { id: "done", label: "Completed" },
    { id: "scrapped", label: "Scrapped" },
    { id: "missed", label: "Missed" },
  ];
  const tasksWithState = (project?.tasks || []).map((t: any) => ({
    ...t,
    computed: getTaskComputedState(t),
  }));
  const filteredTasks = tasksWithState.filter(
    (t: any) => t.computed.cStatus === activeTab,
  );

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      <div className="px-8 pt-6 pb-4 border-b border-[var(--border-color)] flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${activeTab === tab.id ? (tab.id === "missed" ? "text-white shadow-lg shadow-black/40" : "bg-[var(--accent)] text-black shadow-lg shadow-sm shadow-[var(--accent)]") : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"}`}
              style={
                activeTab === tab.id && tab.id === "missed"
                  ? { backgroundColor: MISSED_COLOR }
                  : {}
              }
            >
              {tab.label}
              <span className="ml-2 px-2 py-1 rounded-full bg-black/20 text-xs">
                {
                  tasksWithState.filter(
                    (t: any) => t.computed.cStatus === tab.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => onEditTask(null)}
          className="px-5 py-2 rounded-xl text-sm font-bold bg-[var(--accent)] text-black shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
        >
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="h-40 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] font-bold">
            No tasks in this category
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max pb-12">
            {filteredTasks.map((task: any) => (
              <BoardTaskCard
                key={task.id}
                task={task}
                onEditTask={onEditTask}
                onUpdateTaskField={onUpdateTaskField}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BoardTaskCard({ task, onEditTask, onUpdateTaskField }: any) {
  const progress = calcTaskProgress(task);
  const isDone = task.computed.cStatus === "done";
  const isMissed = task.computed.cStatus === "missed";

  return (
    <motion.div
      layoutId={task.id ? `card-${task.id}` : undefined}
      className={`relative bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-xl transition-[filter,opacity] group cursor-pointer z-10 hover:z-[1000] ${isDone ? "opacity-70" : ""}`}
      style={{
        ...(isDone && { backgroundImage: TICK_PATTERN }),
        ...(isMissed && {
          backgroundImage: EXCLAMATION_PATTERN,
          borderColor: MISSED_COLOR,
          backgroundColor: "#210505",
        }),
      }}
      onClick={() => onEditTask(task)}
    >
      <div
        className="h-2 w-full rounded-t-2xl overflow-hidden"
        style={{ backgroundColor: task.color || "#3B82F6" }}
      ></div>
      <div className="p-5 flex flex-col h-full min-h-[160px]">
        <div
          className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-surface)]/90 backdrop-blur rounded-lg shadow-xl p-1 border border-[var(--border-color)] z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() =>
              onUpdateTaskField(task.id, "status", isDone ? "todo" : "done")
            }
            className={`p-2 rounded hover:bg-[var(--bg-muted)] ${isDone ? "text-emerald-500" : "text-[var(--text-secondary)] hover:text-emerald-400"} transition-colors`}
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => onUpdateTaskField(task.id, "status", "scrapped")}
            className="p-2 rounded hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-rose-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <h4 className="font-bold text-lg text-[var(--text-primary)] mb-2 pr-24 drop-shadow-md group-hover:underline">
          {task.title}
        </h4>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">
          {task.description}
        </p>
        <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/5 relative z-30">
          <InlinePriorityPicker
            priority={task.computed.cPriority}
            onChange={(val: string) =>
              onUpdateTaskField(task.id, "priority", val)
            }
          />
          <ProgressRing
            percent={progress}
            size={36}
            strokeWidth={3.5}
            showNumber
            className="drop-shadow-lg shrink-0 ml-4"
          />
        </div>
      </div>
    </motion.div>
  );
}
