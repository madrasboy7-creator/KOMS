import React, { useState } from 'react'
import type { MasterStudent } from '../masterData'
import { assetConfig } from '../../config/assets'

interface QrScannerModalProps {
  students: MasterStudent[]
  isOpen: boolean
  onClose: () => void
  onScanPass: (token: string) => { success: boolean; message: string; studentName?: string; rank?: string }
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  students,
  isOpen,
  onClose,
  onScanPass,
}) => {
  const [token, setToken] = useState(`KOMS-PASS:${students[0]?.memberId || 'KOMS001'}`)
  const [result, setResult] = useState<{ success: boolean; message: string; studentName?: string; rank?: string } | null>(null)

  if (!isOpen) return null

  function handleScan(tokenToScan?: string) {
    const t = tokenToScan || token
    const res = onScanPass(t)
    setResult(res)
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content master-scanner-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="master-modal-header">
          <div>
            <h3 className="master-modal-title">QR Pass Scanner</h3>
            <span className="master-modal-subtitle">
              Verify student digital dojo pass & record real-time check-in
            </span>
          </div>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="master-modal-body">
          {/* Simulated Camera Reticle Box */}
          <div className="master-camera-box">
            <div className="master-camera-reticle">
              <span className="corner c-tl" />
              <span className="corner c-tr" />
              <span className="corner c-bl" />
              <span className="corner c-br" />
              <div className="master-scan-laser" />
            </div>
            <p className="master-camera-hint">Align student pass QR inside frame</p>
          </div>

          {/* Quick choose student simulation */}
          <div className="master-form-field" style={{ marginTop: '16px' }}>
            <label>Quick Test (Select Student Pass):</label>
            <select
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                handleScan(e.target.value)
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={`KOMS-PASS:${s.memberId}`}>
                  {s.name} ({s.memberId} · {s.rank})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Input */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. KOMS-PASS:KOMS001"
              style={{ flex: 1, minHeight: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
            />
            <button
              type="button"
              className="master-btn-primary"
              onClick={() => handleScan()}
            >
              Scan & Verify
            </button>
          </div>

          {/* Scan Result Banner */}
          {result && (
            <div
              className={`master-scan-result-card ${result.success ? 'is-success' : 'is-error'}`}
              style={{ marginTop: '16px' }}
            >
              {result.success ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '28px', color: '#16a34a' }}>✓</div>
                  <div>
                    <strong style={{ display: 'block', color: '#15803d', fontSize: '13px' }}>
                      PASS VERIFIED · ATTENDANCE RECORDED
                    </strong>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {result.studentName}
                    </span>
                    <small style={{ display: 'block', color: '#64748b' }}>
                      {result.rank} · Active Membership
                    </small>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#b91c1c' }}>
                  <strong>✕ Pass Verification Failed</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="master-modal-footer">
          <button className="master-btn-outline" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
