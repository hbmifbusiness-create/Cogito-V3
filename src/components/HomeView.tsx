import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  FolderClosed, 
  CheckSquare, 
  Target,
  BarChart,
  DollarSign,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  MessageSquare,
  FileText,
  ChevronRight,
  TrendingUp,
  PieChart,
  Users,
  Activity,
  History
} from 'lucide-react';
import { WorkspaceEntity, Task, CalendarConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalCalendarView } from './GlobalCalendarView';
import { TimelineView } from './TimelineView';
import { 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

interface HomeViewProps {
  entities: WorkspaceEntity[];
  currentView: string;
  activeSubTab: string;
  onNavigate: (view: string, entityId?: string) => void;
  onOpenAIChat: () => void;
  calendarConfig?: CalendarConfig;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  entities, 
  currentView, 
  activeSubTab,
  onNavigate, 
  onOpenAIChat,
  calendarConfig
}) => {
  const [familyFilters, setFamilyFilters] = useState({
    brand: true,
    project: true,
    event: true,
    task: true
  });
  const [timeframe, setTimeframe] = useState('1 month');

  const timeframeOptions = [
    { label: '7 Days', value: '7 d' },
    { label: '14 Days', value: '14 d' },
    { label: '1 Month', value: '1 month' },
    { label: '3 Months', value: '3 months' },
    { label: '6 Months', value: '6 months' },
    { label: '1 Year', value: '1 year' },
  ];

  const isActiveTask = (status: string) => ['in progress', 'missed'].includes(status.toLowerCase());
  const isActiveEvent = (status: string) => ['active', 'upcoming'].includes(status.toLowerCase());

  const filteredEntities = useMemo(() => {
    return entities.filter(e => familyFilters[e.type as keyof typeof familyFilters]);
  }, [entities, familyFilters]);

  // Main navigation content
  const renderContent = () => {
    switch (currentView) {
      case 'home_planning':
        return activeSubTab === 'Timeline' ? (
          <div className="flex-1 overflow-hidden p-8">
            <TimelineView 
                entities={entities.map(e => ({
                    ...e,
                    tasks: (e.tasks || []).filter(t => isActiveTask(t.status))
                }))}
                onNavigate={onNavigate}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <GlobalCalendarView 
                entities={entities.map(e => ({
                    ...e,
                    tasks: (e.tasks || []).filter(t => isActiveTask(t.status))
                })).filter(e => e.type !== 'event' ? true : isActiveEvent((e as any).status || 'upcoming'))}
                onBack={() => onNavigate('homepage')}
                calendarConfig={calendarConfig}
            />
          </div>
        );

      case 'home_statistics':
        return <StatisticsDashboard 
                  entities={filteredEntities} 
                  timeframe={timeframe} 
                  setTimeframe={setTimeframe}
                  familyFilters={familyFilters}
                  setFamilyFilters={setFamilyFilters}
                  timeframeOptions={timeframeOptions}
               />;

      case 'home_finances':
        return <FinancesDashboard 
                  entities={filteredEntities} 
                  timeframe={timeframe} 
                  setTimeframe={setTimeframe}
                  familyFilters={familyFilters}
                  setFamilyFilters={setFamilyFilters}
                  timeframeOptions={timeframeOptions}
               />;

      case 'AI Assist':
        return <AIAssistDashboard onOpenAIChat={onOpenAIChat} />;

      case 'home_dashboard':
      case 'homepage':
      default:
        return <HomepageStats entities={entities} onNavigate={onNavigate} onOpenAIChat={onOpenAIChat} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {renderContent()}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const HomepageStats: React.FC<{ entities: WorkspaceEntity[], onNavigate: (v: string, id?: string) => void, onOpenAIChat: () => void }> = ({ entities, onNavigate, onOpenAIChat }) => {
  const brands = entities.filter(e => e.type === 'brand');
  const projects = entities.filter(e => e.type === 'project');
  const events = entities.filter(e => e.type === 'event');
  const allTasks = entities.flatMap(e => e.tasks || []);
  
  const inProgressProjects = projects.filter(p => (p.tasks || []).some(t => t.status === 'in progress'));
  const tasksDueToday = allTasks.filter(t => t.status !== 'complete').length;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-0">
      <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-12 relative z-0">
        <header className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Welcome back.
          </h2>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-2xl font-medium opacity-70">
            Everything is in order. You have {tasksDueToday} tasks remaining across {inProgressProjects.length} active projects.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
           <StatCard icon={<CheckSquare size={24} />} label="Tasks Due" value={tasksDueToday} sub="Active today" onClick={() => onNavigate('Planning')} />
           <StatCard icon={<FolderClosed size={24} />} label="Projects" value={inProgressProjects.length} sub="In progress" onClick={() => onNavigate('project_landing')} />
           <StatCard icon={<Zap size={24} />} label="Events" value={events.length} sub="Total events" onClick={() => onNavigate('event_landing')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Active Brands</h3>
                <button onClick={() => onNavigate('brand_landing')} className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brands.slice(0, 4).map(brand => (
                  <button key={brand.id} onClick={() => onNavigate('Strategy', brand.id)} className="flex flex-col p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] hover:bg-[var(--bg-surface-hover)] transition-all group text-left theme-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full ${brand.color}`} />
                      <span className="text-sm font-bold uppercase tracking-tight">{brand.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{(brand.tasks || []).length} Assets</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-[var(--accent)] text-black rounded-[48px] space-y-6 shadow-2xl shadow-[var(--accent)]/20 relative overflow-hidden group border border-black/5 theme-card">
              <Sparkles size={120} className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-display font-medium leading-tight relative z-10">Creative Intelligence.</h3>
              <p className="text-xs font-bold uppercase tracking-tight opacity-70 relative z-10 leading-relaxed">
                Analyze your workspace and suggest the next best moves.
              </p>
              <button onClick={onOpenAIChat} className="w-full py-4 bg-black text-[var(--accent)] rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10">
                <Sparkles size={16} /> AI Assist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatisticsDashboard: React.FC<any> = ({ entities, timeframe, setTimeframe, familyFilters, setFamilyFilters, timeframeOptions }) => {
  const chartData = [
    { name: 'Mon', completed: 4, active: 8 },
    { name: 'Tue', completed: 3, active: 7 },
    { name: 'Wed', completed: 6, active: 9 },
    { name: 'Thu', completed: 8, active: 12 },
    { name: 'Fri', completed: 5, active: 10 },
    { name: 'Sat', completed: 2, active: 4 },
    { name: 'Sun', completed: 1, active: 3 },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <FilterInterface 
          familyFilters={familyFilters} 
          setFamilyFilters={setFamilyFilters} 
          timeframe={timeframe} 
          setTimeframe={setTimeframe} 
          timeframeOptions={timeframeOptions} 
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SmallStatCard label="Productivity Score" value="84%" sub="+5% from last week" />
          <SmallStatCard label="Avg. Completion Time" value="2.4 Days" sub="-0.5d improvement" />
          <SmallStatCard label="Success Rate" value="92%" sub="Consistent" />
          <SmallStatCard label="Active Items" value={entities.length} sub={timeframe} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Activity Velocity</h3>
              <Activity size={18} className="text-[var(--accent)]" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="var(--accent)" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Task Distribution</h3>
              <PieChart size={18} className="text-[var(--accent)]" />
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: 400 },
                      { name: 'Missed', value: 30 },
                      { name: 'In Progress', value: 300 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="var(--accent)" />
                    <Cell fill="var(--text-muted)" />
                    <Cell fill="var(--text-secondary)" />
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancesDashboard: React.FC<any> = ({ entities, timeframe, setTimeframe, familyFilters, setFamilyFilters, timeframeOptions }) => {
  const financeData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <FilterInterface 
          familyFilters={familyFilters} 
          setFamilyFilters={setFamilyFilters} 
          timeframe={timeframe} 
          setTimeframe={setTimeframe} 
          timeframeOptions={timeframeOptions} 
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SmallStatCard label="Total Revenue" value="$42,500" sub="All Time" />
          <SmallStatCard label="Net Profit" value="$18,200" sub="Last 6 Months" />
          <SmallStatCard label="Burn Rate" value="$3,100" sub="Monthly Average" />
          <SmallStatCard label="ROI Score" value="4.2x" sub="Strong Performance" />
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Financial Trajectory</h3>
            <DollarSign size={18} className="text-[var(--accent)]" />
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-muted)', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px' }}
                />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--text-muted)" radius={[8, 8, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAssistDashboard: React.FC<{ onOpenAIChat: () => void }> = ({ onOpenAIChat }) => {
  const [reportDepth, setReportDepth] = useState('Executive');

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-3xl mx-auto flex items-center justify-center text-black shadow-2xl shadow-[var(--accent)]/30">
            <Sparkles size={40} />
          </div>
          <h2 className="text-4xl font-display font-medium">AI Workspace Assistant</h2>
          <p className="text-[var(--text-secondary)] opacity-60">Leverage your workspace data for intelligent insights and planning.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-10 flex flex-col items-center text-center space-y-6 group hover:translate-y-[-4px] transition-all">
            <div className="p-5 bg-[var(--bg-muted)] rounded-2xl group-hover:bg-[var(--accent)]/10 transition-colors">
              <MessageSquare size={32} className="text-[var(--accent)]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Workspace Chat</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Chat with an AI that knows your brands, projects, and personal workflows.</p>
            </div>
            <button onClick={onOpenAIChat} className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
              Launch Chat
            </button>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[40px] p-10 flex flex-col items-center text-center space-y-6 group hover:translate-y-[-4px] transition-all">
            <div className="p-5 bg-[var(--bg-muted)] rounded-2xl group-hover:bg-[var(--accent)]/10 transition-colors">
              <FileText size={32} className="text-[var(--accent)]" />
            </div>
            <div className="space-y-4 w-full">
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Generate Intelligence Report</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">Receive a deep-dive analysis of your productivity and brand health.</p>
              </div>
              
              <div className="flex gap-2 p-1 bg-[var(--bg-muted)] rounded-xl">
                 {['Brief', 'Executive', 'Detailed'].map(d => (
                   <button 
                    key={d} 
                    onClick={() => setReportDepth(d)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${reportDepth === d ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                   >
                     {d}
                   </button>
                 ))}
              </div>
            </div>
            <button className="w-full py-4 bg-[var(--accent)] text-black rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
              Generate {reportDepth} Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UTILS ---

const FilterInterface: React.FC<any> = ({ familyFilters, setFamilyFilters, timeframe, setTimeframe, timeframeOptions }) => (
  <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-sm">
    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1 md:pb-0">
      <div className="flex items-center gap-2 border-r border-[var(--border-color)] pr-6 shrink-0">
        <Filter size={16} className="text-[var(--text-muted)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Families</span>
      </div>
      <div className="flex items-center gap-4">
        {(Object.keys(familyFilters) as (keyof typeof familyFilters)[]).map((family) => {
          const active = familyFilters[family];
          const familyName = family as string;
          return (
            <button 
              key={familyName}
              onClick={() => setFamilyFilters((prev: any) => ({ ...prev, [family]: !prev[family] }))}
              className="flex items-center gap-3 group"
            >
              <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${active ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}>
                <div className={`absolute top-1 bottom-1 w-2 h-2 rounded-full bg-white transition-all duration-300 ${active ? 'left-5' : 'left-1'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {familyName}s
              </span>
            </button>
          );
        })}
      </div>
    </div>

    <div className="flex items-center gap-3 shrink-0">
      <Clock size={16} className="text-[var(--text-muted)]" />
      <select 
        value={timeframe} 
        onChange={(e) => setTimeframe(e.target.value)}
        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] outline-none cursor-pointer"
      >
        {timeframeOptions.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface)]">{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, sub: string, onClick?: () => void }> = ({ icon, label, value, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col p-10 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[48px] hover:bg-[var(--bg-surface-hover)] transition-all group text-left shadow-sm"
  >
    <div className="p-4 bg-[var(--bg-muted)] rounded-2xl w-fit mb-8 group-hover:bg-[var(--accent)]/15 transition-colors">
      <div className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-6xl font-display font-medium tracking-tighter text-[var(--text-primary)]">{value}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{label}</span>
        <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">{sub}</span>
      </div>
    </div>
  </button>
);

const SmallStatCard: React.FC<{ label: string, value: string | number, sub: string }> = ({ label, value, sub }) => (
  <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] p-6 space-y-2 shadow-sm">
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
    <h4 className="text-2xl font-display font-medium text-[var(--text-primary)]">{value}</h4>
    <p className="text-[8px] font-bold text-[var(--accent)]">{sub}</p>
  </div>
);
