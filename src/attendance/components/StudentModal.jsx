import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { UserPlus, UserCheck, Shield, Calendar, Award } from 'lucide-react';

export function StudentModal({ isOpen, onClose, onStudentSaved, studentToEdit = null }) {
  const { addToast } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [joiningDate, setJoiningDate] = useState('2026-01-01');
  const [status, setStatus] = useState('active'); // 'active' or 'inactive'
  const [rank, setRank] = useState('White Belt (Beginner)');
  const [saving, setSaving] = useState(false);

  const beltRanks = [
    'White Belt (Beginner)',
    'Yellow Belt (6th Kyu)',
    'Yellow Belt (5th Kyu)',
    'Green Belt (4th Kyu)',
    'Green Belt (3rd Kyu)',
    'Brown Belt (2nd Kyu)',
    'Brown Belt (1st Kyu)',
    'Black Belt (1st Dan)',
    'Black Belt (2nd Dan)',
    'Black Belt (3rd Dan+)'
  ];

  useEffect(() => {
    if (studentToEdit) {
      setStudentName(studentToEdit.student_name || '');
      setStudentCode(studentToEdit.student_code || '');
      setJoiningDate(studentToEdit.joining_date || '2026-01-01');
      setStatus(studentToEdit.status || 'active');
      setRank(studentToEdit.rank || 'White Belt (Beginner)');
    } else if (isOpen) {
      // Suggest next code
      api.getNextStudentCode().then(res => {
        if (res.next_code) setStudentCode(res.next_code);
      }).catch(() => {});
      setStudentName('');
      setJoiningDate('2026-01-01');
      setStatus('active');
      setRank('White Belt (Beginner)');
    }
  }, [isOpen, studentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      addToast('Please enter the student name', 'error');
      return;
    }

    try {
      setSaving(true);
      if (studentToEdit) {
        await api.updateStudent(studentToEdit.id, {
          student_name: studentName.trim(),
          student_code: studentCode.trim(),
          joining_date: joiningDate,
          status,
          rank
        });
        addToast(`Student record for ${studentName} updated successfully.`, 'success');
      } else {
        await api.createStudent({
          student_name: studentName.trim(),
          student_code: studentCode.trim(),
          joining_date: joiningDate,
          status,
          rank
        });
        addToast(`Student ${studentName} (${status === 'inactive' ? 'Previous Student' : 'Active'}) added successfully.`, 'success');
      }
      onClose();
      if (onStudentSaved) onStudentSaved();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? `Edit Student: ${studentToEdit.student_name}` : 'Enter New / Previous Student Record'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Student Full Name <span className="text-rose-500">*</span>:
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kenji Takahashi, Taro Yamada"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Student Code / ID:
            </label>
            <input
              type="text"
              placeholder="e.g. KOMS-STU-016"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Joining Date:
            </label>
            <input
              type="date"
              required
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Belt Rank:
          </label>
          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none cursor-pointer"
          >
            {beltRanks.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Student Status:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('active')}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                status === 'active'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Active Student
            </button>
            <button
              type="button"
              onClick={() => setStatus('inactive')}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                status === 'inactive'
                  ? 'bg-amber-500 text-slate-900 border-amber-500 font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Previous Student
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {status === 'active'
              ? 'Currently attending weekly training classes.'
              : 'Former / graduated student. Used for maintaining historical month-wise attendance.'}
          </p>
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
            {saving ? 'Saving...' : studentToEdit ? 'Save Changes' : 'Add Student Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
