import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Award, 
  TrendingUp, 
  Sliders, 
  Users,
  CheckCircle2
} from 'lucide-react';

export function AttendanceReportsView() {
  const { currentMaster, addToast } = useAuth();
  const [reportYear, setReportYear] = useState('2026');
  const [reportMonth, setReportMonth] = useState('11'); // November
  const [policy, setPolicy] = useState('standard');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const res = await api.getMonthlyReport({
        year: reportYear,
        month: reportMonth,
        policy
      });
      setReportData(res);
    } catch (err) {
      addToast('Failed to load attendance report: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMaster) {
      fetchMonthlyReport();
    }
  }, [currentMaster, reportYear, reportMonth, policy]);

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl(reportYear, reportMonth);
    window.open(url, '_blank');
    addToast('CSV export downloaded successfully.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const dojoSummary = reportData?.dojo_summary || {};
  const students = reportData?.students || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Export Actions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Monthly Performance Analysis</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Attendance Reports & Records
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Exportable monthly roster audits, individual student metrics, and configurable calculation policies for Ranga Nagar Dojo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-all flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-all flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-600" />
            <span className="text-slate-600 font-medium">Reporting Month:</span>
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:border-rose-500 cursor-pointer text-xs"
            >
              <option value="11">November 2026</option>
              <option value="12">December 2026</option>
              <option value="10">October 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-600" />
            <span className="text-slate-600 font-medium">Policy Formula:</span>
            <select
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:bg-white focus:border-rose-500 cursor-pointer text-xs"
            >
              <option value="standard">Standard: P / (P + A + L) × 100</option>
              <option value="include_leave">Excused: (P + L) / (P + A + L) × 100</option>
              <option value="exclude_leave">Deducted: P / (P + A) × 100</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 text-xs">
          Classes Completed: <strong className="text-slate-800 font-bold">{reportData?.total_classes_completed || 0}</strong> of <strong className="text-slate-800 font-bold">{reportData?.total_classes_scheduled || 0}</strong> scheduled
        </div>
      </div>

      {/* Dojo Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Students</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {dojoSummary.total_students || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{dojoSummary.active_students || 0} Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Present Tally</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {dojoSummary.total_present || 0}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Total across month</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center shadow-sm">
          <span className="text-[11px] font-bold text-rose-700 uppercase">Absent Tally</span>
          <div className="text-2xl font-bold text-rose-700 font-mono mt-1">
            {dojoSummary.total_absent || 0}
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5">Total across month</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Leave Tally</span>
          <div className="text-2xl font-bold text-amber-700 font-mono mt-1">
            {dojoSummary.total_leave || 0}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Approved absence</div>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
          <span className="text-[11px] font-bold text-rose-700 uppercase">Dojo Attendance %</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {dojoSummary.overall_percentage || 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dojo-wide rate</div>
        </div>
      </div>

      {/* Comprehensive Student Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3.5 px-6">Student Code</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Belt Rank</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Eligible Classes</th>
                <th className="py-3.5 px-6 text-center">Present</th>
                <th className="py-3.5 px-6 text-center">Absent</th>
                <th className="py-3.5 px-6 text-center">Leave</th>
                <th className="py-3.5 px-6 text-center">Attendance %</th>
                <th className="py-3.5 px-6 text-right">Standing Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(st => (
                <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-rose-600">
                    {st.student_code}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {st.student_name}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
                      {st.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {st.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono text-slate-700">
                    {st.total_eligible}
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-bold text-emerald-700">
                    {st.present_count}
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-bold text-rose-700">
                    {st.absent_count}
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-bold text-amber-700">
                    {st.leave_count}
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-black text-slate-900">
                    {st.attendance_percentage}%
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {st.grade.includes('Excellent') && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        {st.grade}
                      </span>
                    )}
                    {st.grade.includes('Good') && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                        {st.grade}
                      </span>
                    )}
                    {st.grade.includes('Needs') && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                        {st.grade}
                      </span>
                    )}
                    {st.grade === 'No Data' && (
                      <span className="text-[11px] text-slate-400">
                        No Classes
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
  );
}
