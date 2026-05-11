import { Task, CalendarConfig } from './types';

export const SYSTEM_TODAY = '2026-05-10'; // Using the assumed current date

export const parseDate = (str: string) => new Date(`${str}T00:00:00`);
export const formatDate = (date: Date) => {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const dy = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
};

export const formatDisplayDate = (dateStr: string, format: CalendarConfig['format']) => {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return '';
  const yr = d.getFullYear().toString().slice(-2);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return format === 'dd/mm/yy' ? `${dy}/${mo}/${yr}` : `${mo}/${dy}/${yr}`;
};

export const addDays = (dateStr: string, days: number) => {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const getDiffDays = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return 0;
  const diffTime = parseDate(endStr).getTime() - parseDate(startStr).getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const hexToRgba = (hex: string, alpha: number) => {
  if(!hex) return 'transparent';
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : 'transparent';
};

export const getTaskComputedState = (task: Task) => {
  let cStatus = task.status || 'to do'; 
  let cPriority = task.priority || 'none';

  if (cStatus !== 'complete' && cStatus !== 'scrapped') {
    const blocks = task.blocks || [];
    if (blocks.length > 0) {
       const validEnds = blocks.map(b => b.endDate).filter(Boolean).sort();
       const latestEnd = validEnds.length > 0 ? validEnds[validEnds.length - 1] : null;
       const validStarts = blocks.map(b => b.startDate).filter(Boolean).sort();
       const earliestStart = validStarts.length > 0 ? validStarts[0] : null;

       if (latestEnd && latestEnd < SYSTEM_TODAY) {
          cStatus = 'missed';
       } else if (earliestStart && earliestStart <= SYSTEM_TODAY && cStatus !== 'missed') {
          cStatus = 'in progress';
       }

       if (latestEnd === SYSTEM_TODAY && cStatus !== 'missed') {
          cPriority = 'urgent';
       }
    }
  }
  return { cStatus, cPriority };
};

export const calcTaskProgress = (task: Task) => {
  if (task.status === 'complete') return 100;
  if (task.blocks && task.blocks.length > 0) {
    const completed = task.blocks.filter(b => b.completed).length;
    return (completed / task.blocks.length) * 100;
  }
  return 0;
};

export const calcProjectProgress = (entity: any) => {
  if (!entity) return 0;
  const validTasks = (entity.tasks || []).filter((t: any) => t.status !== 'scrapped');
  if (validTasks.length === 0) return 0;
  let total = 0;
  validTasks.forEach((t: any) => {
     if (t.status === 'complete') total += 100;
     else if (t.blocks && t.blocks.length > 0) {
       total += (t.blocks.filter((b: any) => b.completed).length / t.blocks.length) * 100;
     }
  });
  return total / validTasks.length;
};
