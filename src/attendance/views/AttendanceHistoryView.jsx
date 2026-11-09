import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StudentModal } from '../components/StudentModal';
import { PauseStudentModal } from '../components/PauseStudentModal';
import { 
  Users, 
  Search, 
  Calendar, 
  CalendarDays,
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  UserCheck, 
  ShieldCheck, 
  RotateCcw,
  UserPlus, 
  TrendingUp, 
  PauseCircle, 
  PlayCircle,
  ListFilter,
  Eye,
  CalendarCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

export function AttendanceHistoryView({ onSelectClassForAttendance }) {
  const { currentMaster, addToast } = useAuth();

  // Mode: 'four-level' (Main class-wise hierarchy) or 'student-directory' (Individual student profiles)
  const [historyMode, setHistoryMode] = useState('four-level');

  // Hierarchy Navigation Level: 1 (Year) -> 2 (Month) -> 3 (Class Dates) -> 4 (Student List)
  const [level, setLevel] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedMonthName, setSelectedMonthName] = useState('November');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Level 1: Years Data
  const [yearsData, setYearsData] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(false);

  // Level 2: Months Data
  const [monthsData, setMonthsData] = useState([]);
  const [monthsLoading, setMonthsLoading] = useState(false);

  // Level 3: Class Dates Data
  const [sessionsData, setSessionsData] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('ALL'); // ALL, COMPLETED, PENDING, CANCELLED

  // Level 4: Day Attendance Student List Data
  const [sessionDetail, setSessionDetail] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // ALL, PRESENT, ABSENT, LEAVE, NOT MARKED
  const [updatingStudentId, setUpdatingStudentId] = useState(null);

  // Individual Student Profile View (Part 7)
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentHistoryData, setStudentHistoryData] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [profileLoading, setProfileLoading] = useState(false);

  // Modals for student editing & pause
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [studentToPause, setStudentToPause] = useState(null);

  /* ==========================================================
     LEVEL 1: LOAD YEARS
     ========================================================== */
  const loadYears = async () => {
    try {
      setYearsLoading(true);
      const res = await api.master.getHistoryYears();
      setYearsData(res.years || []);
    } catch (err) {
      addToast('Failed to load years: ' + err.message, 'error');
    } finally {
      setYearsLoading(false);
    }
  };

  /* ==========================================================
     LEVEL 2: LOAD MONTHS FOR YEAR
     ========================================================== */
  const loadMonths = async (year) => {
    try {
      setMonthsLoading(true);
      const res = await api.master.getHistoryMonths(year);
      setMonthsData(res.months || []);
    } catch (err) {
      addToast(`Failed to load months for ${year}: ` + err.message, 'error');
    } finally {
      setMonthsLoading(false);
    }
  };

  /* ==========================================================
     LEVEL 3: LOAD SESSIONS FOR YEAR & MONTH
     ========================================================== */
  const loadSessions = async (year, month) => {
    try {
      setSessionsLoading(true);
      const res = await api.master.getHistorySessions(year, month);
      setSessionsData(res.sessions || []);
    } catch (err) {
      addToast(`Failed to load class dates: ` + err.message, 'error');
    } finally {
      setSessionsLoading(false);
    }
  };

  /* ==========================================================
     LEVEL 4: LOAD ROSTER FOR A CLASS SESSION
     ========================================================== */
  const loadRoster = async (sessionId) => {
    try {
      setRosterLoading(true);
      const res = await api.master.getSessionRoster(sessionId);
      setSessionDetail(res.session);
      setSessionSummary(res.summary);
      setStudentsRoster(res.roster || []);
    } catch (err) {
      addToast(`Failed to load day attendance roster: ` + err.message, 'error');
    } finally {
      setRosterLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (currentMaster) {
      loadYears();
      loadStudentsDirectory();
    }
  }, [currentMaster]);

  // Handle Level Navigation
  const goToLevel1 = () => {
    setLevel(1);
    loadYears();
  };

  const goToLevel2 = (year) => {
    setSelectedYear(year);
    setLevel(2);
    loadMonths(year);
  };

  const goToLevel3 = (year, month, monthName) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    if (monthName) setSelectedMonthName(monthName);
    setLevel(3);
    setSessionFilter('ALL');
    loadSessions(year, month);
  };

  const goToLevel4 = (sessionId) => {
    setSelectedSessionId(sessionId);
    setLevel(4);
    setStudentSearch('');
    setAttendanceFilter('ALL');
    loadRoster(sessionId);
  };

  // Quick in-line attendance update at Level 4
  const handleQuickStatusUpdate = async (studentId, newStatus) => {
    try {
      setUpdatingStudentId(studentId);
      await api.recordSingleAttendance(selectedSessionId, studentId, newStatus);
      addToast(`Attendance updated to ${newStatus}`, 'success');
      // Reload roster & recalculate
      await loadRoster(selectedSessionId);
      // Reload sessions data in background
      loadSessions(selectedYear, selectedMonth);
    } catch (err) {
      addToast('Failed to update status: ' + err.message, 'error');
    } finally {
      setUpdatingStudentId(null);
    }
  };

  /* ==========================================================
     INDIVIDUAL STUDENT DIRECTORY (PART 7)
     ========================================================== */
  const loadStudentsDirectory = async () => {
    try {
      const res = await api.getStudents({ status: studentStatusFilter });
      setStudentsList(res.students || []);
      if (res.students?.length > 0 && !selectedStudentId) {
        setSelectedStudentId(res.students[0].id);
      }
    } catch (err) {
      addToast('Failed to load students: ' + err.message, 'error');
    }
  };

  const loadStudentProfileHistory = async (studentId) => {
    if (!studentId) return;
    try {
      setProfileLoading(true);
      const res = await api.master.getStudentAttendanceHistory(studentId, {
        year: selectedYear,
        month: selectedMonth
      });
      setStudentHistoryData(res);
    } catch (err) {
      addToast('Failed to load student history: ' + err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (historyMode === 'student-directory' && selectedStudentId) {
      loadStudentProfileHistory(selectedStudentId);
    }
  }, [historyMode, selectedStudentId, selectedYear, selectedMonth]);

  const handleResumeStudent = async (studentId, studentName) => {
    try {
      await api.resumeStudent(studentId);
      addToast(`Attendance for ${studentName} resumed to Active.`, 'success');
      loadStudentsDirectory();
      loadStudentProfileHistory(studentId);
    } catch (err) {
      addToast('Failed to resume student: ' + err.message, 'error');
    }
  };

  // Filter Level 3 sessions
  const filteredSessions = sessionsData.filter(s => {
    if (sessionFilter === 'ALL') return true;
    if (sessionFilter === 'COMPLETED') return s.is_completed;
    if (sessionFilter === 'PENDING') return s.attendance_status === 'IN PROGRESS' || s.attendance_status === 'NOT STARTED';
    if (sessionFilter === 'CANCELLED') return s.is_cancelled;
    return true;
  });

  // Filter Level 4 students roster
  const filteredRoster = studentsRoster.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.student_code.toLowerCase().includes(studentSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (attendanceFilter === 'ALL') return true;
    return s.attendance_status === attendanceFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Attendance History Management</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Attendance History
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Hierarchical attendance tracking: Year → Month → Class Date → View Attendance & Complete Student List.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setHistoryMode('four-level')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                historyMode === 'four-level'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Class-Wise History</span>
            </button>
            <button
              onClick={() => setHistoryMode('student-directory')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                historyMode === 'student-directory'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-rose-600" />
              <span>Student Profile History</span>
            </button>
          </div>

          <button
            onClick={() => {
              setStudentToEdit(null);
              setStudentModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-rose-600" />
            <span>+ Enter Student</span>
          </button>
        </div>
      </div>

      {/* ==========================================================
          FOUR-LEVEL ATTENDANCE HIERARCHY
          ========================================================== */}
      {historyMode === 'four-level' && (
        <div className="space-y-6">
          
          {/* Breadcrumb Navigation Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                Hierarchy:
              </span>

              {/* Level 1 Breadcrumb */}
              <button
                onClick={goToLevel1}
                className={`font-semibold hover:text-rose-600 transition-colors ${
                  level === 1 ? 'text-rose-600 font-bold' : 'text-slate-600'
                }`}
              >
                Attendance History (Years)
              </button>

              {/* Level 2 Breadcrumb */}
              {level >= 2 && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => goToLevel2(selectedYear)}
                    className={`font-semibold hover:text-rose-600 transition-colors ${
                      level === 2 ? 'text-rose-600 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Year {selectedYear}
                  </button>
                </>
              )}

              {/* Level 3 Breadcrumb */}
              {level >= 3 && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => goToLevel3(selectedYear, selectedMonth, selectedMonthName)}
                    className={`font-semibold hover:text-rose-600 transition-colors ${
                      level === 3 ? 'text-rose-600 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {selectedMonthName} ({sessionsData.length} Classes)
                  </button>
                </>
              )}

              {/* Level 4 Breadcrumb */}
              {level === 4 && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-rose-600 font-bold">
                    {sessionDetail?.class_date} ({sessionDetail?.day_name}) — Student Roster List
                  </span>
                </>
              )}
            </div>

            {/* Back Button */}
            {level > 1 && (
              <button
                onClick={() => {
                  if (level === 4) goToLevel3(selectedYear, selectedMonth, selectedMonthName);
                  else if (level === 3) goToLevel2(selectedYear);
                  else if (level === 2) goToLevel1();
                }}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold transition-colors px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* ======================================================
              LEVEL 1: YEAR SELECTION CARDS
              ====================================================== */}
          {level === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span>Level 1: Select Academic / Training Year</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Select a year to access its monthly attendance sessions
                </span>
              </div>

              {yearsLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs rounded-2xl bg-white border border-slate-200">
                  Loading available attendance years...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearsData.map(item => (
                    <div
                      key={item.year}
                      className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 transition-all shadow-sm group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                            Dojo Session Year
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {item.total_months} Months
                          </span>
                        </div>

                        <h4 className="font-display text-3xl font-black text-slate-900 font-mono group-hover:text-rose-600 transition-colors">
                          {item.year}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Official KOMS training calendar for Ranga Nagar Dojo.
                        </p>

                        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center font-mono">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Total</span>
                            <span className="text-sm font-black text-slate-900 mt-0.5 block">{item.total_sessions}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 uppercase font-sans font-bold block">Done</span>
                            <span className="text-sm font-black text-emerald-700 mt-0.5 block">{item.completed_sessions}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                            <span className="text-[10px] text-blue-700 uppercase font-sans font-bold block">Upcoming</span>
                            <span className="text-sm font-black text-blue-700 mt-0.5 block">{item.upcoming_sessions}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => goToLevel2(item.year)}
                        className="mt-6 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                      >
                        <span>View Attendance (12 Months)</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================
              LEVEL 2: MONTH SELECTION CARDS (FOR SELECTED YEAR)
              ====================================================== */}
          {level === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-rose-600" />
                    <span>Level 2: Select Month for Year {selectedYear}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click View Attendance on any month to view all scheduled class dates.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  12 Months in {selectedYear}
                </span>
              </div>

              {monthsLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs rounded-2xl bg-white border border-slate-200">
                  Loading months for {selectedYear}...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {monthsData.map(m => (
                    <div
                      key={m.month}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 transition-all flex flex-col justify-between group shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-rose-600 font-mono">
                            Month {m.month_code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {selectedYear}
                          </span>
                        </div>

                        <h4 className="font-display text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {m.month_name}
                        </h4>

                        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Scheduled Classes:</span>
                            <strong className="text-slate-900 font-mono">{m.total_scheduled} Classes</strong>
                          </div>
                          <div className="flex items-center justify-between text-emerald-700">
                            <span className="text-slate-500">Completed Sessions:</span>
                            <strong className="font-mono">{m.completed} Done</strong>
                          </div>
                          <div className="flex items-center justify-between text-amber-700">
                            <span className="text-slate-500">Pending Attendance:</span>
                            <strong className="font-mono">{m.pending} Pending</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => goToLevel3(selectedYear, m.month, m.month_name)}
                        className="mt-5 w-full py-2 rounded-xl bg-slate-50 group-hover:bg-rose-600 group-hover:text-white text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 group-hover:border-transparent"
                      >
                        <span>View Attendance</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================
              LEVEL 3: INDIVIDUAL CLASS DATES FOR SELECTED MONTH
              ====================================================== */}
          {level === 3 && (
            <div className="space-y-6">
              
              {/* Level 3 Header & Month Summary */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Level 3: Individual Class Dates
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                    {selectedMonthName} {selectedYear} ({sessionsData.length} Classes)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Every scheduled training session is maintained separately. Click <strong>[VIEW ATTENDANCE]</strong> on any date to inspect or manage its full student roster.
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto overflow-x-auto">
                  {['ALL', 'COMPLETED', 'PENDING', 'CANCELLED'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setSessionFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        sessionFilter === tab
                          ? 'bg-rose-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Dates Cards Grid */}
              {sessionsLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs rounded-2xl bg-white border border-slate-200">
                  Loading class dates for {selectedMonthName} {selectedYear}...
                </div>
              ) : filteredSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`
                        p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-sm bg-white
                        ${session.is_completed 
                          ? 'border-slate-200 hover:border-rose-300' 
                          : session.is_cancelled
                          ? 'border-rose-200 bg-rose-50/20 opacity-70'
                          : 'border-slate-200'
                        }
                      `}
                    >
                      {/* Top Bar: Class Number & Status */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-rose-600 font-mono">
                            {session.class_number_label}
                          </span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            session.attendance_status === 'FINALIZED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : session.attendance_status === 'IN PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : session.is_cancelled
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {session.attendance_status}
                          </span>
                        </div>

                        {/* Date & Day */}
                        <h4 className="font-display text-lg font-bold text-slate-900">
                          {session.class_date} — {session.day_name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Timing: {session.timing_display}
                        </div>
                      </div>

                      {/* Required Metrics: Total Students, Present, Absent, Leave, Not Marked */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block font-sans">Students</span>
                            <span className="text-sm font-black text-slate-900 mt-0.5 block">{session.total_eligible_students}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[9px] uppercase font-bold text-emerald-700 block font-sans">Present</span>
                            <span className="text-sm font-black text-emerald-700 mt-0.5 block">{session.present_count}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                            <span className="text-[9px] uppercase font-bold text-rose-700 block font-sans">Absent</span>
                            <span className="text-sm font-black text-rose-700 mt-0.5 block">{session.absent_count}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                            <span className="text-[9px] uppercase font-bold text-amber-700 block font-sans">Leave</span>
                            <span className="text-sm font-black text-amber-700 mt-0.5 block">{session.leave_count}</span>
                          </div>
                        </div>

                        {session.not_marked_count > 0 && (
                          <div className="text-[11px] text-slate-500 font-mono mt-2 text-center">
                            Not Marked: <strong className="text-slate-800">{session.not_marked_count}</strong> students
                          </div>
                        )}

                        {/* Individual VIEW ATTENDANCE Button */}
                        <button
                          onClick={() => goToLevel4(session.id)}
                          className="mt-4 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-white" />
                          <span>VIEW ATTENDANCE</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-400 rounded-2xl bg-white border border-slate-200">
                  No classes matching filter "{sessionFilter}" in {selectedMonthName} {selectedYear}.
                </div>
              )}
            </div>
          )}

          {/* ======================================================
              LEVEL 4: VIEW ATTENDANCE / COMPLETE STUDENT ROSTER
              ====================================================== */}
          {level === 4 && (
            <div className="space-y-6">
              
              {/* Level 4 Session Header */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                    <span>Level 4: Complete Session Roster List</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>{sessionDetail?.class_date} — {sessionDetail?.day_name}</span>
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    Timing: {sessionDetail?.timing_display} • Ranga Nagar Dojo
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {onSelectClassForAttendance && (
                    <button
                      onClick={() => onSelectClassForAttendance(selectedSessionId)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Full Daily Attendance</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => goToLevel3(selectedYear, selectedMonth, selectedMonthName)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Class Dates</span>
                  </button>
                </div>
              </div>

              {/* Attendance Summary Strip */}
              {sessionSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-sans">Total Students</span>
                    <div className="text-xl font-black text-slate-900 mt-1">{sessionSummary.total_students}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase font-sans">Present</span>
                    <div className="text-xl font-black text-emerald-700 mt-1">{sessionSummary.present_count}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 shadow-xs">
                    <span className="text-[10px] font-bold text-rose-700 uppercase font-sans">Absent</span>
                    <div className="text-xl font-black text-rose-700 mt-1">{sessionSummary.absent_count}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-700 uppercase font-sans">Leave</span>
                    <div className="text-xl font-black text-amber-700 mt-1">{sessionSummary.leave_count}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-sans">Not Marked</span>
                    <div className="text-xl font-black text-slate-800 mt-1">{sessionSummary.not_marked_count}</div>
                  </div>
                </div>
              )}

              {/* Search & Status Filters */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student name or ID..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] w-full sm:w-auto overflow-x-auto">
                  {['ALL', 'PRESENT', 'ABSENT', 'LEAVE', 'NOT MARKED'].map(f => (
                    <button
                      key={f}
                      onClick={() => setAttendanceFilter(f)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        attendanceFilter === f
                          ? 'bg-rose-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 4 Student Attendance Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4 text-center w-12">S.No</th>
                        <th className="py-3 px-4">Student ID</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Belt Rank</th>
                        <th className="py-3 px-4 text-center">Attendance</th>
                        <th className="py-3 px-4 text-right">Action / In-Line Quick Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {rosterLoading ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 font-sans">
                            Loading student attendance roster...
                          </td>
                        </tr>
                      ) : filteredRoster.length > 0 ? (
                        filteredRoster.map((item, idx) => (
                          <tr key={item.student_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 text-center text-slate-400 font-bold">
                              {item.s_no || idx + 1}
                            </td>
                            <td className="py-3 px-4 text-rose-600 font-bold">
                              {item.student_code}
                            </td>
                            <td className="py-3 px-4 text-slate-900 font-sans font-semibold">
                              {item.student_name}
                              {item.enrollment_status === 'paused' && (
                                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                                  PAUSED
                                </span>
                              )}
                              {item.enrollment_status === 'inactive' && (
                                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                                  PREVIOUS
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-sans">
                              {item.rank}
                            </td>
                            <td className="py-3 px-4 text-center font-sans font-bold">
                              {item.attendance_status === 'PRESENT' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Present</span>
                                </span>
                              )}
                              {item.attendance_status === 'ABSENT' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Absent</span>
                                </span>
                              )}
                              {item.attendance_status === 'LEAVE' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Leave</span>
                                </span>
                              )}
                              {(!item.attendance_status || item.attendance_status === 'NOT MARKED') && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200">
                                  <span>Not Marked</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick In-Line Status Toggles */}
                                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 font-sans">
                                  <button
                                    title="Mark Present"
                                    disabled={updatingStudentId === item.student_id}
                                    onClick={() => handleQuickStatusUpdate(item.student_id, 'PRESENT')}
                                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                                      item.attendance_status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-emerald-700'
                                    }`}
                                  >
                                    P
                                  </button>
                                  <button
                                    title="Mark Absent"
                                    disabled={updatingStudentId === item.student_id}
                                    onClick={() => handleQuickStatusUpdate(item.student_id, 'ABSENT')}
                                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                                      item.attendance_status === 'ABSENT' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-700'
                                    }`}
                                  >
                                    A
                                  </button>
                                  <button
                                    title="Mark Leave"
                                    disabled={updatingStudentId === item.student_id}
                                    onClick={() => handleQuickStatusUpdate(item.student_id, 'LEAVE')}
                                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                                      item.attendance_status === 'LEAVE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-amber-700'
                                    }`}
                                  >
                                    L
                                  </button>
                                </div>

                                {/* Open Student Profile Action */}
                                <button
                                  onClick={() => {
                                    setSelectedStudentId(item.student_id);
                                    setHistoryMode('student-directory');
                                  }}
                                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 font-sans"
                                >
                                  Profile
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                            No students match "{studentSearch}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ==========================================================
          PART 7: INDIVIDUAL STUDENT PROFILE HISTORY TAB
          ========================================================== */}
      {historyMode === 'student-directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Selector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Student
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {studentsList.length} Total
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] border border-slate-200">
                {['all', 'active', 'paused', 'inactive'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStudentStatusFilter(st)}
                    className={`flex-1 py-1 rounded-lg text-center font-medium transition-colors capitalize ${
                      studentStatusFilter === st ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Student List */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm max-h-[550px] overflow-y-auto divide-y divide-slate-100">
              {studentsList
                .filter(s => s.student_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.student_code.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                .map(s => {
                  const isSelected = s.id === selectedStudentId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-rose-50/70 border-l-4 border-rose-600 pl-3' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                            {s.student_name}
                          </span>
                          {s.status === 'paused' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                              Paused
                            </span>
                          )}
                          {s.status === 'inactive' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                              Previous
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {s.student_code} • {s.rank}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Individual Student Profile & Month-Wise Attendance History */}
          <div className="lg:col-span-8 space-y-6">
            {studentHistoryData?.student && (
              <>
                {/* Profile Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black text-xl font-display shadow-md shadow-rose-500/20">
                        {studentHistoryData.student.student_name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl font-bold text-slate-900">
                            {studentHistoryData.student.student_name}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            studentHistoryData.student.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : studentHistoryData.student.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {studentHistoryData.student.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          ID: <strong className="text-rose-600">{studentHistoryData.student.student_code}</strong> • Rank: {studentHistoryData.student.rank} • Joined: {studentHistoryData.student.joining_date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {studentHistoryData.student.status === 'paused' ? (
                        <button
                          onClick={() => handleResumeStudent(studentHistoryData.student.id, studentHistoryData.student.student_name)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Resume Attendance</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setStudentToPause(studentHistoryData.student);
                            setPauseModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pause Attendance</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setStudentToEdit(studentHistoryData.student);
                          setStudentModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors"
                      >
                        Edit Student
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-sans">Total Scheduled</span>
                      <div className="text-xl font-black text-slate-900 mt-1">{studentHistoryData.metrics?.total_scheduled_classes || 0}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase font-sans">Attended</span>
                      <div className="text-xl font-black text-emerald-700 mt-1">{studentHistoryData.metrics?.total_attended_classes || 0}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[10px] font-bold text-rose-700 uppercase font-sans">Absent</span>
                      <div className="text-xl font-black text-rose-700 mt-1">{studentHistoryData.metrics?.total_absent || 0}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-rose-700 uppercase font-sans">Cumulative %</span>
                      <div className="text-xl font-black text-rose-600 mt-1">{studentHistoryData.metrics?.overall_attendance_percentage || 0}%</div>
                    </div>
                  </div>
                </div>

                {/* Month-Wise Attendance History & Calculations */}
                <div className="space-y-4">
                  {studentHistoryData.monthly_records?.map(monthGroup => (
                    <div
                      key={monthGroup.month_key}
                      className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                            {monthGroup.month_name}
                          </div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            Attended: <strong className="text-emerald-700">{monthGroup.attended_count}</strong> of <strong className="text-slate-900">{monthGroup.total_scheduled_in_month}</strong> Classes
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            Formula: ({monthGroup.attended_count} attended ÷ {monthGroup.total_scheduled_in_month} scheduled) × 100 = <strong className="text-amber-800">{monthGroup.attendance_percentage}%</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-500 uppercase">Monthly Rate:</span>
                          <div className="text-2xl font-black font-mono text-rose-600">
                            {monthGroup.attendance_percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Date of Month Attendance Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                            <tr>
                              <th className="py-2.5 px-4">Date of the Month</th>
                              <th className="py-2.5 px-4">Day</th>
                              <th className="py-2.5 px-4">Timing</th>
                              <th className="py-2.5 px-4">Attendance Status</th>
                              <th className="py-2.5 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {monthGroup.dates?.map(d => (
                              <tr key={d.session_id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {d.class_date}
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-sans">
                                  {d.day_name}
                                </td>
                                <td className="py-3 px-4 text-slate-500">
                                  {d.timing}
                                </td>
                                <td className="py-3 px-4 font-sans font-bold">
                                  {d.status === 'PRESENT' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Present
                                    </span>
                                  )}
                                  {d.status === 'ABSENT' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
                                      <XCircle className="w-3.5 h-3.5" />
                                      Absent
                                    </span>
                                  )}
                                  {d.status === 'LEAVE' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3.5 h-3.5" />
                                      Leave
                                    </span>
                                  )}
                                  {d.status === 'NOT MARKED' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200">
                                      Not Marked
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right font-sans">
                                  <button
                                    onClick={() => {
                                      setHistoryMode('four-level');
                                      goToLevel4(d.session_id);
                                    }}
                                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
                                  >
                                    <span>Class Roster</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Student Entry / Edit Modal */}
      <StudentModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        studentToEdit={studentToEdit}
        onStudentSaved={() => {
          loadStudentsDirectory();
          if (level === 4 && selectedSessionId) loadRoster(selectedSessionId);
        }}
      />

      {/* Pause Attendance Modal */}
      <PauseStudentModal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        student={studentToPause}
        onStudentPaused={() => {
          loadStudentsDirectory();
          if (selectedStudentId) loadStudentProfileHistory(selectedStudentId);
          if (level === 4 && selectedSessionId) loadRoster(selectedSessionId);
        }}
      />

    </div>
  );
}
