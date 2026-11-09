import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Calendar, Clock } from 'lucide-react';

export function PastClassModal({ isOpen, onClose, onSessionCreated, defaultDate = '' }) {
  const { addToast } = useAuth();
  const [classDate, setClassDate] = useState(defaultDate || '2026-11-01');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('20:30');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classDate) {
      addToast('Please pick a date for the class', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await api.createAdHocSession({
        class_date: classDate,
        start_time: startTime,
        end_time: endTime
      });
      addToast(`Class session on ${classDate} ready for attendance.`, 'success');
      onClose();
      if (onSessionCreated) onSessionCreated(res.session_id);
    } catch (err) {
      addToast('Failed to create class date: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Past / Custom Class Date"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <p className="text-slate-500">
          Create a class session for any past date or extra training day so you can maintain its historical attendance records.
        </p>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Class Date (YYYY-MM-DD):
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              required
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Start Time:
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              End Time:
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>
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
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Class Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
