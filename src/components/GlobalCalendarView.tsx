import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import { WorkspaceEntity, CalendarConfig } from "../types";
import { parseDate, formatDate, SYSTEM_TODAY } from "../utils";

import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import Holidays from "date-holidays";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
const hd = new Holidays("US");

export function GlobalCalendarView({
  entities,
  onBack,
  calendarConfig,
  onEditTask,
  onUpdateBlocks,
}: {
  entities: WorkspaceEntity[];
  onBack: () => void;
  calendarConfig?: CalendarConfig;
  onEditTask?: (task: any) => void;
  onUpdateBlocks?: (taskId: string, blocks: any[]) => void;
}) {
  const [currentDate, setCurrentDate] = useState(parseDate(SYSTEM_TODAY));

  const allBrands = entities.filter((e) => e.type === "brand");
  const allProjects = entities.filter((e) => e.type === "project");
  const allEvents = entities.filter((e) => e.type === "event");

  const [filters, setFilters] = useState<{
    brands: string[] | "all";
    projects: string[] | "all";
    events: string[] | "all";
  }>({
    brands: "all",
    projects: "all",
    events: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Apply Start Day
  useMemo(() => {
    moment.updateLocale("en", {
      week: {
        dow: calendarConfig?.startDay === "monday" ? 1 : 0,
      },
    });
  }, [calendarConfig?.startDay]);

  // Gather all items
  const eventsList: any[] = [];

  entities.forEach((entity) => {
    if (
      entity.type === "brand" &&
      filters.brands !== "all" &&
      !filters.brands.includes(entity.id)
    )
      return;
    if (
      entity.type === "project" &&
      filters.projects !== "all" &&
      !filters.projects.includes(entity.id)
    )
      return;
    if (
      entity.type === "event" &&
      filters.events !== "all" &&
      !filters.events.includes(entity.id)
    )
      return;

    (entity.tasks || []).forEach((task) => {
      task.blocks.forEach((block) => {
        if (block.startDate) {
          const start = parseDate(block.startDate);
          const end = block.endDate
            ? parseDate(block.endDate)
            : parseDate(block.startDate);

          eventsList.push({
            id: block.id,
            title: task.title,
            start: start,
            end: end,
            allDay: true,
            task: task,
            entity: entity,
            color: task.color || entity.color,
          });
        }
      });
    });
  });

  if (calendarConfig?.nationalCalendar) {
    const year = currentDate.getFullYear();
    const holidays = hd.getHolidays(year);
    holidays.forEach((h) => {
      eventsList.push({
        id: `hol-${h.date}`,
        title: h.name,
        start: new Date(h.date),
        end: new Date(h.date),
        allDay: true,
        color: "var(--text-muted)",
        isHoliday: true,
      });
    });
  }

  const goPrev = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const goNext = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const goToday = () => setCurrentDate(parseDate(SYSTEM_TODAY));

  const toggleFilter = (type: "brands" | "projects" | "events", id: string) => {
    setFilters((prev) => {
      const curr = prev[type];
      if (id === "all") return { ...prev, [type]: "all" };

      let nextList: string[];
      if (curr === "all") {
        nextList = [id];
      } else {
        nextList = curr.includes(id)
          ? curr.filter((x) => x !== id)
          : [...curr, id];
      }
      if (nextList.length === 0) return { ...prev, [type]: "all" };
      return { ...prev, [type]: nextList };
    });
  };

  const isSelected = (type: "brands" | "projects" | "events", id: string) => {
    const curr = filters[type];
    if (id === "all") return curr === "all";
    if (curr === "all") return true;
    return curr.includes(id);
  };

  const handleEventDrop = ({ event, start, end }: any) => {
    if (!onUpdateBlocks || event.isHoliday) return;
    const newStartStr = formatDate(start);
    const newEndStr = formatDate(end);
    const newBlocks = event.task.blocks.map((b: any) =>
      b.id === event.id
        ? { ...b, startDate: newStartStr, endDate: newEndStr }
        : b,
    );
    onUpdateBlocks(event.task.id, newBlocks);
  };

  const handleEventResize = ({ event, start, end }: any) => {
    if (!onUpdateBlocks || event.isHoliday) return;
    const newStartStr = formatDate(start);
    const newEndStr = formatDate(end);
    const newBlocks = event.task.blocks.map((b: any) =>
      b.id === event.id
        ? { ...b, startDate: newStartStr, endDate: newEndStr }
        : b,
    );
    onUpdateBlocks(event.task.id, newBlocks);
  };

  return (
    <div
      className="h-full w-full flex flex-col p-8 relative"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <style>{`
         .rbc-calendar { font-family: inherit; }
         .rbc-header { padding: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; border-color: var(--border-color) !important; color: var(--text-muted); }
         .rbc-month-view, .rbc-month-row, .rbc-day-bg, .rbc-time-view, .rbc-time-header-content { border-color: var(--border-color) !important; }
         .rbc-today { background-color: rgba(255,0,0,0.05); }
         .rbc-event { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
         .rbc-off-range-bg { background-color: var(--bg-surface); opacity: 0.3; }
         .rbc-btn-group button { color: var(--text-primary); border-color: var(--border-color); }
         .rbc-btn-group button.rbc-active { background-color: var(--accent); color: black; border-color: var(--accent); }
         .rbc-btn-group button:hover { background-color: var(--bg-surface-hover); }
         .rbc-toolbar button { font-weight: bold; }
      `}</style>

      <div className="flex justify-between items-center mb-6 z-10 shrink-0">
        <div className="flex flex-col">
          <span className="text-sm font-bold opacity-50 uppercase tracking-widest">
            {currentDate.getFullYear()}
          </span>
          <h2 className="text-3xl font-black">
            {moment(currentDate).format("MMMM")}
          </h2>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 rounded-xl border flex items-center justify-center gap-2 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-color)",
              }}
            >
              <Filter size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Filters
              </span>
            </button>

            {showFilters && (
              <div
                className="absolute top-full right-0 mt-2 p-5 w-72 bg-[var(--bg-surface)] border shadow-xl rounded-2xl z-50 flex flex-col gap-5 max-h-[60vh] overflow-y-auto custom-scrollbar"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div>
                  <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-3">
                    Brands
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleFilter("brands", "all")}
                      className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-bold transition-colors ${isSelected("brands", "all") ? "bg-black/10 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                    >
                      All Brands{" "}
                      {isSelected("brands", "all") && (
                        <Check size={14} className="text-[var(--accent)]" />
                      )}
                    </button>
                    {allBrands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => toggleFilter("brands", b.id)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-bold transition-colors ${isSelected("brands", b.id) && !isSelected("brands", "all") ? "bg-black/10 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                      >
                        {b.name}{" "}
                        {isSelected("brands", b.id) &&
                          !isSelected("brands", "all") && (
                            <Check size={14} className="text-[var(--accent)]" />
                          )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-3">
                    Projects
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleFilter("projects", "all")}
                      className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-bold transition-colors ${isSelected("projects", "all") ? "bg-black/10 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                    >
                      All Projects{" "}
                      {isSelected("projects", "all") && (
                        <Check size={14} className="text-[var(--accent)]" />
                      )}
                    </button>
                    {allProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleFilter("projects", p.id)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-bold transition-colors ${isSelected("projects", p.id) && !isSelected("projects", "all") ? "bg-black/10 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                      >
                        {p.name}{" "}
                        {isSelected("projects", p.id) &&
                          !isSelected("projects", "all") && (
                            <Check size={14} className="text-[var(--accent)]" />
                          )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-3">
                    Events
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleFilter("events", "all")}
                      className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-bold transition-colors ${isSelected("events", "all") ? "bg-black/10 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                    >
                      All Events{" "}
                      {isSelected("events", "all") && (
                        <Check size={14} className="text-[var(--accent)]" />
                      )}
                    </button>
                    {allEvents.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => toggleFilter("events", e.id)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-sm font-bold transition-colors ${isSelected("events", e.id) && !isSelected("events", "all") ? "bg-black/10 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                      >
                        {e.name}{" "}
                        {isSelected("events", e.id) &&
                          !isSelected("events", "all") && (
                            <Check size={14} className="text-[var(--accent)]" />
                          )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={goToday}
            className="px-4 py-2 font-bold text-sm bg-[var(--bg-surface)] border rounded-xl hover:bg-[var(--bg-muted)] transition-colors shadow-sm"
            style={{ borderColor: "var(--border-color)" }}
          >
            Today
          </button>

          <div
            className="flex bg-[var(--bg-surface)] border rounded-xl shadow-sm"
            style={{ borderColor: "var(--border-color)" }}
          >
            <button
              onClick={goPrev}
              className="p-2 hover:bg-[var(--bg-muted)] rounded-l-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="p-2 hover:bg-[var(--bg-muted)] rounded-r-xl transition-colors border-l"
              style={{ borderColor: "var(--border-color)" }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex-1 bg-[var(--bg-surface)] border rounded-3xl shadow-xl overflow-hidden relative z-0 p-4"
        style={{ borderColor: "var(--border-color)" }}
      >
        <DnDCalendar
          localizer={localizer}
          events={eventsList}
          date={currentDate}
          onNavigate={(d) => setCurrentDate(d)}
          startAccessor={(event: any) => event.start}
          endAccessor={(event: any) => event.end}
          views={["month", "week", "day"]}
          defaultView="month"
          eventPropGetter={(event: any) => ({
            style: {
              backgroundColor: event.color,
              color: "black",
            },
          })}
          toolbar={false}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectEvent={(event: any) =>
            !event.isHoliday && onEditTask && onEditTask(event.task)
          }
          resizable
          selectable
        />
      </div>
    </div>
  );
}
