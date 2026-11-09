import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { PauseCircle, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';

export function PauseStudentModal({ isOpen, onClose, student, onStudentPaused }) {
  const { addToast } = useAuth();
  const [pausedDate, setPausedDate] = useState('2026-11-20');
  const [reason, setReason] = useState('Discontinued training classes');
  const [saving, setSaving] = useState(false);

  if (!student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.pauseStudent(student.id || student.student_id, {
        paused_date: pausedDate,
        reason: reason.trim()
      });
      addToast(`Attendance for ${student.student_name} has been paused from ${pausedDate}. Their history is preserved and they are automatically removed from next month's attendance list.`, 'success');
      onClose();
      if (onStudentPaused) onStudentPaused();
    } catch (err) {
      addToast('Failed to pause student: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pause Attendance: ${student.student_name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-900">Discontinue Class Action:</strong> Pausing this student ensures their name is <strong>automatically removed from the next month's attendance list</strong>. Their past attendance history will remain 100% maintained.
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Student:
          </label>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium">
            {student.student_name} <span className="text-rose-600 font-mono">({student.student_code})</span>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Effective Discontinuation Date:
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              required
              value={pausedDate}
              onChange={(e) => setPausedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Classes before this date preserve their attendance records. For subsequent months, they will not be listed.
          </span>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Discontinuation Reason:
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Discontinued class, relocated, personal reasons"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>You can resume this student's attendance anytime if they rejoin.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Pausing...' : 'Confirm Pause & Remove Next Month'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
