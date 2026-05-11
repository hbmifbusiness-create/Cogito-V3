export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'to do' | 'in progress' | 'complete' | 'scrapped' | 'missed' | 'upcoming' | 'planning' | 'active';
export type EntityType = 'brand' | 'event' | 'mix' | 'project' | 'task';

export interface CalendarConfig {
  startDay: 'monday' | 'sunday';
  format: 'dd/mm/yy' | 'mm/dd/yy';
  googleSynced: boolean;
  nationalCalendar: boolean;
}

export interface Block {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  color: string;
  blocks: Block[];
  computed?: { cStatus: Status; cPriority: Priority };
  brandTags?: string[];
  projectTags?: string[];
  eventTags?: string[];
  socialTags?: string[];
  financials?: { cost: number; earnings: number; isRecurring?: boolean; recurrenceInterval?: string };
}

export interface FontDetails {
  id: string;
  name: string;
  type: string;
  fontFamilyType: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  weightsAndStyles: string;
  substitutions: string;
  spacing: { kerning: string; tracking: string; leading: string };
  formatting: { capitalization: string; colorValues: { pantone: string; cmyk: string; rgbHex: string }; allowedEffects: string };
  fileUrl?: string;
}

export interface BrandImage {
  id: string;
  url: string;
  name: string;
  type: string;
  customType?: string;
  width: number;
  height: number;
  size: number;
}

export interface BrandDetails {
  mission?: string;
  tagline?: string;
  description?: string;
  logo?: string;
  logoShape?: 'circle' | 'square';
  icons?: BrandImage[];
  images?: BrandImage[];
  colors: string[] | Record<string, string>;
  fonts: FontDetails[] | Record<string, string>;
  history: BrandHistoryEntry[];
  moodboard?: Moodboard;
  pinterest?: {
    connected: boolean;
    accessToken?: string;
    boards: PinterestBoard[];
  };
  financials?: {
    recurringCosts: { id: string; name: string; amount: number; interval: string }[];
    oneOffCosts: { id: string; name: string; amount: number; date: string }[];
    earnings: { id: string; name: string; amount: number; date: string }[];
  };
}

export interface PinterestBoard {
  id: string;
  name: string;
  image?: string;
}

export interface Moodboard {
  sections: MoodboardSection[];
  items: MoodboardItem[];
}

export interface MoodboardSection {
  id: string;
  name: string;
  description?: string;
}

export interface MoodboardItem {
  id: string;
  url: string;
  type: 'image' | 'color' | 'text';
  name?: string;
  tags: string[];
  suggestedTags?: string[];
  style?: string;
  theme?: string;
  palette?: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  sectionId?: string;
}

export interface BrandHistoryEntry {
  id: string;
  date: string;
  description: string;
  data?: {
    logo?: string;
    icons?: BrandImage[];
    colors: string[];
    fonts: FontDetails[];
  };
}

export interface WorkspaceEntity {
  id: string;
  type: EntityType;
  name: string;
  color: string;
  status: Status; 
  priority?: Priority;
  tasks: Task[];
  parentId?: string | null;
  brandTags?: string[];
  projectTags?: string[];
  eventTags?: string[];
  brandDetails?: BrandDetails;
  projectDetails?: { notes?: string; contacts?: string[]; description?: string };
  eventDetails?: { 
    time?: string;
    location?: string;
    notes?: string;
    contacts?: string[];
    description?: string;
    financials?: {
      cost: number;
      earnings: number;
      net?: number;
    }
  };
  createdAt: number;
}
export type Project = WorkspaceEntity;

