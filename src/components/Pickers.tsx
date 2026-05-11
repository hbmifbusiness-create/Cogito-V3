import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import {
  SYSTEM_TODAY,
  parseDate,
  formatDate,
  addDays,
  formatDisplayDate,
} from "../utils";

export const PRIORITY_COLORS: Record<string, string> = {
  none: "transparent",
  low: "#86efac", // lighter green than progress bar (#22c55e)
  medium: "#FACC15",
  high: "#FB923C",
  urgent: "#EF4444", // typical red used for missed before
};

export const MISSED_COLOR = "#7f1d1d"; // Very dark, blood red

export const TICK_PATTERN = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 6L9 17l-5-5' stroke='rgba(0,0,0,0.15)' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;
export const EXCLAMATION_PATTERN = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='12' y='18' font-size='16' font-weight='900' font-family='sans-serif' fill='rgba(255,0,0,0.2)' text-anchor='middle'%3E!%3C/text%3E%3C/svg%3E")`;

export const InlinePriorityPicker = ({
  priority,
  onChange,
}: {
  priority: string;
  onChange: (p: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen(!open);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      document.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
    }
    return () => {
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="text-[10px] font-black tracking-wider transition-all flex items-center justify-center relative shrink-0 z-10"
        style={{ color: priority === "none" ? "var(--text-primary)" : "white" }}
      >
        {priority === "none" ? (
          <div className="flex items-center gap-1 uppercase">
            No Priority <ChevronDown size={10} />
          </div>
        ) : (
          <div
            className="flex items-center gap-2 uppercase px-2 py-1 rounded shadow-sm border border-black/10"
            style={{
              backgroundColor:
                PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
            }}
          >
            {priority} <ChevronDown size={10} className="opacity-80" />
          </div>
        )}
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div
              className="fixed inset-0 border-0"
              style={{ zIndex: 99999998, background: "transparent" }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              style={{
                position: "fixed",
                top:
                  rect.bottom + 4 + 160 > window.innerHeight
                    ? rect.top - 160
                    : rect.bottom + 4,
                left:
                  rect.left + 150 > window.innerWidth
                    ? window.innerWidth - 160
                    : rect.left,
                zIndex: 99999999,
              }}
              className="bg-[var(--bg-surface-hover)] border border-[var(--border-color)] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.6)] w-36 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {["none", "low", "medium", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-surface-hover)] text-left text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-sm border border-white/20 shrink-0"
                    style={{ backgroundColor: PRIORITY_COLORS[p] }}
                  />{" "}
                  {p === "none" ? "No Priority" : p}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

export const DatePicker = ({
  value,
  onChange,
  allowClear,
  calendarConfig,
}: {
  value: string;
  onChange: (v: string) => void;
  allowClear: boolean;
  calendarConfig?: any;
}) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    value ? parseDate(value) : parseDate(SYSTEM_TODAY),
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: 11 },
    (_, i) => viewDate.getFullYear() - 5 + i,
  );

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (value && !open) {
      setViewDate(parseDate(value));
    }
  }, [value, open]);

  useEffect(() => {
    const handleClose = () => setOpen(false);
    if (open) {
      window.addEventListener("resize", handleClose);
      document.addEventListener("scroll", handleClose, true);
    }
    return () => {
      window.removeEventListener("resize", handleClose);
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [open]);

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const isMondayStart = calendarConfig?.startDay === "monday";
  let startingBlankDays = firstDayObj.getDay();
  if (isMondayStart) {
    startingBlankDays = startingBlankDays === 0 ? 6 : startingBlankDays - 1;
  }

  const dayHeaders = isMondayStart
    ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-left text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors flex justify-between items-center whitespace-nowrap"
      >
        {value ? (
          calendarConfig?.format ? (
            formatDisplayDate(value, calendarConfig.format)
          ) : (
            parseDate(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          )
        ) : (
          <span className="text-[var(--text-muted)]">
            {allowClear ? "No Due Date" : "Select Date"}
          </span>
        )}
        <CalendarIcon
          size={14}
          className="text-[var(--text-muted)] shrink-0 ml-2"
        />
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div
              className="fixed inset-0 border-0"
              style={{ zIndex: 99999998, background: "transparent" }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              className="fixed bg-[var(--bg-surface-hover)] border border-[var(--border-color)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 w-72 animate-in fade-in zoom-in-95"
              style={{
                top:
                  rect.bottom + 8 + 320 > window.innerHeight
                    ? rect.top - 330
                    : rect.bottom + 8,
                left:
                  rect.left + 288 > window.innerWidth
                    ? window.innerWidth - 300
                    : rect.left,
                zIndex: 99999999,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 mb-4 items-center">
                <select
                  value={viewDate.getMonth()}
                  onChange={(e) => {
                    const d = new Date(viewDate);
                    d.setMonth(parseInt(e.target.value));
                    setViewDate(d);
                  }}
                  className="flex-1 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-bold p-2 rounded-lg outline-none border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors cursor-pointer appearance-none"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={viewDate.getFullYear()}
                  onChange={(e) => {
                    const d = new Date(viewDate);
                    d.setFullYear(parseInt(e.target.value));
                    setViewDate(d);
                  }}
                  className="w-24 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-bold p-2 rounded-lg outline-none border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors cursor-pointer appearance-none text-center"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {dayHeaders.map((d) => (
                  <div
                    key={d}
                    className="text-[10px] font-black text-[var(--text-muted)] uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: startingBlankDays }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dStr = formatDate(
                    new Date(
                      viewDate.getFullYear(),
                      viewDate.getMonth(),
                      dayNum,
                    ),
                  );
                  const isSelected = value === dStr;
                  const isToday = SYSTEM_TODAY === dStr;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        onChange(dStr);
                        setOpen(false);
                      }}
                      className={`w-8 h-8 mx-auto rounded-lg text-sm font-bold flex items-center justify-center transition-all ${isSelected ? "bg-[var(--accent)] text-black shadow-md shadow-sm shadow-[var(--accent)]" : isToday ? "bg-red-500/20 text-red-400" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"}`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2 w-full">
                {allowClear && (
                  <button
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className="flex-1 py-2 bg-black/20 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                  >
                    No due date
                  </button>
                )}
                <button
                  onClick={() => {
                    onChange(SYSTEM_TODAY);
                    setOpen(false);
                  }}
                  className="flex-1 py-2 bg-[var(--accent)] text-black text-xs font-bold rounded-lg transition-all hover:brightness-110 shadow-sm border border-[var(--accent)]"
                >
                  Today
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

export const ProgressRing = ({
  percent,
  size = 32,
  strokeWidth = 3,
  showNumber = false,
  className = "",
}: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          stroke="rgba(255,255,255,0.2)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#22C55E"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showNumber && (
        <span className="absolute text-[10px] font-black text-[var(--text-primary)]">
          {Math.round(percent)}
        </span>
      )}
    </div>
  );
};
