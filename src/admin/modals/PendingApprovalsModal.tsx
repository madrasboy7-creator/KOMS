import React from 'react'
import type { RegistrationEnquiry } from '../../services/komsStore'

interface PendingApprovalsModalProps {
  enquiries: RegistrationEnquiry[]
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({
  enquiries,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null

  const pendingList = enquiries.filter((e) => e.status === 'pending_review')

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content master-approvals-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="master-modal-header">
          <div>
            <h3 className="master-modal-title">Pending Student Admissions</h3>
            <span className="master-modal-subtitle">
              Review and approve prospective student applications
            </span>
          </div>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="master-modal-body">
          {pendingList.map((enq) => (
            <div key={enq.id} className="master-approval-card">
              <div className="master-approval-card-head">
                <div>
                  <strong className="master-approval-name">{enq.studentName}</strong>
                  <span className="master-approval-id">{enq.id}</span>
                </div>
                <span className="master-status-pill is-pending">Pending Review</span>
              </div>

              <div className="master-approval-grid">
                <div>
                  <small>Age / DOB:</small>
                  <span>{enq.age} ({enq.dateOfBirth})</span>
                </div>
                <div>
                  <small>Gender / Blood:</small>
                  <span>{enq.gender} · {enq.bloodGroup}</span>
                </div>
                <div>
                  <small>Guardian:</small>
                  <span>{enq.fatherName || enq.motherName || 'Guardian'}</span>
                </div>
                <div>
                  <small>Phone:</small>
                  <span>{enq.guardianPhone}</span>
                </div>
                <div>
                  <small>Dojo Branch:</small>
                  <span>{enq.dojoName}</span>
                </div>
                <div>
                  <small>Training Category:</small>
                  <span>{enq.trainingCategory}</span>
                </div>
              </div>

              <div className="master-approval-actions">
                <button
                  className="master-btn-reject"
                  onClick={() => onReject(enq.id)}
                >
                  Reject
                </button>
                <button
                  className="master-btn-primary"
                  onClick={() => onApprove(enq.id)}
                >
                  ✓ Approve Admission
                </button>
              </div>
            </div>
          ))}

          {pendingList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
              <strong>All caught up!</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                There are no pending student applications awaiting approval.
              </p>
            </div>
          )}
        </div>

        <div className="master-modal-footer">
          <button className="master-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
