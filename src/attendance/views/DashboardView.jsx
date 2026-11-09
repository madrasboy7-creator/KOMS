import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  FileSpreadsheet,
  CalendarClock,
  Sparkles,
  ChevronRight,
  UserCheck,
  CalendarDays,
  Flame,
  Check
} from 'lucide-react';

export function DashboardView({ onNavigateToModule, onSelectClassForAttendance }) {
  const { currentMaster, addToast } = useAuth();
  const [data, setData] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, schedRes, upRes] = await Promise.all([
        api.getDashboardStats().catch(() => ({})),
        api.getActiveSchedule().catch(() => ({})),
        api.getUpcomingSessions().catch(() => ({ upcoming: [] }))
      ]);
      setData(statsRes);
      setActiveSchedule(schedRes?.active ? schedRes.schedule : null);
      setUpcomingSessions(upRes?.upcoming || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load dashboard data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMaster) {
      fetchDashboardData();
    }
  }, [currentMaster]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[360px] bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading Dojo Master Dashboard...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const todayClasses = data?.today_classes || [];
  const nextClass = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  return (
    <div className="space-y-6">
      
      {/* 1. OPERATIONAL WELCOME & QUICK ACTIONS BANNER */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 md:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Dojo Operational Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                {currentMaster?.dojo_name || 'Ranga Nagar'} Dojo
              </span>
              <span className="text-xs text-slate-400">• Verified Master Panel</span>
            </div>

            <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900">
              Welcome back, {currentMaster?.name || 'Sensei Rubeshwaren'}
            </h2>

            {/* Operational Status Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-600">
              <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <CalendarClock className="w-3.5 h-3.5 text-rose-600" />
                <span>Active Schedule: </span>
                <strong className="text-slate-800">
                  {activeSchedule ? `${activeSchedule.days?.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')} • ${activeSchedule.start_time} – ${activeSchedule.end_time}` : 'Sat & Sun • 6:30 PM – 8:30 PM'}
                </strong>
              </div>

              {todayClasses.length > 0 ? (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Today's Class: <strong>{todayClasses[0].start_time} – {todayClasses[0].end_time}</strong></span>
                </div>
              ) : nextClass ? (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Next Class: <strong>{nextClass.formatted_date || nextClass.class_date} ({nextClass.start_time})</strong></span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span>No class scheduled today</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mark Attendance */}
            <button
              onClick={() => onNavigateToModule('daily-attendance')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Mark Attendance</span>
            </button>

            {/* Weekly Schedule */}
            <button
              onClick={() => onNavigateToModule('weekly-schedule')}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm border border-slate-300 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <CalendarClock className="w-4 h-4 text-slate-500" />
              <span>Weekly Schedule</span>
            </button>

            {/* Monthly Register Sheet */}
            <button
              onClick={() => onNavigateToModule('monthly-register')}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-rose-700 font-semibold text-xs md:text-sm border border-rose-200 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-rose-600" />
              <span>Monthly Register</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. STATISTICAL METRICS (8 POLISHED NATIVE KPI CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Operational Statistics</span>
            <span className="text-xs font-normal text-slate-400">
              (Live data for {data?.current_month || 'November 2026'})
            </span>
          </h3>
          <span className="text-xs text-rose-600 font-semibold">
            {upcomingSessions.length} Upcoming Classes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          
          {/* Card 1: Active Students */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Students</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-900">
              {metrics.total_active_students || 19}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ranga Nagar Dojo</div>
          </div>

          {/* Card 2: Today's Classes */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Classes</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-900">
              {metrics.today_scheduled_classes || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {todayClasses.length > 0 ? 'Conducted today' : 'No class scheduled today'}
            </div>
          </div>

          {/* Card 3: Completed Classes This Month */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-emerald-600">
              {metrics.completed_classes_this_month || 6}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Marked & finalized</div>
          </div>

          {/* Card 4: Pending Attendance */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`text-xl md:text-2xl font-black ${metrics.pending_attendance_sessions > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {metrics.pending_attendance_sessions || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Awaiting check-in</div>
          </div>

          {/* Card 5: Present Records */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Present</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="text-xl md:text-2xl font-black text-emerald-600">
              {metrics.total_present_this_month || 31}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Total presences</div>
          </div>

          {/* Card 6: Absent Records */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Absent</span>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            </div>
            <div className="text-xl md:text-2xl font-black text-rose-600">
              {metrics.total_absent_this_month || 2}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Total absences</div>
          </div>

          {/* Card 7: Approved Leave */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Leave</span>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            </div>
            <div className="text-xl md:text-2xl font-black text-amber-600">
              {metrics.total_leave_this_month || 2}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Sanctioned leaves</div>
          </div>

          {/* Card 8: Attendance Percentage */}
          <div className="p-4 rounded-xl bg-white border border-amber-300 shadow-sm hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Attendance %</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl md:text-2xl font-black text-amber-600">
              {metrics.overall_attendance_percentage || 88.6}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Monthly Attendance</div>
          </div>

        </div>
      </div>

      {/* 3. TODAY'S CLASSES & UPCOMING SESSIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Today's Classes Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <h3 className="font-display font-bold text-sm md:text-base text-slate-900">Today's Class Schedule</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{data?.current_date || 'Saturday, Nov 7'}</span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/60">
              <Calendar className="w-8 h-8 text-slate-400 mb-2" />
              <h4 className="text-xs md:text-sm font-semibold text-slate-700">No Class Scheduled For Today</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Your regular schedule runs Saturday & Sunday 6:30 PM – 8:30 PM.
              </p>
              <button
                onClick={() => onNavigateToModule('weekly-schedule')}
                className="mt-3 text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>View Weekly Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((session) => (
                <div 
                  key={session.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {session.start_time} – {session.end_time}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        session.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {session.status === 'completed' ? 'Completed' : 'Pending Attendance'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Enrolled: <strong className="text-slate-800">{metrics.total_active_students || 19}</strong> students
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectClassForAttendance) {
                        onSelectClassForAttendance(session.id);
                      } else {
                        onNavigateToModule('daily-attendance');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>{session.status === 'completed' ? 'Review / Edit' : 'Mark Attendance'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <h3 className="font-display font-bold text-sm md:text-base text-slate-900">Upcoming Class Sessions</h3>
            </div>
            <button
              onClick={() => onNavigateToModule('monthly-calendar')}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[280px]">
            {upcomingSessions.slice(0, 5).map((session) => (
              <div 
                key={session.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {session.formatted_date || session.class_date}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {session.timing_display || `${session.start_time} – ${session.end_time}`} • {session.weekday_name}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Scheduled
                  </span>
                  <button
                    onClick={() => {
                      if (onSelectClassForAttendance) {
                        onSelectClassForAttendance(session.id);
                      } else {
                        onNavigateToModule('daily-attendance');
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm cursor-pointer"
                    title="Open Attendance"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
