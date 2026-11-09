import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  CalendarClock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Settings2, 
  History, 
  Sparkles, 
  Save, 
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export function WeeklyScheduleView({ initialTab = 'active', onNavigateToSettings, onScheduleUpdated }) {
  const { currentMaster, addToast } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Active Schedule Data
  const [activeData, setActiveData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration Form State
  const [selectedDays, setSelectedDays] = useState([6, 0]); // Saturday (6) and Sunday (0) default
  const [startTime, setStartTime] = useState('18:30'); // 6:30 PM
  const [endTime, setEndTime] = useState('20:30'); // 8:30 PM
  const [effectiveFrom, setEffectiveFrom] = useState('2026-11-01');
  const [replaceFuture, setReplaceFuture] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const weekdaysList = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
    { id: 0, name: 'Sunday', short: 'Sun' },
  ];

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [activeRes, histRes] = await Promise.all([
        api.getActiveSchedule().catch(() => ({ active: false })),
        api.getScheduleHistory().catch(() => ({ history: [] }))
      ]);
      setActiveData(activeRes);
      setHistoryData(histRes?.history || []);

      if (activeRes?.active && activeRes?.schedule) {
        if (activeRes.schedule.days) setSelectedDays(activeRes.schedule.days);
        if (activeRes.schedule.start_time) setStartTime(activeRes.schedule.start_time);
        if (activeRes.schedule.end_time) setEndTime(activeRes.schedule.end_time);
      }
    } catch (err) {
      addToast('Failed to load schedule data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMaster) {
      loadScheduleData();
    }
  }, [currentMaster]);

  const toggleDay = (dayId) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) {
          addToast('At least one training day must be selected.', 'error');
          return prev;
        }
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId].sort((a, b) => a - b);
      }
    });
  };

  const applyPreset = (presetName) => {
    if (presetName === 'weekend') {
      setSelectedDays([6, 0]);
      setStartTime('18:30');
      setEndTime('20:30');
      addToast('Applied Initial Example: Saturday & Sunday (6:30 PM – 8:30 PM)', 'info');
    } else if (presetName === 'fri_sat_sun') {
      setSelectedDays([5, 6, 0]);
      setStartTime('19:00');
      setEndTime('21:00');
      addToast('Applied: Friday, Saturday & Sunday (7:00 PM – 9:00 PM)', 'info');
    } else if (presetName === 'tue_thu') {
      setSelectedDays([2, 4]);
      setStartTime('17:00');
      setEndTime('19:00');
      addToast('Applied: Tuesday & Thursday (5:00 PM – 7:00 PM)', 'info');
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!effectiveFrom) {
      addToast('Please specify an effective starting date.', 'error');
      return;
    }
    if (selectedDays.length === 0) {
      addToast('Please select at least one training day.', 'error');
      return;
    }
    setConfirmModalOpen(true);
  };

  const executeSaveSchedule = async () => {
    try {
      setSaving(true);
      const res = await api.updateSchedule({
        effective_from: effectiveFrom,
        start_time: startTime,
        end_time: endTime,
        days: selectedDays,
        replaceFutureUncompleted: replaceFuture
      });

      addToast(`Schedule updated successfully! ${res?.generatedCount || 8} sessions maintained from ${effectiveFrom}.`, 'success');
      setConfirmModalOpen(false);
      await loadScheduleData();
      setActiveTab('active');
    } catch (err) {
      addToast('Failed to update schedule: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const schedule = activeData?.schedule;
  const weekTable = activeData?.weekTable || [
    { weekday: 1, dayName: 'Monday', hasClass: false, timing: '—' },
    { weekday: 2, dayName: 'Tuesday', hasClass: false, timing: '—' },
    { weekday: 3, dayName: 'Wednesday', hasClass: false, timing: '—' },
    { weekday: 4, dayName: 'Thursday', hasClass: false, timing: '—' },
    { weekday: 5, dayName: 'Friday', hasClass: false, timing: '—' },
    { weekday: 6, dayName: 'Saturday', hasClass: true, timing: '6:30 PM – 8:30 PM' },
    { weekday: 0, dayName: 'Sunday', hasClass: true, timing: '6:30 PM – 8:30 PM' },
  ];

  const dayNamesSelected = selectedDays
    .map((d) => weekdaysList.find((w) => w.id === d)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-5">
      {/* 1. HEADER BANNER */}
      <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <CalendarClock className="w-4 h-4" />
            <span>Weekly Class Configuration</span>
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">
            Weekly Class Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Configure weekly training days and timings once. Classes are automatically generated and maintained across weeks and months.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Active Timetable</span>
          </button>
          <button
            onClick={() => setActiveTab('configure')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'configure'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure / Edit</span>
          </button>
        </div>
      </div>

      {/* ==========================================================
          TAB 1: ACTIVE SCHEDULE & TIMETABLE MATRIX
          ========================================================== */}
      {activeTab === 'active' && (
        <div className="space-y-5">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Active Training Timings
              </div>
              <div className="text-lg md:text-xl font-black text-rose-600">
                {schedule?.timingDisplay || `${schedule?.start_time || '18:30'} – ${schedule?.end_time || '20:30'}`}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-600" />
                <span>Standard Session: 2 Hours</span>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Effective Starting Date
              </div>
              <div className="text-lg md:text-xl font-black text-slate-900">
                {schedule?.effective_from || '2026-11-01'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Currently Active</span>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Scheduled Days / Week
              </div>
              <div className="text-lg md:text-xl font-black text-slate-900">
                {schedule?.days?.length || 2} Days / Week
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {schedule?.days?.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') || 'Saturday, Sunday'}
              </div>
            </div>
          </div>

          {/* Timetable Matrix */}
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Weekly Class Days & Timings Timetable
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follows this recurring schedule automatically without requiring manual class creation.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('configure')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Modify Schedule</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-5">Day of Week</th>
                    <th className="py-3 px-5">Class Occurrence</th>
                    <th className="py-3 px-5">Session Timing</th>
                    <th className="py-3 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weekTable.map((item) => (
                    <tr 
                      key={item.weekday}
                      className={item.hasClass ? 'bg-rose-50/20 hover:bg-rose-50/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}
                    >
                      <td className="py-3 px-5 font-bold text-slate-900">
                        {item.dayName}
                      </td>
                      <td className="py-3 px-5">
                        {item.hasClass ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active Class</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200">
                            <span>No Class</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 font-semibold text-slate-700">
                        {item.timing}
                      </td>
                      <td className="py-3 px-5 text-right">
                        {item.hasClass ? (
                          <span className="text-[11px] font-bold text-emerald-700">
                            Recurring Weekly
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Off-day
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: SCHEDULE CONFIGURATION & EDIT FORM
          ========================================================== */}
      {activeTab === 'configure' && (
        <div className="space-y-5 max-w-4xl">
          {/* Quick Presets */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Quick Presets:</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset('weekend')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                Saturday & Sunday (6:30 PM)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('fri_sat_sun')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                Fri, Sat & Sun (7:00 PM)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tue_thu')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                Tuesday & Thursday (5:00 PM)
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveClick} className="space-y-5">
            <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              
              {/* Day selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. Select Training Weekdays
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {weekdaysList.map((w) => {
                    const isSelected = selectedDays.includes(w.id);
                    return (
                      <button
                        type="button"
                        key={w.id}
                        onClick={() => toggleDay(w.id)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs uppercase font-black">{w.short}</span>
                        <span className="text-[10px] font-medium">{w.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    2. Starting Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    3. Ending Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Effective date */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  4. Effective Starting Date
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  required
                  className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-rose-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The schedule repeats every week from this date. Completed sessions and past attendance remain untouched.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Weekly Schedule'}</span>
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Weekly Schedule Change"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700">
            You are saving an updated weekly training schedule:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-800">
            <div>Days: <strong className="text-rose-600 font-bold">{dayNamesSelected}</strong></div>
            <div>Timing: <strong className="font-bold">{startTime} – {endTime}</strong></div>
            <div>Effective From: <strong className="text-emerald-700 font-bold">{effectiveFrom}</strong></div>
          </div>
          <p className="text-slate-500 text-[11px]">
            Future uncompleted classes will automatically be generated according to this schedule.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeSaveSchedule}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm cursor-pointer"
            >
              {saving ? 'Saving...' : 'Confirm & Apply Schedule'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
