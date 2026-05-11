import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Kanban,
  CalendarDays,
  Plus,
  Calendar as CalendarIcon,
  Settings,
  Target,
  Zap,
  Music,
  FolderClosed,
  CheckSquare,
  Layers,
  BarChart,
  Home,
  LayoutDashboard,
  X,
  ArrowRight,
  Pencil,
  ChevronDown,
  Sparkles,
  DollarSign,
  Search,
  Briefcase
} from "lucide-react";
import { Toaster, toast } from 'react-hot-toast';
import {
  WorkspaceEntity,
  Task,
  Block,
  EntityType,
  CalendarConfig,
} from "./types";
import { SYSTEM_TODAY, parseDate } from "./utils";
import { ProgressRing } from "./components/Pickers";
import { TimelineView } from "./components/TimelineView";
import { BoardView } from "./components/BoardView";
import { ModalDialog } from "./components/Modals";
import { BrandManagementView } from "./components/BrandManagementView";

const initialData: WorkspaceEntity[] = [
  {
    id: "e1",
    type: "brand",
    name: "Personal Brand",
    color: "bg-[var(--accent)]",
    status: "active",
    tasks: [],
    createdAt: 1715424000000, 
    brandDetails: {
      logo: "",
      colors: ["#0A0A0A", "#FFFFFF", "#CFFF04"],
      fonts: [
        {
          id: "f1",
          name: "Inter",
          type: "Primary",
          fontFamilyType: "sans-serif",
          weightsAndStyles: "Regular, Medium, Bold",
          substitutions: "Arial",
          spacing: { kerning: "0", tracking: "0", leading: "1.5" },
          formatting: {
            capitalization: "Sentence case",
            colorValues: { pantone: "", cmyk: "", rgbHex: "#000000" },
            allowedEffects: "None",
          },
        },
        {
          id: "f2",
          name: "Space Grotesk",
          type: "Secondary",
          fontFamilyType: "sans-serif",
          weightsAndStyles: "Bold",
          substitutions: "Helvetica",
          spacing: { kerning: "0", tracking: "0", leading: "1.2" },
          formatting: {
            capitalization: "All-caps for headings",
            colorValues: { pantone: "", cmyk: "", rgbHex: "#000000" },
            allowedEffects: "None",
          },
        },
      ],
      history: [],
    },
  },
  {
    id: "e2",
    type: "project",
    name: "Website Redesign",
    color: "bg-blue-500",
    status: "active",
    createdAt: 1715424000001,
    tasks: [
      {
        id: "t1",
        title: "Design wireframes",
        description: "Create initial wireframes.",
        status: "to do",
        priority: "high",
        color: "#3B82F6",
        blocks: [
          {
            id: "b1",
            name: "Homepage",
            startDate: "2026-05-08",
            endDate: "2026-05-12",
            completed: false,
          },
        ],
      },
      {
        id: "t2",
        title: "Set up repository",
        description: "Initialize Git repo.",
        status: "in progress",
        priority: "medium",
        color: "#8B5CF6",
        blocks: [
          {
            id: "b3",
            name: "Git Setup",
            startDate: "2026-05-13",
            endDate: "2026-05-14",
            completed: false,
          },
        ],
      },
      {
        id: "t3",
        title: "Client kickoff",
        description: "Discuss goals.",
        status: "complete",
        priority: "low",
        color: "#10B981",
        blocks: [
          {
            id: "b4",
            name: "Zoom Call",
            startDate: "2026-05-06",
            endDate: "2026-05-06",
            completed: true,
          },
        ],
      },
    ],
  },
];

import { SettingsView } from "./components/SettingsView";
import { GlobalCalendarView } from "./components/GlobalCalendarView";
import { AnalyticsView } from "./components/AnalyticsView";
import { DetailsView } from "./components/DetailsView";
import { InfoCardView } from "./components/InfoCardView";
import { ProjectDetailsView } from "./components/ProjectDetailsView";
import { MarketingView } from "./components/MarketingView";
import { FinanceTrackerView } from "./components/FinanceTrackerView";
import { Sidebar } from "./components/PlannerView";
import { HomeView } from "./components/HomeView";
import { AIChat } from "./components/AIChat";
import { MindMapView } from "./components/MindMapView";
import { ProposalView } from "./components/ProposalView";
import { BrandWorkshopView } from "./components/BrandWorkshopView";

const getEntityIcon = (type: EntityType) => {
  switch (type) {
    case "brand":
      return <Target size={14} />;
    case "event":
      return <Zap size={14} />;
    case "mix":
      return <Music size={14} />;
    case "project":
      return <FolderClosed size={14} />;
    case "task":
      return <CheckSquare size={14} />;
    default:
      return <Layers size={14} />;
  }
};

import {
  AllEntitiesListView,
  AllTasksListView,
  TotalFinancesView,
} from "./components/GlobalViews";

import { Dropdown } from "./components/Dropdown";

export const getLuminance = (hex: string) => {
  if (!hex || typeof hex !== 'string') return 0;
  const cleanHex = hex.replace("#", "");
  const rgb = parseInt(cleanHex, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export default function App() {
  const [entities, setEntities] = useState<WorkspaceEntity[]>(initialData);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState("system"); // 'system', 'light', 'dark', 'brand'
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    readingMode: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: "md", // 'sm', 'md', 'lg', 'xl'
  });
  const [activeBrandThemeId, setActiveBrandThemeId] = useState<string | null>(
    null,
  );
  const [brandTextOverrides, setBrandTextOverrides] = useState<
    Record<string, boolean>
  >({});
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig>({
    startDay: "monday",
    format: "dd/mm/yy",
    googleSynced: false,
    nationalCalendar: false,
  });
  const [isProjectNavOpen, setIsProjectNavOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isIconHovered, setIsIconHovered] = useState(false);

  const leftSectionRef = React.useRef<HTMLDivElement>(null);
  const headerDividerRef = React.useRef<HTMLDivElement>(null);
  const [navMenuWidth, setNavMenuWidth] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    let animationFrameId: number;
    
    const updateSize = () => {
      // Find the divider and use its center to set the dropdown width
      if (headerDividerRef.current) {
        const rect = headerDividerRef.current.getBoundingClientRect();
        // Width will be exactly equal to the midpoint of the divider
        // Since left is 0, the width is the x coordinate of the divider's center
        setNavMenuWidth(Math.floor(rect.left + rect.width / 2));
      } else if (leftSectionRef.current) {
        setNavMenuWidth(leftSectionRef.current.getBoundingClientRect().right);
      }
    };

    const observer = new ResizeObserver(() => {
      animationFrameId = requestAnimationFrame(updateSize);
    });

    if (leftSectionRef.current) observer.observe(leftSectionRef.current);
    if (headerDividerRef.current) observer.observe(headerDividerRef.current);
    observer.observe(document.body);
    
    window.addEventListener('resize', updateSize);
    
    // Initial update
    updateSize();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [projectFilter, setProjectFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [settingsFilter, setSettingsFilter] = useState("appearance");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Debounced window resize listener
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const DEFAULT_ACCENT = "#E2E8F0"; // Clean Slate

  const colors = {
    system: DEFAULT_ACCENT,
    brand: "#FF3366", // Vibrant Rose
    project: "#3366FF", // Royal Blue
    event: "#FF9933", // Blaze Orange
    task: "#00E676"  // Spring Green
  };

  const familyUnits: Record<string, any> = {
    brand: {
      primaryId: 1,
      type: "brand",
      label: "Brands",
      plural: "Brands",
      color: colors.brand,
      icon: <Target size={22} />,
      statusModes: ["all", "brainstorming", "designing", "active", "rebranding", "scrapped"],
      memberTabs: ["Strategy", "Identity", "Reach", "Operations", "Finances", "Workshop"],
      view: "brand_landing",
      magnitude: 1,
      children: {
        Strategy: ["Info Card", "Purpose", "Edit Details", "Brainstorm", "Proposed"],
        Identity: ["design", "vault", "guidelines", "moodboard", "workshop"],
        Reach: ["analytics", "schedule", "crosspost"]
      }
    },
    project: {
      primaryId: 2,
      type: "project",
      label: "Projects",
      plural: "Projects",
      color: colors.project,
      icon: <FolderClosed size={22} />,
      statusModes: ["all", "idea", "ongoing", "complete", "scrapped"],
      memberTabs: ["details", "planner", "brainstorm"],
      view: "project_landing",
      magnitude: 2,
      children: {
        planner: ["board", "timeline"],
        details: ["info", "proposed"]
      }
    },
    event: {
      primaryId: 3,
      type: "event",
      label: "Events",
      plural: "Events",
      color: colors.event,
      icon: <CalendarIcon size={22} />,
      statusModes: ["all", "upcoming", "planning", "active", "complete", "scrapped"],
      memberTabs: ["details", "planner"],
      view: "event_landing",
      magnitude: 3,
      children: {
        planner: ["board", "timeline"]
      }
    },
    task: {
      primaryId: 4,
      type: "task",
      label: "Tasks",
      plural: "Tasks",
      color: colors.task,
      icon: <CheckSquare size={22} />,
      statusModes: ["all", "to do", "in progress", "complete", "scrapped", "missed"],
      memberTabs: ["details"], 
      view: "task_landing",
      magnitude: 4,
    },
    home: {
      primaryId: 0,
      type: "home",
      label: "Home",
      plural: "Home",
      color: colors.system,
      icon: <Home size={22} />,
      memberTabs: ["home_dashboard", "home_planning", "home_statistics", "home_finances"],
      view: "homepage",
      magnitude: 0,
      children: {
        home_planning: ["Calendar", "Timeline"]
      }
    },
    settings: {
      primaryId: 5,
      type: "settings",
      label: "Settings",
      plural: "Settings",
      color: colors.system,
      icon: <Settings size={22} />,
      memberTabs: ["appearance", "accounts", "accessibility", "calendar", "info"],
      view: "settings",
      magnitude: 5
    }
  };

  const [activeEntityId, setActiveEntityId] = useState<string>("");
  const [currentView, setCurrentView] = useState("homepage"); 
  const [activeSubTab, setActiveSubTab] = useState<string>("Calendar"); 

  const activeEntity = entities.find((e) => e.id === activeEntityId);
  const globalViews = [
    "brand_landing",
    "project_landing",
    "event_landing",
    "task_landing",
    "total_finances",
    "global_calendar",
    "homepage",
    "settings",
    ...familyUnits.home.memberTabs
  ];
  const isGlobalView = globalViews.includes(currentView);

  // Determine current context for rendering and header
  let activeFamily: any = null;
  let isMemberView = false;
  let headerTitle = "";
  let unitTitle = "";

  if (activeEntity && !isGlobalView) {
    activeFamily = familyUnits[activeEntity.type];
    isMemberView = true;
    headerTitle = activeFamily?.plural || activeFamily?.label || "";
    unitTitle = activeEntity.name;
    activeFamily = { ...activeFamily };
  } else if (isGlobalView) {
    if (currentView === "homepage" || currentView === "settings" || familyUnits.home.memberTabs.includes(currentView) || Object.values(familyUnits.home.children || {}).flat().includes(currentView)) {
      const type = currentView === "settings" ? "settings" : "home";
      activeFamily = { ...familyUnits[type] }; // clone
      headerTitle = activeFamily.label;
      
      if (type === 'home') {
        if (currentView === 'homepage') {
          unitTitle = "";
        } else if (activeFamily.memberTabs.includes(currentView)) {
          // Optionally, assign a specific icon based on the tab
          if (currentView === 'home_dashboard') { activeFamily.icon = <Home size={22} />; headerTitle = "Dashboard"; unitTitle = ""; }
          if (currentView === 'home_planning') { activeFamily.icon = <CalendarIcon size={22} />; headerTitle = "Planning"; unitTitle = ""; }
          if (currentView === 'home_statistics') { activeFamily.icon = <BarChart size={22} />; headerTitle = "Statistics"; unitTitle = ""; }
          if (currentView === 'home_finances') { activeFamily.icon = <DollarSign size={22} />; headerTitle = "Finances"; unitTitle = ""; }

          // If there is an active sub-tab that is a child of this parent, show the sub-tab instead
          if (activeSubTab && familyUnits.home.children?.[currentView]?.includes(activeSubTab)) {
            unitTitle = activeSubTab;
          }
        } else {
            // Find if current view is a child tab
            const parentTab = Object.keys(activeFamily.children || {}).find(k => activeFamily.children[k].includes(activeSubTab));
            unitTitle = activeSubTab;
        }
      } else {
        unitTitle = currentView === 'settings' ? "System Settings" : "Workspace Home";
      }
    } else {
      const type = currentView.replace("all_", "").slice(0, -1);
      activeFamily = familyUnits[type === "task" ? "task" : type];
      if (!activeFamily && currentView === "task_landing") activeFamily = familyUnits.task;
      
      if (currentView === "total_finances") {
        activeFamily = { label: "Statistics", color: DEFAULT_ACCENT, icon: <BarChart size={22} />, view: "total_finances", type: "stats", primaryId: 0 };
      }
      if (currentView === "global_calendar") {
        activeFamily = { label: "Calendar", color: DEFAULT_ACCENT, icon: <CalendarIcon size={22} />, view: "global_calendar", type: "calendar", primaryId: 0 };
      }
      headerTitle = activeFamily?.plural || activeFamily?.label || "";
      unitTitle = "";
    }
  }

  const getHierarchyValue = () => {
    if (!activeFamily) return "0000";
    const fId = activeFamily.primaryId !== undefined ? activeFamily.primaryId : 0;
    
    let uId = 0;
    if (activeEntity) {
      const units = entities
        .filter(e => e.type === activeEntity.type)
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      uId = units.findIndex(u => u.id === activeEntity.id) + 1;
    } else if (activeFamily.type === 'home' || activeFamily.type === 'settings') {
      uId = activeFamily.type === 'home' ? 1 : 2;
    }

    let tId = 1;
    if (activeFamily.memberTabs) {
      const idx = activeFamily.memberTabs.indexOf(currentView);
      if (idx !== -1) tId = idx + 1;
      else if (activeFamily.type === 'settings') {
        const sIdx = activeFamily.memberTabs.indexOf(settingsFilter);
        if (sIdx !== -1) tId = sIdx + 1;
      }
    }

    let sId = 0;
    if (activeFamily.children?.[currentView]) {
      const idx = activeFamily.children[currentView].indexOf(activeSubTab);
      if (idx !== -1) sId = idx + 1;
    }

    return `${fId}${uId}${tId}${sId}`;
  };

  const pageHierarchyCode = getHierarchyValue();

  // Handle privacy policy deep link
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "privacy") {
      setSettingsFilter("info");
      setCurrentView("settings");
    }
  }, []);

  // Theme styling overrides via a style tag and CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    let currentTheme = theme;
    
    // Mapping themes to fonts and base colors
    const themeConfigs: Record<string, any> = {
      brutalism: { 
        sans: '"Archivo"', display: '"Archivo Black"', 
        bg: "#000000", surface: "#111111", muted: "#222222", 
        text: "#FFFFFF", secondary: "#CCCCCC", border: "#FFFFFF",
        accentOverride: "#FACC15",
        radius: "0px", cardRadius: "0px", borderWidth: "3px",
      },
      grunge: { 
        sans: '"Special Elite"', display: '"Special Elite"', 
        bg: "#1a1a1a", surface: "#2a2a2a", muted: "#0a0a0a", 
        text: "#e5e5e5", secondary: "#a3a3a3", border: "rgba(255,255,255,0.2)",
        accentOverride: "#991B1B",
        radius: "2px", cardRadius: "4px", borderWidth: "1px",
        pattern: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")"
      },
      anthropomorphic: { 
        sans: '"Fredoka"', display: '"Fredoka"', 
        bg: "#FFFBEB", surface: "#FEF3C7", muted: "#FDE68A", 
        text: "#92400E", secondary: "#B45309", border: "#92400E",
        accentOverride: "#F59E0B",
        radius: "24px", cardRadius: "48px", borderWidth: "2px",
      },
      bauhaus: { 
        sans: '"Montserrat"', display: '"Montserrat"', 
        bg: "#F3F4F6", surface: "#FFFFFF", muted: "#E5E7EB", 
        text: "#111827", secondary: "#4B5563", border: "#111827",
        accentOverride: "#DC2626",
        radius: "0px", cardRadius: "0px", borderWidth: "2px",
      },
      cybercore: { 
        sans: '"Orbitron"', display: '"Orbitron"', 
        bg: "#020617", surface: "#0f172a", muted: "#1e293b", 
        text: "#38BDF8", secondary: "#94A3B8", border: "#38BDF8",
        accentOverride: "#F472B6",
        radius: "12px", cardRadius: "24px", borderWidth: "1px",
        pattern: "repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.05) 0px, rgba(56, 189, 248, 0.05) 1px, transparent 1px, transparent 2px)"
      },
      rubberhose: { 
        sans: '"Bungee"', display: '"Bungee"', 
        bg: "#FFFFFF", surface: "#F4F4F5", muted: "#E5E5E5", 
        text: "#000000", secondary: "#3F3F46", border: "#000000",
        accentOverride: "#000000",
        radius: "60px", cardRadius: "120px", borderWidth: "4px",
      },
      brand: { sans: '"Inter"', display: '"Space Grotesk"', radius: "12px", cardRadius: "24px", borderWidth: "1px" },
      system: { sans: '"Inter"', display: '"Space Grotesk"', radius: "12px", cardRadius: "24px", borderWidth: "1px" },
      light: { sans: '"Inter"', display: '"Space Grotesk"', radius: "12px", cardRadius: "24px", borderWidth: "1px" },
      dark: { sans: '"Inter"', display: '"Space Grotesk"', radius: "12px", cardRadius: "24px", borderWidth: "1px" },
    };

    const config = themeConfigs[theme] || themeConfigs.system;
    root.style.setProperty("--font-sans", config.sans);
    root.style.setProperty("--font-display", config.display);
    root.style.setProperty("--theme-button-radius", config.radius || "12px");
    root.style.setProperty("--theme-card-radius", config.cardRadius || "24px");
    root.style.setProperty("--theme-border-width", config.borderWidth || "1px");
    root.style.setProperty("--theme-bg-pattern", config.pattern || "none");
    
    // Accessibility Overrides
    if (accessibilitySettings.readingMode) {
      root.style.setProperty("--font-sans", "'Georgia', serif");
      root.style.setProperty("--theme-line-height", "1.8");
    } else {
      root.style.setProperty("--theme-line-height", "1.5");
    }

    if (accessibilitySettings.highContrast) {
      root.style.setProperty("--bg-primary", "#000000");
      root.style.setProperty("--bg-surface", "#000000");
      root.style.setProperty("--bg-muted", "#222222");
      root.style.setProperty("--text-primary", "#FFFFFF");
      root.style.setProperty("--text-secondary", "#FFFFFF");
      root.style.setProperty("--text-muted", "#BBBBBB");
      root.style.setProperty("--border-color", "#FFFFFF");
      root.style.setProperty("--accent", "#00FF00");
    }

    const fontSizes: Record<string, string> = {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem"
    };
    root.style.setProperty("--theme-font-size", fontSizes[accessibilitySettings.fontSize] || "1rem");

    root.setAttribute('data-theme-animate', theme);

    if (theme === "system") {
      currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    let appBg = "";
    let currAccent = activeFamily?.color || DEFAULT_ACCENT;

    // Use current accent from the family logic
    root.style.setProperty("--accent", currAccent);

    const adjustHex = (hex: string, amount: number) => {
      let color = hex.replace("#", "");
      if (color.length === 3)
        color = color
          .split("")
          .map((c) => c + c)
          .join("");
      if (color.length !== 6) return hex;
      let r = parseInt(color.substring(0, 2), 16) + amount;
      let g = parseInt(color.substring(2, 4), 16) + amount;
      let b = parseInt(color.substring(4, 6), 16) + amount;
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    if (theme === "brand" && activeBrandThemeId) {
      const b = entities.find((x) => x.id === activeBrandThemeId);
      const colors = Array.isArray(b.brandDetails.colors)
        ? b.brandDetails.colors
        : Object.values(b.brandDetails.colors);

      if (b && b.brandDetails && colors.length > 0) {
        const sortedColors = [...colors];

        const getLuminance = (hex: string) => {
          const rgb = parseInt(hex.replace("#", ""), 16);
          const r = (rgb >> 16) & 0xff;
          const g = (rgb >> 8) & 0xff;
          const b = (rgb >> 0) & 0xff;
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        };

        colors.sort((a, b) => getLuminance(a) - getLuminance(b));
        const isSystemDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;

        let mainTextColor = "#ffffff";

        if (colors.length === 1) {
          currAccent = colors[0];
          appBg = isSystemDark ? "#050505" : "#ffffff";
          mainTextColor = isSystemDark ? "#ffffff" : "#000000";
        } else {
          if (isSystemDark) {
            appBg = colors[0];
            colors.splice(0, 1);
            currAccent = colors.pop()!;
          } else {
            appBg = colors[colors.length - 1];
            colors.splice(colors.length - 1, 1);
            currAccent = colors.shift()!;
          }

          if (colors.length > 0) {
            let bestText = colors[0];
            let bestContrast = 0;
            const bgLum = getLuminance(appBg);
            for (const c of colors) {
              const lum = getLuminance(c);
              const contrast =
                (Math.max(bgLum, lum) + 0.05) / (Math.min(bgLum, lum) + 0.05);
              if (contrast > bestContrast) {
                bestContrast = contrast;
                bestText = c;
              }
            }
            mainTextColor = bestText;
            if (bestContrast < 3.0) {
              mainTextColor = bgLum > 0.5 ? "#000000" : "#ffffff";
            }
          } else {
            const bgLum = getLuminance(appBg);
            mainTextColor = bgLum > 0.5 ? "#000000" : "#ffffff";
          }
        }

        const bgLum = getLuminance(appBg);
        const adjustDir = bgLum > 0.5 ? -1 : 1;
        const surfaceBg = adjustHex(appBg, adjustDir * 10);
        const surfaceHover = adjustHex(appBg, adjustDir * 20);
        const mutedBg = adjustHex(appBg, adjustDir * 30);
        const borderColor =
          bgLum > 0.5 ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)";

        root.style.setProperty("--bg-primary", appBg);
        root.style.setProperty("--bg-surface", surfaceBg);
        root.style.setProperty("--bg-surface-hover", surfaceHover);
        root.style.setProperty("--bg-muted", mutedBg);
        root.style.setProperty("--border-color", borderColor);

        root.style.setProperty("--accent", currAccent);
        let accentText = getLuminance(currAccent) > 0.5 ? "#000000" : "#ffffff";
        root.style.setProperty("--accent-text", accentText);

        root.style.setProperty("--text-primary", mainTextColor);
        root.style.setProperty(
          "--text-secondary",
          bgLum > 0.5 ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
        );
        root.style.setProperty(
          "--text-muted",
          bgLum > 0.5 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
        );
      } else {
        currentTheme = "light";
      }
    }

    if (theme !== "brand" || !activeBrandThemeId) {
      if (themeConfigs[theme] && theme !== 'system' && theme !== 'light' && theme !== 'dark') {
          const cfg = themeConfigs[theme];
          root.style.setProperty("--bg-primary", cfg.bg);
          root.style.setProperty("--bg-surface", cfg.surface);
          root.style.setProperty("--bg-surface-hover", cfg.surface + 'EE');
          root.style.setProperty("--bg-muted", cfg.muted);
          root.style.setProperty("--text-primary", cfg.text);
          root.style.setProperty("--text-secondary", cfg.secondary);
          root.style.setProperty("--text-muted", cfg.secondary + '88');
          root.style.setProperty("--border-color", cfg.border);
          // Only override accent if it's not a family view or if user prefers theme accent
          // Actually user said "assign a stylish accent colour to each family group"
          // So I should keep the family accent unless we are in a generic view?
          // Let's stick to family accent but use theme accent for Home/Settings
      } else if (currentTheme === "dark") {
        root.style.setProperty("--bg-primary", "#101010");
        root.style.setProperty("--bg-surface", "#050505");
        root.style.setProperty("--bg-surface-hover", "#0a0a0a");
        root.style.setProperty("--bg-muted", "#151515");
        root.style.setProperty("--text-primary", "#ffffff");
        root.style.setProperty("--text-secondary", "rgba(255, 255, 255, 0.7)");
        root.style.setProperty("--text-muted", "rgba(255, 255, 255, 0.4)");
        root.style.setProperty("--border-color", "rgba(255, 255, 255, 0.08)");
        root.style.setProperty("--accent-text", "#000000");
      } else {
        root.style.setProperty("--bg-primary", "#ffffff");
        root.style.setProperty("--bg-surface", "#f5f5f4");
        root.style.setProperty("--bg-surface-hover", "#f0f0f0");
        root.style.setProperty("--bg-muted", "#e5e5e5");
        root.style.setProperty("--text-primary", "#000000");
        root.style.setProperty("--text-secondary", "rgba(0, 0, 0, 0.7)");
        root.style.setProperty("--text-muted", "rgba(0, 0, 0, 0.4)");
        root.style.setProperty("--border-color", "rgba(0, 0, 0, 0.08)");
        root.style.setProperty("--accent-text", "#000000");
      }
    }
  }, [theme, activeBrandThemeId, brandTextOverrides, entities, activeFamily]);

  // Handle sidebar resize
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.body.style.cursor === "col-resize") {
        setSidebarWidth(Math.max(160, Math.min(e.clientX, 600)));
      }
    };
    const handleMouseUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  React.useEffect(() => {
    if (activeEntity && activeFamily?.children?.[currentView]) {
      setActiveSubTab(activeFamily.children[currentView][0]);
    }
  }, [currentView, activeEntityId]);
  const [sortMode, setSortMode] = useState("manual");
  const [manualOrder, setManualOrder] = useState<string[]>(() =>
    initialData.flatMap((e) => (e?.tasks || []).map((t) => t.id)),
  );
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [newEntityContext, setNewEntityContext] = useState<{
    type: EntityType;
    brandId: string | null;
    projectId?: string | null;
    eventId?: string | null;
  } | null>(null);
  const [editingContext, setEditingContext] = useState<{
    task: Task | null;
    targetId: string;
  } | null>(null);

  // Default to kanban if view is brand_assets but active entity is not a brand
  if (
    activeEntity &&
    activeEntity.type !== "brand" &&
    currentView === "brand_assets"
  ) {
    setCurrentView("kanban");
  }

  const handleAddEntity = (
    name: string,
    type: EntityType,
    color: string,
    brandTags?: string[],
    details?: any,
  ) => {
    const newEntity: WorkspaceEntity = {
      id: `e${Date.now()}`,
      type,
      name,
      color,
      tasks: [],
      brandTags: brandTags || [],
      projectTags: details?.projectTags || [],
      eventTags: details?.eventTags || [],
      ...details,
    };
    setEntities([...entities, newEntity]);
    setActiveEntityId(newEntity.id);
    setIsEntityModalOpen(false);
    setNewEntityContext(null);

    if (type === "task") {
      // Also add to manual order for timeline/board
      setManualOrder((prev) => [...prev, newEntity.id]);
    }
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} Created`);
  };

  const handleSaveEntity = (entityData: any, updatedBlocks: Block[]) => {
    setEntities(
      entities.map((e) => {
        // If we are editing, replace the existing entity
        if (
          editingContext &&
          editingContext.task &&
          e.id === (editingContext.task as any).id
        ) {
          return { ...e, ...entityData, blocks: updatedBlocks };
        }

        // Handle task creation/edit inside a parent entity
        if (e.id === activeEntityId) {
          let updatedTasks;
          if (
            editingContext &&
            editingContext.task &&
            editingContext.targetId === "task"
          ) {
            updatedTasks = (e?.tasks || []).map((t) =>
              t.id === editingContext.task!.id
                ? { ...t, ...entityData, blocks: updatedBlocks }
                : t,
            );
          } else if (entityData.type === "task") {
            const newId = `t${Date.now()}`;
            updatedTasks = [
              ...(e.tasks || []),
              {
                id: newId,
                color: "#3B82F6",
                blocks: updatedBlocks,
                ...entityData,
              },
            ];
            setManualOrder((prev) => [...prev, newId]);
          } else {
            return e;
          }
          return { ...e, tasks: updatedTasks };
        }
        return e;
      }),
    );

    // If we saved a top level entity (project/event/brand) outside of a parent context
    if (!editingContext || editingContext.targetId !== "task") {
      const existingEntity = entities.find(
        (e) => e.id === (entityData as any).id,
      );
      if (existingEntity) {
        setEntities(
          entities.map((e) =>
            e.id === existingEntity.id
              ? { ...e, ...entityData, blocks: updatedBlocks }
              : e,
          ),
        );
      }
    }

    toast.success("Saved perfectly");
    setEditingContext(null);
    setIsEntityModalOpen(false);
  };

  const handleUpdateEntity = (id: string, updates: any) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
    toast.success("Updated successfully");
  };

  const handleUpdateTaskField = (taskId: string, field: string, value: any) => {
    setEntities(
      entities.map((e: WorkspaceEntity) => {
        if (e.id !== activeEntityId) return e;
        return {
          ...e,
          tasks: (e.tasks || []).map((t: Task) => {
            if (t.id !== taskId) return t;
            let updatedTask: Task = { ...t, [field]: value };
            if (field === "status" && value === "in-progress") {
              if (!updatedTask.blocks || updatedTask.blocks.length === 0) {
                updatedTask.blocks = [
                  {
                    id: `b${Date.now()}`,
                    name: "Main",
                    startDate: SYSTEM_TODAY,
                    endDate: "",
                    completed: false,
                  },
                ];
              } else {
                updatedTask.blocks = updatedTask.blocks.map((b) =>
                  b.startDate ? b : { ...b, startDate: SYSTEM_TODAY },
                );
              }
            }
            return updatedTask;
          }),
        };
      }),
    );
  };

  const handleUpdateBlocks = (taskId: string, newBlocks: Block[]) => {
    setEntities(
      entities.map((e) => {
        if (e.id !== activeEntityId) return e;
        return {
          ...e,
          tasks: (e.tasks || []).map((t) =>
            t.id === taskId ? { ...t, blocks: newBlocks } : t,
          ),
        };
      }),
    );
  };

  const DropdownButton = ({ icon, label, isActive, color, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, color: string, onClick: () => void }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    // Button should be black (#000000) individually with family color text/icon.
    // On hover or if active, fill with family color and text/icon becomes black.
    return (
      <button
        onClick={() => {
          onClick();
          setIsProjectNavOpen(false);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-[11px] font-black uppercase tracking-[0.2em] group`}
        style={{
          backgroundColor: isActive || isHovered ? color : '#000000',
          color: isActive || isHovered ? '#000000' : color
        }}
      >
        <div className={`transition-colors`} style={{ color: isActive || isHovered ? '#000000' : color }}>
          {icon}
        </div>
        <span className={`transition-transform`}>{label}</span>
      </button>
    );
  };

  return (
    <div
      className={`flex flex-col min-h-screen font-sans ${accessibilitySettings.readingMode ? 'accessibility-reading' : ''} ${accessibilitySettings.highContrast ? 'accessibility-contrast' : ''} font-size-${accessibilitySettings.fontSize}`}
      data-theme-animate={theme}
      data-reduced-motion={accessibilitySettings.reducedMotion}
      style={
        {
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          "--tw-selection-bg": "var(--accent)",
          fontSize: accessibilitySettings.fontSize === 'sm' ? '14px' : accessibilitySettings.fontSize === 'lg' ? '18px' : accessibilitySettings.fontSize === 'xl' ? '20px' : '16px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        } as any
      }
    >
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 900,
            letterSpacing: '0.05em'
          },
          duration: 3000,
        }} 
      />
      <header className="bg-[var(--bg-surface)] backdrop-blur-xl bg-opacity-90 border-b border-[var(--border-color)] flex items-center shrink-0 z-50 h-16 w-full sticky top-0 transition-all duration-300">
        <div className="flex-1 flex items-center h-full w-full justify-between px-6 relative z-[200]">
          {/* Left Section: Adaptive Icon, Title and Tagging UI */}
          <div ref={leftSectionRef} className="flex items-center h-full gap-4 shrink-0 relative z-[200]">
            <div 
              className="flex items-center gap-4 h-full select-none" 
              style={{ containerType: 'inline-size' } as any}
            >
              <Dropdown
                isOpen={isProjectNavOpen}
                onOpenChange={setIsProjectNavOpen}
                dropdownStyle={{
                  position: 'fixed',
                  top: '64px',
                  left: '0px',
                  width: navMenuWidth ? `${navMenuWidth}px` : '300px',
                  margin: 0,
                  transformOrigin: 'top left',
                }}
                dropdownClassName=""
                trigger={
                  <button
                    onMouseEnter={() => {
                      setIsProjectNavOpen(true);
                    }}
                    className="flex items-center gap-4 h-full shrink-0 group transition-all text-left h-12"
                  >
                    {/* Adaptive Icon */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={headerTitle}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-10 h-10 rounded-none] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden transition-colors duration-300 group-hover:shadow-md"
                        style={{ 
                          backgroundColor: "transparent",
                          color: activeFamily?.color || "var(--accent)"
                        }}
                      >
                         {/* Hover Background Fill */}
                         <div 
                           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{ backgroundColor: activeFamily?.color || "var(--accent)" }}
                         />
                         
                         {/* Default State Icon */}
                         <div 
                           className="group-hover:opacity-0 transition-opacity flex items-center justify-center absolute inset-0 duration-300"
                         >
                           {activeFamily?.icon}
                         </div>
                         
                         {/* Hover State Icon - same graphic matching header bg */}
                         <div 
                           className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center absolute inset-0 duration-300 transform group-hover:rotate-180"
                           style={{ color: "var(--bg-surface)" }}
                         >
                           {activeFamily?.icon}
                         </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-col justify-center h-10 pr-4 shrink-0">
                      <motion.div 
                        initial={false}
                        animate={{
                          height: "40px",
                          justifyContent: unitTitle ? "space-between" : "center"
                        }}
                        className="flex flex-col w-full"
                      >
                        <motion.h1
                          key={headerTitle}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1, x: 0,
                            fontSize: unitTitle ? "24px" : "34px",
                            lineHeight: unitTitle ? "24px" : "34px",
                          }}
                          className="font-display font-black uppercase tracking-tight whitespace-nowrap text-[var(--text-primary)] transition-all duration-300"
                          title={headerTitle}
                          style={{ transformOrigin: "left center" }}
                        >
                          {headerTitle}
                        </motion.h1>

                        <AnimatePresence mode="wait">
                          {unitTitle && (
                            <motion.h2
                              key={`unit-${unitTitle}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-[12px] leading-[16px] font-black uppercase tracking-[0.10em] text-[var(--accent)] whitespace-nowrap italic m-0 p-0"
                            >
                              {unitTitle}
                            </motion.h2>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </button>
                }
              >
                <div 
                  onMouseLeave={() => setIsProjectNavOpen(false)}
                  className="w-full bg-[var(--bg-surface)] border-b border-r border-[var(--border-color)] shadow-2xl rounded-none] overflow-hidden flex flex-col p-2 backdrop-blur-3xl bg-opacity-95 gap-1"
                >
                  <DropdownButton 
                    icon={<Home size={18} />} 
                    label="Home" 
                    isActive={currentView === 'homepage'}
                    color={colors.system}
                    onClick={() => { setCurrentView('homepage'); setActiveEntityId(""); }}
                  />
                  <div className="h-px bg-[var(--border-color)] my-1 mx-2 opacity-50" />
                  <DropdownButton 
                    icon={<Target size={18} />} 
                    label="All Brands" 
                    isActive={currentView === 'brand_landing'}
                    color={colors.brand}
                    onClick={() => { setCurrentView('brand_landing'); setActiveEntityId(""); }}
                  />
                  <DropdownButton 
                    icon={<FolderClosed size={18} />} 
                    label="All Projects" 
                    isActive={currentView === 'project_landing'}
                    color={colors.project}
                    onClick={() => { setCurrentView('project_landing'); setActiveEntityId(""); }}
                  />
                  <DropdownButton 
                    icon={<CalendarIcon size={18} />} 
                    label="All Events" 
                    isActive={currentView === 'event_landing'}
                    color={colors.event}
                    onClick={() => { setCurrentView('event_landing'); setActiveEntityId(""); }}
                  />
                  <DropdownButton 
                    icon={<CheckSquare size={18} />} 
                    label="All Tasks" 
                    isActive={currentView === 'task_landing'}
                    color={colors.task}
                    onClick={() => { setCurrentView('task_landing'); setActiveEntityId(""); }}
                  />
                  <div className="h-px bg-[var(--border-color)] my-1 mx-2 opacity-50" />
                  <DropdownButton 
                    icon={<Settings size={18} />} 
                    label="Settings" 
                    isActive={currentView === 'settings'}
                    color={colors.system}
                    onClick={() => { setCurrentView('settings'); setActiveEntityId(""); }}
                  />
                </div>
              </Dropdown>
            </div>
            {/* Tagging UI Moved to left segment */}
            {isMemberView && (activeEntity!.type === "project" || activeEntity!.type === "event") && (
              <div className="flex items-center gap-2 mt-1 shrink-0 border-l border-[var(--border-color)]/20 pl-4 h-8 self-center">
                {(() => {
                  const taggedBrand = entities.find(
                    (e) => e.type === "brand" && activeEntity!.brandTags?.includes(e.id),
                  );

                  return (
                    <div className="flex items-center gap-1 relative">
                      <Dropdown
                        trigger={
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-none text-xs font-black uppercase tracking-widest transition-all ${taggedBrand ? "text-[var(--accent)] hover:bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"}`}>
                            <Target size={12} />
                            {taggedBrand ? taggedBrand.name : "No Brand"}
                          </div>
                        }
                        dropdownClassName="top-[100%] left-0 mt-2"
                      >
                        <div className="w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-none overflow-hidden flex flex-col py-2 backdrop-blur-xl">
                          <div className="max-h-64 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                            <button
                              onClick={() => {
                                const updatedEntities = entities.map((e) =>
                                  e.id === activeEntity!.id ? { ...e, brandTags: [] } : e,
                                );
                                setEntities(updatedEntities);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${!taggedBrand ? "bg-[var(--bg-muted)] text-[var(--accent)]" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                            >
                              <X size={14} />
                              None
                            </button>
                            <div className="h-px bg-[var(--border-color)] mx-2 my-1" />
                            {entities
                              .filter((e) => e.type === "brand")
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((brand) => (
                                <button
                                  key={brand.id}
                                  onClick={() => {
                                    const updatedEntities = entities.map((e) =>
                                      e.id === activeEntity!.id ? { ...e, brandTags: [brand.id] } : e,
                                    );
                                    setEntities(updatedEntities);
                                  }}
                                  className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${taggedBrand?.id === brand.id ? "bg-[var(--accent)] text-black" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                                >
                                  <Target size={14} />
                                  <span>{brand.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </Dropdown>

                      {taggedBrand && (
                        <button
                          onClick={() => {
                            setActiveEntityId(taggedBrand.id);
                            setCurrentView("details");
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-none text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all group/goto"
                        >
                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all group-hover/goto:max-w-[80px] group-hover/goto:mr-1">
                            Go to Brand
                          </span>
                          <ArrowRight size={12} className="shrink-0" />
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Project Tagging for Events */}
                {activeEntity!.type === "event" && (() => {
                  const taggedProject = entities.find(
                    (e) => e.type === "project" && activeEntity!.projectTags?.includes(e.id),
                  );
                  return (
                    <div className="flex items-center gap-1 relative ml-2 border-l border-[var(--border-color)]/20 pl-2">
                       <Dropdown
                        trigger={
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-none text-xs font-black uppercase tracking-widest transition-all ${taggedProject ? "text-[var(--accent)] hover:bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"}`}>
                            <Briefcase size={12} />
                            {taggedProject ? taggedProject.name : "No Project"}
                          </div>
                        }
                        dropdownClassName="top-[100%] left-0 mt-2"
                      >
                         <div className="w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-none overflow-hidden flex flex-col py-2 backdrop-blur-xl">
                          <div className="max-h-64 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                            <button
                              onClick={() => {
                                const updatedEntities = entities.map((e) =>
                                  e.id === activeEntity!.id ? { ...e, projectTags: [] } : e,
                                );
                                setEntities(updatedEntities);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${!taggedProject ? "bg-[var(--bg-muted)] text-[var(--accent)]" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                            >
                              <X size={14} />
                              None
                            </button>
                            <div className="h-px bg-[var(--border-color)] mx-2 my-1" />
                            {entities
                              .filter((e) => e.type === "project")
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    const updatedEntities = entities.map((e) =>
                                      e.id === activeEntity!.id ? { ...e, projectTags: [project.id] } : e,
                                    );
                                    setEntities(updatedEntities);
                                  }}
                                  className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${taggedProject?.id === project.id ? "bg-[var(--accent)] text-black" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                                >
                                  <Briefcase size={14} />
                                  <span>{project.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </Dropdown>
                      {taggedProject && (
                        <button
                          onClick={() => {
                            setActiveEntityId(taggedProject.id);
                            setCurrentView("details");
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-none text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all group/goto"
                        >
                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all group-hover/goto:max-w-[80px] group-hover/goto:mr-1">
                            Go to Project
                          </span>
                          <ArrowRight size={12} className="shrink-0" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* New Header Divider */}
          <div ref={headerDividerRef} className="h-8 w-px bg-[var(--border-color)] ml-4 shrink-0 self-center" />

          <div className="flex-1 flex items-center shrink-0 min-w-0 h-full relative z-[150]">
            {/* PARENT TABS - Fixed to Header */}
            {(isMemberView || activeFamily?.type === 'home' || activeFamily?.type === 'settings') && (
              <div className={`flex items-stretch h-full ${activeFamily?.type === 'home' ? 'flex-1 justify-end gap-6' : 'shrink-0 gap-2'}`}> 
                 {(isMemberView ? activeFamily.memberTabs : (activeFamily?.memberTabs || [])).map((tab: string, index: number) => {
                   const isActive = (activeFamily.type === 'settings' ? settingsFilter === tab : currentView === tab) || (tab === "planner" && (currentView === "kanban" || currentView === "board" || currentView === "timeline"));
                   const hasChildren = !!(activeFamily.children && activeFamily.children[tab] && activeFamily.children[tab].length > 0);
                   
                   let displayTab = tab;
                   if (tab === 'home_dashboard') displayTab = 'Dashboard';
                   if (tab === 'home_planning') displayTab = 'Planning';
                   if (tab === 'home_statistics') displayTab = 'Statistics';
                   if (tab === 'home_finances') displayTab = 'Finances';

                   return (
                     <React.Fragment key={tab}>
                       <button
                         onClick={() => {
                           if (activeFamily.type === 'settings') {
                             setSettingsFilter(tab);
                             return;
                           }
                           setCurrentView(tab);
                           const children = activeFamily.children?.[tab];
                           if (children && children.length > 0) {
                             setActiveSubTab(children[0]);
                           } else {
                             setActiveSubTab("");
                           }
                         }}
                         className={`px-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${
                           isActive
                             ? "text-[var(--accent)] font-bold text-[11px] bg-[var(--bg-primary)]"
                             : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]/50"
                         } ${!isActive && activeFamily?.type !== 'home' ? 'border-l border-[var(--border-color)]/20 last:border-r' : ''}`}
                         style={{
                           borderTopLeftRadius: "8px",
                           borderTopRightRadius: "8px"
                         }}
                       >
                         <span className={isActive ? "scale-105" : "hover-scale truncate px-1"}>{displayTab}</span>
                       </button>
                     </React.Fragment>
                   );
                 })}
              </div>
            )}

            {/* Tagging UI (only for members) restored */}
            {isMemberView && (activeEntity!.type === "project" || activeEntity!.type === "event") && (
              <div className="flex items-center gap-2 mt-1 ml-4 shrink-0 border-l border-[var(--border-color)]/20 pl-4">
                {(() => {
                  const taggedBrand = entities.find(
                    (e) => e.type === "brand" && activeEntity!.brandTags?.includes(e.id),
                  );

                  return (
                    <div className="flex items-center gap-1 relative">
                      <Dropdown
                        trigger={
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-none text-xs font-black uppercase tracking-widest transition-all ${taggedBrand ? "text-[var(--accent)] hover:bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"}`}>
                            <Target size={12} />
                            {taggedBrand ? taggedBrand.name : "No Brand"}
                          </div>
                        }
                        dropdownClassName="top-[100%] left-0 mt-2"
                      >
                        <div className="w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-none overflow-hidden flex flex-col py-2 backdrop-blur-xl">
                          <div className="max-h-64 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                            <button
                              onClick={() => {
                                const updatedEntities = entities.map((e) =>
                                  e.id === activeEntity!.id ? { ...e, brandTags: [] } : e,
                                );
                                setEntities(updatedEntities);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${!taggedBrand ? "bg-[var(--bg-muted)] text-[var(--accent)]" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                            >
                              <X size={14} />
                              None
                            </button>
                            <div className="h-px bg-[var(--border-color)] mx-2 my-1" />
                            {entities
                              .filter((e) => e.type === "brand")
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((brand) => (
                                <button
                                  key={brand.id}
                                  onClick={() => {
                                    const updatedEntities = entities.map((e) =>
                                      e.id === activeEntity!.id ? { ...e, brandTags: [brand.id] } : e,
                                    );
                                    setEntities(updatedEntities);
                                  }}
                                  className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${taggedBrand?.id === brand.id ? "bg-[var(--accent)] text-black" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                                >
                                  <Target size={14} />
                                  <span>{brand.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </Dropdown>

                      {taggedBrand && (
                        <button
                          onClick={() => {
                            setActiveEntityId(taggedBrand.id);
                            setCurrentView("details");
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-none text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all group/goto"
                        >
                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all group-hover/goto:max-w-[80px] group-hover/goto:mr-1">
                            Go to Brand
                          </span>
                          <ArrowRight size={12} className="shrink-0" />
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Project Tagging for Events */}
                {activeEntity!.type === "event" && (() => {
                  const taggedProject = entities.find(
                    (e) => e.type === "project" && activeEntity!.projectTags?.includes(e.id),
                  );
                  return (
                    <div className="flex items-center gap-1 relative ml-2">
                       <Dropdown
                        trigger={
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-none text-xs font-black uppercase tracking-widest transition-all ${taggedProject ? "text-[var(--accent)] hover:bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"}`}>
                            <Briefcase size={12} />
                            {taggedProject ? taggedProject.name : "No Project"}
                          </div>
                        }
                        dropdownClassName="top-[100%] left-0 mt-2"
                      >
                         <div className="w-64 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl rounded-none overflow-hidden flex flex-col py-2 backdrop-blur-xl">
                          <div className="max-h-64 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                            <button
                              onClick={() => {
                                const updatedEntities = entities.map((e) =>
                                  e.id === activeEntity!.id ? { ...e, projectTags: [] } : e,
                                );
                                setEntities(updatedEntities);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${!taggedProject ? "bg-[var(--bg-muted)] text-[var(--accent)]" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                            >
                              <X size={14} />
                              None
                            </button>
                            <div className="h-px bg-[var(--border-color)] mx-2 my-1" />
                            {entities
                              .filter((e) => e.type === "project")
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    const updatedEntities = entities.map((e) =>
                                      e.id === activeEntity!.id ? { ...e, projectTags: [project.id] } : e,
                                    );
                                    setEntities(updatedEntities);
                                  }}
                                  className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-xs font-black uppercase tracking-widest ${taggedProject?.id === project.id ? "bg-[var(--accent)] text-black" : "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                                >
                                  <Briefcase size={14} />
                                  <span>{project.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </Dropdown>
                      {taggedProject && (
                        <button
                          onClick={() => {
                            setActiveEntityId(taggedProject.id);
                            setCurrentView("details");
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-none text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all group/goto"
                        >
                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all group-hover/goto:max-w-[80px] group-hover/goto:mr-1">
                            Go to Project
                          </span>
                          <ArrowRight size={12} className="shrink-0" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Section: Search Bar and/or Add Button */}
          <div className="shrink-0 flex justify-end pl-6 items-center w-[300px] gap-6">
            <div className="flex-1 relative group z-50 flex items-center justify-between gap-6">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    // small delay to allow clicking on results
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                  placeholder="SEARCH..."
                  className="w-full bg-[var(--bg-muted)]/50 focus:bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent)] rounded-none pl-9 pr-3 py-1 text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all h-8"
                />
                
                {/* Search Dropdown */}
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] backdrop-blur-xl bg-opacity-95 border border-[var(--border-color)] rounded-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {(() => {
                      const term = searchQuery.toLowerCase();
                      const results: { id: string; name: string; type: EntityType; color: string; parentId?: string; isTask?: boolean; task?: any }[] = [];
                      
                      entities.forEach(ent => {
                        if (ent.name && ent.name.toLowerCase().includes(term)) {
                          results.push({ id: ent.id, name: ent.name, type: ent.type, color: ent.color });
                        }
                        (ent.tasks || []).forEach(task => {
                          if (task.title && task.title.toLowerCase().includes(term)) {
                            results.push({ id: task.id, name: task.title, type: 'task', color: familyUnits.task.color || task.color, parentId: ent.id, isTask: true, task });
                          }
                        });
                      });
                      
                      const topResults = results.slice(0, 6);

                      if (topResults.length === 0) {
                        return <div className="p-4 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">No results</div>;
                      }

                      return (
                        <div className="flex flex-col py-1">
                          {topResults.map((result, idx) => {
                            const IconComponent = familyUnits[result.type]?.icon?.type || Target;
                            return (
                              <button
                                key={`${result.id}-${idx}`}
                                onClick={() => {
                                  if (result.isTask) {
                                    setActiveEntityId(result.parentId!);
                                    setEditingContext({ task: result.task, targetId: "task" });
                                    setIsEntityModalOpen(true);
                                  } else {
                                    setActiveEntityId(result.id);
                                    if (result.type === "brand") setCurrentView("Strategy");
                                    else if (result.type === "project") setCurrentView("kanban");
                                    else if (result.type === "event") setCurrentView("details");
                                  }
                                  setSearchQuery("");
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-[var(--bg-muted)]/50 transition-colors flex items-center gap-2 group/item h-8 block"
                              >
                                {/* The gap is 10px, left pad is 12px. Total offset for text = 12 + 14 + 10 = 36px. (Matches input pl-9 = 36px) */}
                                <div className="shrink-0 flex items-center justify-center w-[14px]">
                                  <IconComponent size={14} color={result.color} />
                                </div>
                                <span 
                                  className="truncate text-xs font-bold uppercase tracking-widest"
                                  style={{ color: result.color }}
                                >
                                  {result.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="w-8 h-8 rounded-none border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#fff] hover:border-[#fff] flex items-center justify-center transition-all bg-[var(--bg-muted)]/50 focus:bg-[var(--bg-primary)] shrink-0"
                title="AI Assist"
              >
                <Sparkles size={14} />
              </button>
            </div>
            
             {isGlobalView && (() => {
                const type = currentView.replace("all_", "").slice(0, -1);
                const family = familyUnits[type === "task" ? "task" : type];
                if (!family) return null;
                return (
                  <button
                    onClick={() => {
                      setNewEntityContext({
                        type: family.type,
                        brandId: null,
                      });
                      setIsEntityModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-none bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:brightness-95 active:scale-95 flex items-center justify-center transition-all shrink-0"
                    title={`New ${family.type.charAt(0).toUpperCase() + family.type.slice(1)}`}
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                );
             })()}
          </div>
        </div>
      </header>

      {/* Sub-Header Tabs Bar - CHILD TABS */}
      {(() => {
        // Determine tabs based on context
        let tabs: string[] = [];
        let activeTabValue = "";
        let setTab: (t: string) => void = () => {};
        let isChildGroup = false;

        if (activeEntity && !isGlobalView) {
          const family = familyUnits[activeEntity.type];
          if (family.children && family.children[currentView]) {
            tabs = family.children[currentView];
            activeTabValue = activeSubTab;
            setTab = (t) => setActiveSubTab(t);
            isChildGroup = true;
          }
        } else if (isGlobalView) {
          if (activeFamily?.children?.[currentView]) {
            tabs = activeFamily.children[currentView];
            activeTabValue = activeSubTab;
            setTab = (t) => setActiveSubTab(t);
            isChildGroup = true;
          } else {
            const type = currentView.replace("all_", "").slice(0, -1);
            const family = familyUnits[type === "task" ? "task" : type];
            if (family) {
              tabs = family.statusModes;
              if (family.type === "brand") { activeTabValue = brandFilter; setTab = setBrandFilter; }
              else if (family.type === "project") { activeTabValue = projectFilter; setTab = setProjectFilter; }
              else if (family.type === "event") { activeTabValue = eventFilter; setTab = setEventFilter; }
              else if (family.type === "task") { activeTabValue = taskFilter; setTab = setTaskFilter; }
            }
          }
        }

        if (!tabs || tabs.length === 0) return null;

        return (
          <nav 
            className="flex items-center shrink-0 z-40 h-10 w-full sticky top-16 transition-all border-b"
            style={{
              backgroundColor: isChildGroup ? "var(--bg-muted)" : "var(--bg-primary)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div className="flex flex-1 items-stretch h-full overflow-x-auto no-scrollbar">
              {tabs.map((tab: string) => {
                const isActive = activeTabValue === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setTab(tab)}
                    className={`flex-1 flex items-center justify-center text-[11px] font-black uppercase tracking-widest transition-all relative border-r border-[var(--border-color)]/20 last:border-r-0 ${
                      isActive
                        ? "text-[var(--accent)] font-bold opacity-100"
                        : "text-[var(--text-primary)] hover:bg-black/10 active:bg-black/20 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className={`relative z-10 whitespace-nowrap transition-all ${isActive ? "scale-105" : "hover:scale-105"}`}>
                      {tab}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        );
      })()}

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
          {/* View Content Logic */}
          {[
            "global_calendar",
            "total_finances",
            "brand_landing",
            "project_landing",
            "event_landing",
            "task_landing",
            "homepage",
            "home_dashboard",
            "home_planning",
            "home_statistics",
            "home_finances",
            "settings"
          ].includes(currentView) ? (
            <div className="flex-1 overflow-hidden relative flex bg-[var(--bg-muted)]/30">
              {(currentView === "homepage" || currentView === "home_dashboard" || currentView === "home_planning" || currentView === "home_statistics" || currentView === "home_finances") && (
                <HomeView 
                  entities={entities} 
                  currentView={currentView}
                  activeSubTab={activeSubTab}
                  onNavigate={(view, id) => {
                    setCurrentView(view);
                    if (id) setActiveEntityId(id);
                  }}
                  onOpenAIChat={() => setIsAIChatOpen(true)}
                />
              )}
              {currentView === "settings" && (
                <SettingsView
                  entities={entities}
                  theme={theme}
                  setTheme={setTheme}
                  activeTab={settingsFilter}
                  calendarConfig={calendarConfig}
                  setCalendarConfig={setCalendarConfig}
                  activeBrandThemeId={activeBrandThemeId}
                  setActiveBrandThemeId={setActiveBrandThemeId}
                  accessibilitySettings={accessibilitySettings}
                  setAccessibilitySettings={setAccessibilitySettings}
                />
              )}
              {currentView === "brand_landing" && (
                <AllEntitiesListView
                  type="brand"
                  entities={entities}
                  activeFilter={brandFilter}
                  onSelect={(id) => {
                    setActiveEntityId(id);
                    setCurrentView("Strategy");
                  }}
                  onNew={() => {
                    setNewEntityContext({ type: "brand", brandId: null });
                    setIsEntityModalOpen(true);
                  }}
                  onEdit={(entity) => {
                    setEditingContext({ task: entity as any, targetId: "brand" });
                  }}
                />
              )}
              {currentView === "project_landing" && (
                <AllEntitiesListView
                  type="project"
                  entities={entities}
                  activeFilter={projectFilter}
                  onSelect={(id) => {
                    setActiveEntityId(id);
                    setCurrentView("kanban");
                  }}
                  onNew={() => {
                    setNewEntityContext({ type: "project", brandId: null });
                    setIsEntityModalOpen(true);
                  }}
                  onEdit={(entity) => {
                    setEditingContext({ task: entity as any, targetId: "project" });
                  }}
                />
              )}
              {currentView === "event_landing" && (
                <AllEntitiesListView
                  type="event"
                  entities={entities}
                  activeFilter={eventFilter}
                  onSelect={(id) => {
                    setActiveEntityId(id);
                    setCurrentView("details");
                  }}
                  onNew={() => {
                    setNewEntityContext({ type: "event", brandId: null });
                    setIsEntityModalOpen(true);
                  }}
                  onEdit={(entity) => {
                    setEditingContext({ task: entity as any, targetId: "event" });
                  }}
                />
              )}
              {currentView === "task_landing" && (
                <AllTasksListView
                  entities={entities}
                  activeFilter={taskFilter}
                  onSelectTask={(task) => {
                    const e = entities.find((ent) =>
                      (ent.tasks || []).some((t) => t.id === task.id),
                    );
                    if (e) {
                      setActiveEntityId(e.id);
                      setEditingContext({ task, targetId: "task" });
                      setIsEntityModalOpen(true);
                    }
                  }}
                />
              )}
              {currentView === "global_calendar" && (
                <GlobalCalendarView
                  entities={entities}
                  onBack={() => {}}
                  calendarConfig={calendarConfig}
                  onEditTask={(task) =>
                    setEditingContext({ task, targetId: "task" })
                  }
                  onUpdateBlocks={handleUpdateBlocks}
                />
              )}
              {currentView === "total_finances" && (
                <TotalFinancesView entities={entities} />
              )}
            </div>
          ) : activeEntity ? (
            <>
              <div className="flex-1 overflow-hidden relative flex flex-col min-w-0">
                {/* Unified Rendering Block */}
                {(() => {
                  if (currentView === "details" || currentView === "Strategy" || activeFamily?.children?.Strategy?.includes(activeSubTab) || activeFamily?.children?.details?.includes(activeSubTab)) {
                    if (activeSubTab === "Brainstorm" || activeSubTab === "brainstorm") {
                      return (
                        <MindMapView
                          entity={activeEntity}
                          onUpdate={(updates: any) => handleUpdateEntity(activeEntityId, updates)}
                        />
                      );
                    }
                    if (activeSubTab === "proposed") {
                      return (
                        <ProposalView
                          entity={activeEntity}
                          onUpdate={(updates: any) => handleUpdateEntity(activeEntityId, updates)}
                        />
                      );
                    }
                    if (activeEntity.type === "brand") {
                      if (activeSubTab === "Info Card") {
                        return <InfoCardView entity={activeEntity} />;
                      }
                      if (activeSubTab === "Purpose") {
                        return (
                          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-12 overflow-hidden">
                             <div className="w-full max-w-4xl h-full border-2 border-dashed border-[var(--border-color)]/30 rounded-none] flex flex-col items-center justify-center p-12 text-center">
                                <Zap size={64} className="mb-6 opacity-20" />
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest font-display">Brand Purpose</h3>
                                <p className="max-w-xs text-sm uppercase font-black tracking-tighter opacity-40">Define the 'Why' behind the brand. This space is reserved for deepening the strategic foundation.</p>
                             </div>
                          </div>
                        );
                      }
                      if (activeSubTab === "Edit Details" || currentView === "details") {
                        return (
                          <DetailsView
                            entity={activeEntity}
                            onUpdate={(updatedEntity: WorkspaceEntity) => {
                              setEntities(
                                entities.map((e) =>
                                  e.id === updatedEntity.id ? updatedEntity : e,
                                ),
                              );
                            }}
                          />
                        );
                      }
                      return <InfoCardView entity={activeEntity} />;
                    }
                    return (
                      <ProjectDetailsView
                        entity={activeEntity}
                        entities={entities}
                        onUpdate={(updatedEntity: WorkspaceEntity) => {
                          setEntities(
                            entities.map((e) =>
                              e.id === updatedEntity.id ? updatedEntity : e,
                            ),
                          );
                        }}
                        onNewChild={(type: EntityType, tags: any) => {
                          setNewEntityContext({
                            type,
                            brandId: tags.brandTags?.[0] || null,
                            projectId: tags.projectTags?.[0] || null,
                            eventId: tags.eventTags?.[0] || null,
                          });
                          setIsEntityModalOpen(true);
                        }}
                      />
                    );
                  }

                  if (activeSubTab === "workshop" || currentView === "Workshop") {
                    return (
                      <BrandWorkshopView
                        entity={activeEntity}
                        onUpdate={(updates: any) => handleUpdateEntity(activeEntityId, updates)}
                      />
                    );
                  }

                  if (currentView === "Identity" || activeFamily.children?.Identity?.includes(activeSubTab)) {
                    return (
                      <BrandManagementView
                        entity={activeEntity}
                        onUpdate={(updatedEntity: WorkspaceEntity) => {
                          setEntities(
                            entities.map((e) =>
                              e.id === updatedEntity.id ? updatedEntity : e,
                            ),
                          );
                        }}
                        initialTab={activeSubTab === "vault" ? "asset_history" : activeSubTab === "guidelines" ? "brand_guidelines" : activeSubTab === "moodboard" ? "moodboard" : "current_branding"}
                      />
                    );
                  }

                  if (currentView === "Reach" || activeFamily.children?.Reach?.includes(activeSubTab)) {
                    return (
                      <MarketingView
                        entities={entities}
                        entity={activeEntity}
                        onBack={() => setCurrentView("Strategy")}
                        onUpdate={(updatedEntity: WorkspaceEntity) => {
                          setEntities(
                            entities.map((e) =>
                              e.id === updatedEntity.id ? updatedEntity : e,
                            ),
                          );
                        }}
                        initialTab={activeSubTab || "analytics"}
                      />
                    );
                  }

                  if (currentView === "Finances" || currentView === "finances") {
                    return (
                      <FinanceTrackerView
                        entities={entities}
                        entity={activeEntity}
                        onUpdate={(updatedEntity: WorkspaceEntity) => {
                          setEntities(
                            entities.map((e) =>
                              e.id === updatedEntity.id ? updatedEntity : e,
                            ),
                          );
                        }}
                      />
                    );
                  }

                  if (currentView === "Operations") {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-12 overflow-hidden">
                        <div className="w-full max-w-4xl h-full border-2 border-dashed border-[var(--border-color)]/30 rounded-none] flex flex-col items-center justify-center p-12 text-center">
                          <Target size={64} className="mb-6 opacity-20" />
                          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest font-display">
                            Brand Management
                          </h3>
                          <p className="max-w-xs text-sm uppercase font-black tracking-tighter opacity-40">
                             Centralized brand governance coming soon. This space is reserved for advanced brand maintenance and cross-entity alignment.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (currentView === "planner" || activeFamily.children?.planner?.includes(activeSubTab)) {
                    return (
                      <div className="flex flex-1 w-full h-full relative">
                        {activeEntity.type === "brand" && (
                          <Sidebar
                            entities={entities}
                            brandId={activeEntity.id}
                            activeId={activeEntityId}
                            onSelect={(id) => {
                              setActiveEntityId(id);
                            }}
                            onNewEntity={(type) => {
                              setNewEntityContext({ type, brandId: activeEntity.id });
                              setIsEntityModalOpen(true);
                            }}
                            onNewTask={(entityId) =>
                              setEditingContext({
                                task: {
                                  _plannerId: entityId,
                                  brandTags: [entityId],
                                } as any,
                                targetId: "planner_proj",
                              })
                            }
                          />
                        )}
                        <div className="flex-1 h-full overflow-hidden flex flex-col min-w-0 bg-[var(--bg-muted)]/10">
                          {activeSubTab === "board" ? (
                            <BoardView
                              project={activeEntity}
                              onEditTask={(task: Task) =>
                                setEditingContext({ task, targetId: "task" })
                              }
                              onUpdateTaskField={handleUpdateTaskField}
                            />
                          ) : (
                            <TimelineView
                              project={activeEntity}
                              onEditTask={(task: Task, targetId: string) =>
                                setEditingContext({ task, targetId })
                              }
                              onUpdateTaskField={handleUpdateTaskField}
                              onUpdateBlocks={handleUpdateBlocks}
                              sortMode={sortMode}
                              setSortMode={setSortMode}
                              manualOrder={manualOrder}
                              setManualOrder={setManualOrder}
                              calendarConfig={calendarConfig}
                            />
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Default case
                  return <div className="p-12 text-center opacity-50 uppercase font-black tracking-widest text-xs">No view content available for "{currentView}"</div>;
                })()}
              </div>
            </>
          ) : (
            <div
              className="flex-1 flex items-center justify-center font-bold flex-col gap-4"
              style={{ color: "var(--text-muted)" }}
            >
              <CalendarIcon
                size={48}
                style={{ color: "var(--border-color)" }}
              />
              Select or create an item from the workspace
            </div>
          )}
        </main>
      </div>
      {(isEntityModalOpen || editingContext !== null) && (
        <ModalDialog
          onClose={() => {
            setIsEntityModalOpen(false);
            setEditingContext(null);
            setNewEntityContext(null);
          }}
          onSave={isEntityModalOpen ? handleAddEntity : handleSaveEntity}
          entities={entities}
          initialType={newEntityContext?.type || "project"}
          initialBrandId={newEntityContext?.brandId}
          initialProjectId={newEntityContext?.projectId}
          initialEventId={newEntityContext?.eventId}
          editingEntity={editingContext?.task}
          calendarConfig={calendarConfig}
          onNewChild={(type: EntityType, tags: any) => {
            setNewEntityContext({
              type,
              brandId: tags.brandTags?.[0] || null,
              projectId: tags.projectTags?.[0] || null,
              eventId: tags.eventTags?.[0] || null,
            });
            setIsEntityModalOpen(true);
            setEditingContext(null);
          }}
        />
      )}
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}
