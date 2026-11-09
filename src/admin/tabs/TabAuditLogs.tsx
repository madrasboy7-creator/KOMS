import React, { useState } from 'react'
import { komsStore } from '../../services/komsStore'
import type { SystemAuditLog } from '../../models/koms'

interface TabAuditLogsProps {
  role?: string
  userSession?: any
}

export const TabAuditLogs: React.FC<TabAuditLogsProps> = ({ role, userSession }) => {
  const isGrandMaster = role === 'grandmaster' || role === 'admin'
  const currentDojoId = userSession?.assignedDojos?.[0] || 'dojo-ranganagar'

  const [logs] = useState<SystemAuditLog[]>(() => komsStore.getSystemAuditLogs(isGrandMaster ? undefined : currentDojoId))
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'ALL' && log.entityType !== filterType) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchAction = log.action.toLowerCase().includes(q)
      const matchDetails = log.details.toLowerCase().includes(q)
      const matchUser = log.userName.toLowerCase().includes(q)
      const matchReason = log.reason?.toLowerCase().includes(q)
      return matchAction || matchDetails || matchUser || matchReason
    }
    return true
  })

  function exportCsv() {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details', 'Reason']
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `koms-audit-log-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', letterSpacing: '0.05em' }}>
            IMMUTABLE SECURITY LEDGER
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
            System Audit & Governance Logs
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Every administrative approval, dojo status change, attendance correction, fee payment, and delegation is securely recorded.
          </p>
        </div>

        <button
          onClick={exportCsv}
          style={{
            padding: '0.55rem 1.15rem',
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>📥</span> Export Audit Log (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
          {(['ALL', 'DOJO', 'STUDENT', 'ATTENDANCE', 'FEE', 'SENIOR', 'TOURNAMENT', 'GRADING'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: filterType === cat ? '#fff' : 'transparent',
                color: filterType === cat ? '#0f172a' : '#64748b',
                boxShadow: filterType === cat ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search actions, user, details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '0.85rem',
            minWidth: '260px',
            outline: 'none',
          }}
        />
      </div>

      {/* Audit Log Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            No audit logs found for the selected filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Entity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Details</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reason / Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{log.userName}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#334155', textTransform: 'uppercase' }}>
                        {log.userRole}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          background: log.entityType === 'DOJO' ? '#fef3c7' : log.entityType === 'FEE' ? '#dcfce7' : '#e0e7ff',
                          color: log.entityType === 'DOJO' ? '#b45309' : log.entityType === 'FEE' ? '#15803d' : '#3730a3',
                        }}
                      >
                        {log.entityType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{log.details}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontStyle: log.reason ? 'normal' : 'italic' }}>
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

