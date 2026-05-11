import React, { useState, useEffect, useRef, useMemo } from "react";
import { Project, Task, Block, Status, Priority } from "../types";
import {
  SYSTEM_TODAY,
  parseDate,
  formatDate,
  addDays,
  getDiffDays,
  hexToRgba,
  getTaskComputedState,
  calcTaskProgress,
} from "../utils";
import {
  DatePicker,
  InlinePriorityPicker,
  ProgressRing,
  EXCLAMATION_PATTERN,
  MISSED_COLOR,
  TICK_PATTERN,
} from "./Pickers";
import {
  MousePointer2,
  Paintbrush,
  Scissors,
  Eraser,
  ZoomOut,
  ZoomIn,
  ChevronDown,
  CheckSquare,
  Trash2,
  Check,
  X,
} from "lucide-react";

const OVERLAP_PATTERN = `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-1,13 L13,-1 M-1,1 L1,-1 M11,13 L13,11' stroke='rgba(255,255,255,0.4)' stroke-width='2'/%3E%3C/svg%3E")`;

const getCellsOccupied = (task: Task) => {
  const s = new Set();
  (task.blocks || []).forEach((b) => {
    if (!b.startDate) return;
    const start = parseDate(b.startDate);
    const end = parseDate(b.endDate || SYSTEM_TODAY);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      s.add(formatDate(d));
    }
  });
  return s.size;
};

const getOverlapSegments = (blocks: Block[]) => {
  const dateMap: any = {};
  blocks.forEach((b) => {
    if (!b.startDate) return;
    const s = parseDate(b.startDate);
    const e = parseDate(b.endDate || SYSTEM_TODAY);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const dStr = formatDate(d);
      dateMap[dStr] = (dateMap[dStr] || 0) + 1;
    }
  });
  const overlapDays = Object.keys(dateMap)
    .filter((d) => dateMap[d] > 1)
    .sort();
  const segments: { start: string; end: string }[] = [];
  if (overlapDays.length === 0) return segments;

  let currStart = overlapDays[0];
  let currEnd = overlapDays[0];
  for (let i = 1; i < overlapDays.length; i++) {
    const prevDate = parseDate(currEnd);
    const expectedNext = new Date(prevDate);
    expectedNext.setDate(expectedNext.getDate() + 1);
    if (formatDate(expectedNext) === overlapDays[i]) {
      currEnd = overlapDays[i];
    } else {
      segments.push({ start: currStart, end: currEnd });
      currStart = overlapDays[i];
      currEnd = overlapDays[i];
    }
  }
  segments.push({ start: currStart, end: currEnd });
  return segments;
};

const ToolBtn = ({ icon: Icon, active, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md transition-all ${active ? "bg-[var(--bg-muted)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`}
  >
    <Icon size={16} strokeWidth={2.5} />
  </button>
);

const SyncedCalendarPicker = ({ scrollRef, timelineStart, dayWidth, jumpToDate }: any) => {
  const [val, setVal] = useState(SYSTEM_TODAY);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollLeft = el.scrollLeft;
          const daysScrolled = Math.round(scrollLeft / dayWidth);
          const date = new Date(timelineStart);
          date.setDate(date.getDate() + daysScrolled);
          setVal(formatDate(date));
          ticking = false;
        });
        ticking = true;
      }
    };
    
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef, timelineStart, dayWidth]);

  return (
    <DatePicker
      value={val}
      onChange={(v: string) => jumpToDate(v)}
      allowClear={false}
    />
  );
};

const TRASH_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.25)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 6h18'/%3E%3Cpath d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/%3E%3Cpath d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/%3E%3Cline x1='10' y1='11' x2='10' y2='17'/%3E%3Cline x1='14' y1='11' x2='14' y2='17'/%3E%3C/svg%3E")`;

const TimelineHeaderDays = React.memo(({ daysArray, dayWidth }: any) => {
  return (
    <div className="h-10 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-surface)]/95 backdrop-blur z-30 flex shrink-0 box-border">
      {daysArray.map((day: Date, i: number) => {
        const isToday = formatDate(day) === SYSTEM_TODAY;
        return (
          <div
            key={i}
            className={`h-full border-r border-white/5 flex flex-col items-center justify-center shrink-0 ${isToday ? "bg-red-500/20" : ""}`}
            style={{ width: `${dayWidth}px` }}
          >
            <span
              className={`text-[9px] font-black uppercase tracking-widest ${isToday ? "text-red-400" : "text-[var(--text-muted)]"}`}
            >
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span
              className={`text-xs font-bold ${isToday ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
            >
              {day.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export function TimelineView({
  project,
  onEditTask,
  onUpdateTaskField,
  onUpdateBlocks,
  sortMode,
  setSortMode,
  manualOrder,
  setManualOrder,
}: any) {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState("move");
  const [rowHeights, setRowHeights] = useState<any>({});
  const [colWidth, setColWidth] = useState(320);
  const [scrappedModalOpen, setScrappedModalOpen] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const baseDayWidth = 80;
  const dayWidth = baseDayWidth * zoom;
  const [dragState, setDragState] = useState<any>(null);
  const [tempBlocks, setTempBlocks] = useState<any>({});
  const [timelineStart] = useState(() => {
    let d = parseDate(SYSTEM_TODAY);
    d.setDate(d.getDate() - 3650); // Fixed 10 years before today
    return d;
  });
  const timelineDays = 7300; // 20 years wide
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  const jumpToDate = (targetStr: string) => {
    if (!targetStr || !scrollRef.current) return;
    const days = getDiffDays(formatDate(timelineStart), targetStr);
    scrollRef.current.scrollTo({
      left: Math.max(0, days * dayWidth),
      behavior: "smooth",
    });
  };

  const scrollToToday = () => {
    jumpToDate(SYSTEM_TODAY);
  };

  useEffect(() => {
    if (!hasAutoScrolled.current && scrollRef.current && dayWidth) {
      const daysToToday = getDiffDays(formatDate(timelineStart), SYSTEM_TODAY);
      scrollRef.current.scrollLeft = daysToToday * dayWidth;
      hasAutoScrolled.current = true;
    }
  }, [dayWidth, timelineStart]);

  const tasksWithState = useMemo(
    () =>
      (project?.tasks || []).map((t: any) => ({
        ...t,
        computed: getTaskComputedState(t),
      })),
    [project?.tasks],
  );

  const visibleTasks = useMemo(() => {
    const tasks = tasksWithState.filter(
      (t: any) =>
        t.computed.cStatus !== "scrapped" && t.computed.cStatus !== "done",
    );
    if (sortMode === "manual") {
      tasks.sort((a: any, b: any) => {
        const idxA = manualOrder.indexOf(a.id);
        const idxB = manualOrder.indexOf(b.id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
    } else if (sortMode === "priority") {
      const pW: any = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
      const sW: any = {
        todo: 2,
        "in-progress": 1,
        missed: 0,
        scrapped: 0,
        done: 0,
      };
      tasks.sort((a: any, b: any) => {
        const diffP = pW[b.computed.cPriority] - pW[a.computed.cPriority];
        if (diffP !== 0) return diffP;
        const diffS = sW[b.computed.cStatus] - sW[a.computed.cStatus];
        if (diffS !== 0) return diffS;
        return a.title.localeCompare(b.title);
      });
    } else if (sortMode === "blocks") {
      tasks.sort((a: any, b: any) => {
        const bA = a.blocks?.length || 0;
        const bB = b.blocks?.length || 0;
        if (bA !== bB) return bB - bA;
        const cA = getCellsOccupied(a);
        const cB = getCellsOccupied(b);
        if (cA !== cB) return cB - cA;
        return a.title.localeCompare(b.title);
      });
    } else if (sortMode === "size") {
      tasks.sort((a: any, b: any) => {
        const cA = getCellsOccupied(a);
        const cB = getCellsOccupied(b);
        if (cA !== cB) return cB - cA;
        return a.title.localeCompare(b.title);
      });
    }
    return tasks;
  }, [tasksWithState, sortMode, manualOrder]);

  const daysArray = useMemo(
    () =>
      Array.from({ length: timelineDays }).map((_, i) => {
        const d = new Date(timelineStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [timelineStart, timelineDays],
  );

  const handleWheel = (e: any) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.01, Math.min(0.8, z - e.deltaY * 0.002)));
    } else {
      // For horizontal 2-finger scroll
      if (Math.abs(e.deltaX) > 0 && scrollRef.current) {
        scrollRef.current.scrollLeft += e.deltaX;
      } else if (e.shiftKey && scrollRef.current) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (el) el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    if (!dragState) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.initialX;
      setTempBlocks({
        [`${dragState.taskId}-${dragState.blockId}`]: {
          deltaX,
          type: dragState.type,
        },
      });
    };
    const handleMouseUp = () => {
      const tempKey = `${dragState.taskId}-${dragState.blockId}`;
      const temp = tempBlocks[tempKey];
      if (temp) {
        const task = (project?.tasks || []).find((t: any) => t.id === dragState.taskId);
        const block = task.blocks.find((b: any) => b.id === dragState.blockId);
        const deltaDays = Math.round(temp.deltaX / dayWidth);
        let s = block.startDate;
        let e_date = block.endDate || SYSTEM_TODAY;
        if (dragState.type === "move") {
          s = addDays(s, deltaDays);
          e_date = addDays(e_date, deltaDays);
        } else if (dragState.type === "resize-left") {
          s = addDays(s, deltaDays);
          if (parseDate(s) > parseDate(e_date)) s = e_date;
        } else if (dragState.type === "resize-right") {
          e_date = addDays(e_date, deltaDays);
          if (parseDate(e_date) < parseDate(s)) e_date = s;
        }
        const newBlocks = task.blocks.map((b: any) =>
          b.id === block.id ? { ...b, startDate: s, endDate: e_date } : b,
        );
        onUpdateBlocks(dragState.taskId, newBlocks);
      }
      setDragState(null);
      setTempBlocks({});
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, dayWidth, tempBlocks, onUpdateBlocks, project?.tasks]);

  const [rowDrag, setRowDrag] = useState<any>(null);
  useEffect(() => {
    if (!rowDrag) return;
    const handleMove = (e: MouseEvent) =>
      setRowHeights((prev: any) => ({
        ...prev,
        [rowDrag.taskId]: Math.max(
          64,
          rowDrag.startHeight + (e.clientY - rowDrag.startY),
        ),
      }));
    const handleUp = () => setRowDrag(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [rowDrag]);

  const [colDrag, setColDrag] = useState<any>(null);
  useEffect(() => {
    if (!colDrag) return;
    const handleMove = (e: MouseEvent) =>
      setColWidth(
        Math.max(340, colDrag.startWidth + (e.clientX - colDrag.startX)),
      );
    const handleUp = () => setColDrag(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [colDrag]);

  const handleGridClick = (e: React.MouseEvent, task: Task) => {
    if (mode !== "edit") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickedDayOffset = Math.floor(clickX / dayWidth);
    const targetDate = addDays(formatDate(timelineStart), clickedDayOffset);
    const newBlock = {
      id: `b${Date.now()}`,
      name: "",
      startDate: targetDate,
      endDate: targetDate,
      completed: false,
    };
    onUpdateBlocks(task.id, [...(task.blocks || []), newBlock]);
  };

  const handleBlockClick = (e: React.MouseEvent, task: Task, block: Block) => {
    e.stopPropagation();
    if (mode === "delete") {
      onUpdateBlocks(
        task.id,
        task.blocks.filter((b) => b.id !== block.id),
      );
    } else if (mode === "snip") {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const splitDaysFromBlockStart = Math.round(clickX / dayWidth);
      const e_date = block.endDate || SYSTEM_TODAY;
      if (
        splitDaysFromBlockStart > 0 &&
        splitDaysFromBlockStart <= getDiffDays(block.startDate, e_date)
      ) {
        const splitDateStr = addDays(block.startDate, splitDaysFromBlockStart);
        const endOfFirst = addDays(splitDateStr, -1);
        const newBlock1 = { ...block, endDate: endOfFirst };
        const newBlock2 = {
          ...block,
          id: `b${Date.now()}`,
          startDate: splitDateStr,
          endDate: block.endDate,
        };
        const newBlocks = task.blocks.filter((b) => b.id !== block.id);
        newBlocks.push(newBlock1, newBlock2);
        onUpdateBlocks(task.id, newBlocks);
      }
    }
  };

  const handleSortDragStart = (e: React.DragEvent, taskId: string) => {
    if (sortMode !== "manual") return;
    e.dataTransfer.setData("text/plain", taskId);
  };
  const handleSortDrop = (e: React.DragEvent, targetId: string) => {
    if (sortMode !== "manual") return;
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId) return;
    setManualOrder((prev: string[]) => {
      const order = [...prev];
      const fromIdx = order.indexOf(draggedId);
      const toIdx = order.indexOf(targetId);
      if (fromIdx > -1 && toIdx > -1) {
        order.splice(fromIdx, 1);
        order.splice(toIdx, 0, draggedId);
      }
      return order;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-primary)]">
      <div className="min-h-[56px] py-2 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between px-6 shrink-0 z-[2000] text-[var(--text-secondary)] shadow-md relative gap-4">
        <div className="flex bg-black rounded-lg p-1 border border-[var(--border-color)]">
          <ToolBtn
            icon={MousePointer2}
            active={mode === "move"}
            onClick={() => setMode("move")}
            title="Mouse/Select Tool"
          />
          <ToolBtn
            icon={Paintbrush}
            active={mode === "edit"}
            onClick={() => setMode("edit")}
            title="Edit/Draw Tool"
          />
          <ToolBtn
            icon={Scissors}
            active={mode === "snip"}
            onClick={() => setMode("snip")}
            title="Snip Tool"
          />
          <ToolBtn
            icon={Eraser}
            active={mode === "delete"}
            onClick={() => setMode("delete")}
            title="Delete Tool"
          />
        </div>
        <div className="flex items-center gap-4 relative z-[500] flex-1 justify-center min-w-[250px]">
          <SyncedCalendarPicker
            scrollRef={scrollRef}
            timelineStart={timelineStart}
            dayWidth={dayWidth}
            jumpToDate={jumpToDate}
          />
          <button
            onClick={scrollToToday}
            className="bg-[var(--accent)] hover:bg-[var(--accent)] text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ZoomOut size={16} className="text-[var(--text-muted)]" />
          <input
            type="range"
            min="0.01"
            max="0.8"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-32 accent-[#CFFF04] cursor-ew-resize"
          />
          <ZoomIn
            size={16}
            className="text-[var(--text-muted)] border-r border-[var(--border-color)] pr-4 mr-1"
          />
          <button
            onClick={() => onEditTask(null)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent)] text-black shadow-lg hover:brightness-110 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <span className="text-base leading-none">+</span> New Task
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex overflow-auto custom-scrollbar relative"
        ref={scrollRef}
      >
        <div
          className="absolute top-10 bottom-0 pointer-events-none z-40 bg-red-500/10 mix-blend-screen"
          style={{
            left: `${colWidth + getDiffDays(formatDate(timelineStart), SYSTEM_TODAY) * dayWidth}px`,
            width: `${dayWidth}px`,
            display:
              getDiffDays(formatDate(timelineStart), SYSTEM_TODAY) >= 0
                ? "block"
                : "none",
          }}
        />
        <div
          className="shrink-0 border-r border-[var(--border-color)] sticky left-0 z-[250] flex flex-col shadow-[4px_0_20px_rgba(0,0,0,0.6)] bg-[var(--bg-surface)]"
          style={{ width: `${colWidth}px` }}
        >
          <div className="h-10 border-b border-[var(--border-color)] shrink-0 bg-[var(--bg-primary)] flex items-center justify-between px-4 z-[200]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                Tasks
              </span>
              <div className="relative group">
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center bg-[var(--bg-surface)] rounded transition-colors">
                  <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 mt-1 w-36 bg-[var(--bg-surface-hover)] border border-[var(--border-color)] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[500] overflow-hidden">
                  {["manual", "priority", "blocks", "size"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortMode(s)}
                      className={`w-full text-left px-3 py-2 text-xs font-bold capitalize transition-colors ${sortMode === s ? "bg-[var(--accent)] text-black" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCompletedModalOpen(true)}
                className="text-[var(--text-muted)] hover:text-emerald-400 p-1 rounded transition-colors bg-[var(--bg-surface)]"
                title="View Completed"
              >
                <CheckSquare size={14} />
              </button>
              <button
                onClick={() => setScrappedModalOpen(true)}
                className="text-[var(--text-muted)] hover:text-rose-400 p-1 rounded transition-colors bg-[var(--bg-surface)]"
                title="View Scrapped"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {visibleTasks.map((task: any) => {
            const rowHeight = rowHeights[task.id] || 80;
            const progress = calcTaskProgress(task);
            const isMissed = task.computed.cStatus === "missed";
            return (
              <div
                key={`header-${task.id}`}
                className="border-b border-[var(--border-color)] flex items-center justify-between group transition-colors relative bg-[var(--bg-surface)] z-[50] hover:z-[1000]"
                style={{
                  height: `${rowHeight}px`,
                  backgroundImage: isMissed ? EXCLAMATION_PATTERN : "none",
                }}
                draggable={sortMode === "manual"}
                onDragStart={(e) => handleSortDragStart(e, task.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => handleSortDrop(e, task.id)}
                onDoubleClick={() => onEditTask(task, "task")}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-2"
                  style={{
                    backgroundColor: isMissed
                      ? MISSED_COLOR
                      : task.color || "#3B82F6",
                  }}
                ></div>
                <div className="flex items-center gap-3 pl-5 pr-2 flex-1 h-full overflow-visible cursor-pointer relative">
                  <ProgressRing
                    percent={progress}
                    size={32}
                    strokeWidth={3}
                    showNumber
                    className="shrink-0 drop-shadow-md"
                  />
                  <div className="truncate flex flex-col items-start gap-1 flex-1 overflow-visible">
                    <div className="text-sm font-black text-[var(--text-primary)] drop-shadow-lg truncate group-hover:underline w-full">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 overflow-visible">
                      <InlinePriorityPicker
                        priority={task.computed.cPriority}
                        onChange={(val) =>
                          onUpdateTaskField(task.id, "priority", val)
                        }
                      />
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest shrink-0">
                        {task.computed.cStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize z-[100] hover:bg-[var(--accent)]/50 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColDrag({ startX: e.clientX, startWidth: colWidth });
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize z-[100] hover:bg-[var(--accent)]/50 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRowDrag({
                      taskId: task.id,
                      startY: e.clientY,
                      startHeight: rowHeight,
                    });
                  }}
                />
              </div>
            );
          })}
        </div>

        <div
          className="flex-1 relative bg-[var(--bg-primary)]"
          style={{ width: `${timelineDays * dayWidth}px` }}
        >
          <TimelineHeaderDays daysArray={daysArray} dayWidth={dayWidth} />
          <div className="relative z-10">
            <div 
              className="absolute inset-0 pointer-events-none z-0 border-r border-white/5"
              style={{
                backgroundSize: `${dayWidth}px 100%`,
                backgroundImage: `linear-gradient(to right, transparent calc(100% - 1px), rgba(255,255,255,0.05) calc(100% - 1px))`
              }}
            ></div>
            {visibleTasks.map((task: any) => {
              const rowHeight = rowHeights[task.id] || 80;
              const isMissed = task.computed.cStatus === "missed";
              const overlapSegments = getOverlapSegments(task.blocks || []);
              return (
                <div
                  key={`track-${task.id}`}
                  className="border-b border-[var(--border-color)] relative flex items-center group transition-colors z-20"
                  style={{
                    height: `${rowHeight}px`,
                    backgroundColor: isMissed
                      ? "transparent"
                      : hexToRgba(task.color, 0.08),
                    backgroundImage: isMissed ? EXCLAMATION_PATTERN : "none",
                  }}
                  onClick={(e) => handleGridClick(e, task as Task)}
                >
                  {(task.blocks || []).map((block: any) => {
                    const tempState = tempBlocks[`${task.id}-${block.id}`];
                    const isDragging =
                      dragState?.taskId === task.id &&
                      dragState?.blockId === block.id;
                    if (!block.startDate) return null;
                    const daysFromStart = getDiffDays(
                      formatDate(timelineStart),
                      block.startDate,
                    );
                    const e_date = block.endDate || SYSTEM_TODAY;
                    const durationDays =
                      getDiffDays(block.startDate, e_date) + 1;
                    let left = daysFromStart * dayWidth;
                    let width = durationDays * dayWidth;
                    if (isDragging && tempState) {
                      if (tempState.type === "move") left += tempState.deltaX;
                      else if (tempState.type === "resize-left") {
                        const maxDelta = (durationDays - 1) * dayWidth;
                        const appliedDelta = Math.min(
                          tempState.deltaX,
                          maxDelta,
                        );
                        left += appliedDelta;
                        width -= appliedDelta;
                      } else if (tempState.type === "resize-right") {
                        const minDelta = -(durationDays - 1) * dayWidth;
                        const appliedDelta = Math.max(
                          tempState.deltaX,
                          minDelta,
                        );
                        width += appliedDelta;
                      }
                    }
                    return (
                      <div
                        key={block.id}
                        className={`absolute rounded-md shadow-xl border border-white/20 flex flex-col p-2 transition-[filter,box-shadow,opacity] z-30 overflow-hidden group/block ${mode === "move" ? "cursor-grab active:cursor-grabbing hover:brightness-125" : mode === "snip" ? "cursor-crosshair" : mode === "delete" ? "cursor-pointer" : ""}`}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          height: `${rowHeight - 16}px`,
                          top: "8px",
                          backgroundColor: isMissed
                            ? MISSED_COLOR
                            : task.color || "#3B82F6",
                          marginLeft: "4px",
                          maxWidth: `calc(${width}px - 8px)`,
                          backgroundImage: block.trashed
                            ? TRASH_PATTERN
                            : block.completed
                              ? TICK_PATTERN
                              : "none",
                          opacity: isDragging ? 0.7 : (block.completed || block.trashed) ? 0.6 : 1,
                        }}
                        onMouseDown={(e) => {
                          if (mode !== "move" && mode !== "edit") return;
                          e.preventDefault();
                          e.stopPropagation();
                          setDragState({
                            taskId: task.id,
                            blockId: block.id,
                            type: "move",
                            initialX: e.clientX,
                          });
                        }}
                        onClick={(e) =>
                          handleBlockClick(e, task as Task, block)
                        }
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task, `block-${block.id}`);
                        }}
                      >
                        {mode === "edit" && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-black/20 hover:bg-white/40 z-40"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDragState({
                                taskId: task.id,
                                blockId: block.id,
                                type: "resize-left",
                                initialX: e.clientX,
                              });
                            }}
                          />
                        )}
                        {mode === "edit" && (
                          <div
                            className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize bg-black/20 hover:bg-white/40 z-40"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDragState({
                                taskId: task.id,
                                blockId: block.id,
                                type: "resize-right",
                                initialX: e.clientX,
                              });
                            }}
                          />
                        )}
                        <div className="flex flex-col truncate pr-4 pointer-events-none select-none">
                          <span className="text-xs font-black text-[var(--text-primary)] drop-shadow-md truncate">
                            {task.title}
                          </span>
                          {block.name && (
                            <span className="text-[10px] font-bold text-[var(--text-primary)]/80 drop-shadow-sm truncate">
                              {block.name}
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-1 right-1 opacity-0 group-hover/block:opacity-100 flex items-center gap-1 z-20">
                          <button
                            className="p-2 bg-black/40 hover:bg-black/80 rounded transition-all cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newBlocks = task.blocks.map((b: any) =>
                                b.id === block.id
                                  ? { ...b, completed: !b.completed }
                                  : b,
                              );
                              onUpdateBlocks(task.id, newBlocks);
                            }}
                          >
                            <Check
                              size={12}
                              className={
                                block.completed
                                  ? "text-emerald-400"
                                  : "text-[var(--text-primary)]"
                              }
                              strokeWidth={3}
                            />
                          </button>
                          <button
                            className="p-2 bg-black/40 hover:bg-rose-500/80 rounded transition-all cursor-pointer text-[var(--text-primary)]"
                            title="Trash block"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newBlocks = task.blocks.map((b: any) => 
                                b.id === block.id ? { ...b, trashed: !b.trashed } : b
                              );
                              onUpdateBlocks(task.id, newBlocks);
                            }}
                          >
                            <Trash2 size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {overlapSegments.map((seg, i) => {
                    const daysFromStart = getDiffDays(
                      formatDate(timelineStart),
                      seg.start,
                    );
                    const durationDays = getDiffDays(seg.start, seg.end) + 1;
                    return (
                      <div
                        key={`overlap-${i}`}
                        className="absolute z-40 cursor-pointer hover:brightness-150 transition-all rounded-md mix-blend-screen"
                        style={{
                          left: `${daysFromStart * dayWidth}px`,
                          width: `${durationDays * dayWidth}px`,
                          height: `${rowHeight - 16}px`,
                          top: "8px",
                          backgroundImage: OVERLAP_PATTERN,
                          marginLeft: "4px",
                          maxWidth: `calc(${durationDays * dayWidth}px - 8px)`,
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task, "task");
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {scrappedModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]">
              <h3 className="font-black text-xl text-[var(--text-primary)]">
                Scrapped Tasks
              </h3>
              <button
                onClick={() => setScrappedModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] p-2 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {tasksWithState.filter(
                (t: any) => t.computed.cStatus === "scrapped",
              ).length === 0 ? (
                <div className="text-center text-[var(--text-muted)] font-bold py-10">
                  No scrapped tasks
                </div>
              ) : (
                tasksWithState
                  .filter((t: any) => t.computed.cStatus === "scrapped")
                  .map((task: any) => (
                    <div
                      key={task.id}
                      className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">
                          {task.title}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {task.blocks?.length || 0} blocks
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateTaskField(task.id, "status", "todo")
                        }
                        className="px-4 py-2 bg-[var(--bg-muted)] hover:bg-[var(--accent)] text-black text-sm font-bold rounded-lg transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
      {completedModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]">
              <h3 className="font-black text-xl text-emerald-400 flex items-center gap-2">
                <CheckSquare size={20} /> Completed Tasks
              </h3>
              <button
                onClick={() => setCompletedModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] p-2 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {tasksWithState.filter((t: any) => t.computed.cStatus === "done")
                .length === 0 ? (
                <div className="text-center text-[var(--text-muted)] font-bold py-10">
                  No completed tasks
                </div>
              ) : (
                tasksWithState
                  .filter((t: any) => t.computed.cStatus === "done")
                  .map((task: any) => (
                    <div
                      key={task.id}
                      className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-[var(--text-primary)] line-through opacity-70">
                          {task.title}
                        </div>
                        <div className="text-xs text-emerald-500 font-bold">
                          100% Done
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateTaskField(task.id, "status", "todo")
                        }
                        className="px-4 py-2 bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-sm font-bold rounded-lg transition-colors"
                      >
                        Reopen
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
