import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../attendance/context/AuthContext';
import { ToastContainer } from '../../attendance/components/Toast';
import { 
  LayoutDashboard, 
  CalendarClock, 
  UserCheck, 
  CalendarDays, 
  Users, 
  BarChart3, 
  FileSpreadsheet,
  Calendar,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { DashboardView } from '../../attendance/views/DashboardView';
import { MonthlyRegisterView } from '../../attendance/views/MonthlyRegisterView';
import { WeeklyScheduleView } from '../../attendance/views/WeeklyScheduleView';
import { DailyAttendanceView } from '../../attendance/views/DailyAttendanceView';
import { MonthlyCalendarView } from '../../attendance/views/MonthlyCalendarView';
import { AttendanceHistoryView } from '../../attendance/views/AttendanceHistoryView';
import { AttendanceReportsView } from '../../attendance/views/AttendanceReportsView';

export const ATTENDANCE_MODULES = [
  { id: 'dashboard', label: 'Attendance Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'daily-attendance', label: 'Daily Attendance', shortLabel: 'Daily', icon: UserCheck },
  { id: 'weekly-schedule', label: 'Weekly Class Schedule', shortLabel: 'Weekly', icon: CalendarClock },
  { id: 'monthly-calendar', label: 'Monthly Calendar', shortLabel: 'Calendar', icon: CalendarDays },
  { id: 'attendance-history', label: 'Attendance History', shortLabel: 'History', icon: Users },
  { id: 'monthly-register', label: 'Monthly Register Sheet', shortLabel: 'Matrix Register', icon: FileSpreadsheet, badge: 'Matrix' },
  { id: 'reports', label: 'Attendance Reports', shortLabel: 'Reports', icon: BarChart3 },
];

interface TabAttendanceProps {
  userSession?: any;
  initialSelectedSessionId?: string;
  activeSubTab?: string;
  onSelectSubTab?: (subTab: string) => void;
}

function AttendanceInnerContent({
  initialSelectedSessionId,
  activeSubTab,
  onSelectSubTab,
}: {
  initialSelectedSessionId?: string;
  activeSubTab?: string;
  onSelectSubTab?: (subTab: string) => void;
}) {
  const [activeModule, setActiveModule] = useState<string>(activeSubTab || 'dashboard');

  useEffect(() => {
    if (activeSubTab) {
      setActiveModule(activeSubTab);
    }
  }, [activeSubTab]);
  const [selectedSessionIdForAttendance, setSelectedSessionIdForAttendance] = useState<any>(initialSelectedSessionId || null);
  const { currentMaster, allMasters, switchMasterAccount } = useAuth();

  const handleSelectClassForAttendance = (sessionId: any) => {
    setSelectedSessionIdForAttendance(sessionId);
    setActiveModule('daily-attendance');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <ToastContainer />

      {/* 1. OPERATIONAL HEADER (NATIVE MASTER PORTAL THEME) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70 tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>KOMS Dojo Master Panel</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">
              {currentMaster?.dojo_name || 'Ranga Nagar'} Dojo
            </span>
          </div>

          <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Tracking System
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Automated recurring sessions, daily check-ins, monthly matrix registers & student histories
          </p>
        </div>

        {/* Header Right Actions & Context */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Session Month Context Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            <span>Month: <strong className="text-slate-900 font-bold">Nov 2026</strong></span>
          </div>

          {/* Master Profile & Switcher (Rubeshwaren / Janathanan) */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">{currentMaster?.name || 'Sensei Rubeshwaren'}</span>
            </div>

            {/* Account Switcher Dropdown */}
            {allMasters && allMasters.length > 1 && (
              <select
                aria-label="Switch Active Dojo Master"
                value={currentMaster?.id || 1}
                onChange={(e) => switchMasterAccount(Number(e.target.value))}
                className="ml-1 text-[11px] font-semibold bg-white text-slate-800 border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-rose-500 cursor-pointer shadow-sm"
              >
                {allMasters.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (CLEAN, MODERN, NATIVE & RESPONSIVE) */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-0.5" aria-label="Attendance Modules">
          {ATTENDANCE_MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  if (item.id !== 'daily-attendance') {
                    setSelectedSessionIdForAttendance(null);
                  }
                }}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0
                  ${isActive 
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/90 font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
                {item.badge && !isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. ACTIVE MODULE VIEW CONTENT */}
      <div className="transition-opacity duration-200">
        {activeModule === 'dashboard' && (
          <DashboardView
            onNavigateToModule={(mod: string) => setActiveModule(mod)}
            onSelectClassForAttendance={handleSelectClassForAttendance}
          />
        )}

        {activeModule === 'daily-attendance' && (
          <DailyAttendanceView
            preselectedSessionId={selectedSessionIdForAttendance}
          />
        )}

        {activeModule === 'weekly-schedule' && (
          <WeeklyScheduleView
            initialTab="active"
            onNavigateToSettings={() => setActiveModule('schedule-settings')}
          />
        )}

        {activeModule === 'monthly-calendar' && (
          <MonthlyCalendarView
            onSelectClassForAttendance={handleSelectClassForAttendance}
          />
        )}

        {(activeModule === 'attendance-history' || activeModule === 'student-history') && (
          <AttendanceHistoryView
            onSelectClassForAttendance={handleSelectClassForAttendance}
          />
        )}

        {activeModule === 'monthly-register' && (
          <MonthlyRegisterView />
        )}

        {activeModule === 'reports' && (
          <AttendanceReportsView />
        )}

        {activeModule === 'schedule-settings' && (
          <WeeklyScheduleView
            initialTab="configure"
            onScheduleUpdated={() => setActiveModule('weekly-schedule')}
          />
        )}
      </div>
    </div>
  );
}

export const TabAttendance: React.FC<TabAttendanceProps> = ({
  initialSelectedSessionId,
  activeSubTab,
  onSelectSubTab,
}) => {
  return (
    <AuthProvider>
      <AttendanceInnerContent
        initialSelectedSessionId={initialSelectedSessionId}
        activeSubTab={activeSubTab}
        onSelectSubTab={onSelectSubTab}
      />
    </AuthProvider>
  );
};
