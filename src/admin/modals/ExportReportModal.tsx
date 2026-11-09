import React from 'react'
import { assetConfig } from '../../config/assets'
import type { StudentMonthlyAttendanceSummary } from '../../models/koms'

interface ExportReportModalProps {
  isOpen: boolean
  onClose: () => void
  dojoName: string
  monthName: string
  year: number
  summaries: StudentMonthlyAttendanceSummary[]
  overallPercentage: number
  totalConducted: number
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  dojoName,
  monthName,
  year,
  summaries,
  overallPercentage,
  totalConducted,
}) => {
  if (!isOpen) return null

  // Function to download CSV
  function downloadCsv() {
    const headers = [
      'Student ID',
      'Student Name',
      'Belt Rank',
      'Total Classes Conducted',
      'Present',
      'Absent',
      'Late',
      'Excused',
      'Attendance Percentage',
      'Rating',
    ]

    const rows = summaries.map((s) => [
      `"${s.memberId}"`,
      `"${s.studentName}"`,
      `"${s.rank}"`,
      s.totalConducted,
      s.presentCount,
      s.absentCount,
      s.lateCount,
      s.excusedCount,
      `${s.attendancePercentage}%`,
      `"${s.rating}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `KOMS_Attendance_Report_${dojoName.replace(/\s+/g, '_')}_${monthName}_${year}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content master-export-report-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          maxHeight: '94vh',
          overflowY: 'auto',
          background: '#ffffff',
          color: '#0f172a',
        }}
      >
        {/* Printable Paper View Header */}
        <div className="master-print-paper-header" style={{ padding: '24px 28px', borderBottom: '2px solid #b91c1c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={assetConfig.logo}
                alt="KOMS Logo"
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
              />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', color: '#b91c1c' }}>
                  KOBUDO RENMEI BUKENKAN — INDIA
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '2px 0', color: '#0f172a' }}>
                  MASS DRAGON DOJO • OFFICIAL ATTENDANCE REPORT
                </h2>
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Okinawa Shorin-Ryu Karate-Do & Kobudo Martial Arts
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  border: '2px solid #b91c1c',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#b91c1c',
                  textTransform: 'uppercase',
                }}
              >
                Official Record
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Report Generated: {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Dojo & Month Meta Row */}
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: '#f8fafc',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Branch Dojo</span>
              <strong style={{ color: '#0f172a' }}>{dojoName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Period</span>
              <strong style={{ color: '#0f172a' }}>{monthName} {year}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Conducted Classes</span>
              <strong style={{ color: '#0f172a' }}>{totalConducted} Sessions</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Average Attendance</span>
              <strong style={{ color: '#16a34a', fontSize: '14px' }}>{overallPercentage}%</strong>
            </div>
          </div>
        </div>

        {/* Tabular Roster */}
        <div style={{ padding: '20px 28px' }}>
          <table className="master-data-table" style={{ fontSize: '12px', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Student ID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Belt Rank</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Conducted</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Present</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Absent</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Late</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Excused</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Attendance %</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700 }}>{s.memberId}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700 }}>{s.studentName}</td>
                  <td style={{ padding: '8px 10px' }}>{s.rank}</td>
                  <td style={{ textAlign: 'center', padding: '8px 10px' }}>{s.totalConducted}</td>
                  <td style={{ textAlign: 'center', padding: '8px 10px', color: '#16a34a', fontWeight: 700 }}>
                    {s.presentCount}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 10px', color: '#dc2626', fontWeight: 700 }}>
                    {s.absentCount}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 10px', color: '#ca8a04' }}>
                    {s.lateCount}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 10px', color: '#7c3aed' }}>
                    {s.excusedCount}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 800 }}>
                    {s.attendancePercentage}%
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 10px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: s.ratingColor + '20',
                        color: s.ratingColor,
                      }}
                    >
                      {s.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Block */}
          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px dashed #cbd5e1',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Verified & Audited by:</div>
              <div style={{ marginTop: '30px', fontWeight: 800, fontSize: '13px' }}>
                Sensei Branch Head
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>MASS DRAGON DOJO</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '2px solid #b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#b91c1c',
                  margin: '0 auto',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                }}
              >
                DOJO<br />SEAL
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Approved by:</div>
              <div style={{ marginTop: '30px', fontWeight: 800, fontSize: '13px' }}>
                Kyoshi B. Mathan / Grand Master
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>Chief Technical Director</div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div
          className="master-modal-footer"
          style={{
            padding: '16px 28px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <button className="master-btn-outline" onClick={onClose}>
            Close
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={downloadCsv}
              className="master-btn-outline"
              style={{ background: '#ffffff', color: '#1e40af', borderColor: '#bfdbfe' }}
            >
              📊 Download Excel (CSV)
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="master-btn-primary"
              style={{ background: '#b91c1c' }}
            >
              🖨 Print / Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
