'use client'

import { Control } from '@/lib/api'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthWrapper'
import { getExpectedEvidence } from '@/lib/evidenceMap'

interface ControlDetailDrawerProps {
  control: Control
  onClose: () => void
  onStatusUpdate?: (id: number, status: string) => void
}

export default function ControlDetailDrawer({ control, onClose, onStatusUpdate }: ControlDetailDrawerProps) {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'checklist' | 'evidence'>('overview')
  const [currentStatus, setCurrentStatus] = useState(control.status)
  const [currentPct, setCurrentPct] = useState(control.completion_percentage)
  const [updating, setUpdating] = useState(false)
  const [linkedDocs, setLinkedDocs] = useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function loadLinkedDocs() {
      setLoadingDocs(true)
      try {
        const res = await fetch('/api/v1/documents')
        const data = await res.json()
        if (Array.isArray(data)) {
          const matched = data.filter((d: any) => d.controlId === control.control_id || d.controlId === `clause-${control.control_id}`)
          setLinkedDocs(matched)
        }
      } catch (e) {
        console.error('Failed to load linked documents', e)
      } finally {
        setLoadingDocs(false)
      }
    }
    loadLinkedDocs()

    // Load checklist checked items from localStorage
    const saved = localStorage.getItem(`isms_checklist_checked_${control.control_id}`)
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      setCheckedItems({})
    }
    setCurrentPct(control.completion_percentage)
    setCurrentStatus(control.status)
  }, [control.control_id, control.completion_percentage, control.status])

  const expectedEvidence = getExpectedEvidence(control.control_id)

  const handleCheckChange = async (index: number, isChecked: boolean) => {
    const updated = {
      ...checkedItems,
      [index]: isChecked
    }
    setCheckedItems(updated)
    localStorage.setItem(`isms_checklist_checked_${control.control_id}`, JSON.stringify(updated))

    const total = control.checklists?.length || 0
    if (total > 0) {
      const checkedCount = Object.values(updated).filter(Boolean).length
      const pct = Math.round((checkedCount / total) * 100)
      setCurrentPct(pct)

      let newStatus = 'not_started'
      if (pct === 100) {
        newStatus = 'implemented'
      } else if (pct > 0) {
        newStatus = 'in_progress'
      }
      setCurrentStatus(newStatus)

      try {
        await fetch(`/api/v1/controls/${control.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completion_percentage: pct,
            status: newStatus
          })
        })
        onStatusUpdate?.(control.id, newStatus)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/v1/controls/${control.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setCurrentStatus(newStatus)
        onStatusUpdate?.(control.id, newStatus)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  const catClass = control.category?.toLowerCase().replace(/\s+/g, '') || ''
  const statusClass = control.status?.replace(/\s+/g, '_') || 'not_started'

  const reqSections = [
    { label: 'Policies', items: control.required_policies },
    { label: 'Procedures', items: control.required_procedures },
    { label: 'Standards', items: control.required_standards },
    { label: 'Records', items: control.required_records },
    { label: 'Forms', items: control.required_forms },
    { label: 'Logs', items: control.required_logs },
    { label: 'Technical Configs', items: control.required_technical_configs },
    { label: 'Training Materials', items: control.required_training_materials },
    { label: 'Agreements', items: control.required_agreements },
    { label: 'Registers', items: control.required_registers },
  ].filter((s) => s.items && s.items.length > 0)

  return (
    <>
      <div className="detail-drawer-overlay" onClick={onClose} />
      <div className="detail-drawer">
        {/* Header */}
        <div className="drawer-header">
          <div>
            <span className="control-id-badge" style={{ fontSize: '13px', marginBottom: '6px', display: 'inline-block' }}>
              {control.control_id}
            </span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '6px', lineHeight: 1.4 }}>
              {control.title}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className={`category-pill ${catClass}`}>{control.category}</span>
              <span className={`status-badge ${currentStatus.replace(/\s+/g, '_')}`}>
                {currentStatus === 'not_started' ? 'Not Started'
                  : currentStatus === 'in_progress' ? 'In Progress'
                  : 'Implemented'}
              </span>
              {control.mandatory && (
                <span className="tag indigo">Mandatory</span>
              )}
            </div>
             {/* Status Update Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Control Status:</span>
              <select
                value={currentStatus}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating || !isAdmin}
                style={{
                  border: '1.5px solid #000',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  background: !isAdmin ? '#f3f4f6' : '#fff',
                  cursor: !isAdmin ? 'not-allowed' : 'pointer',
                  outline: 'none'
                }}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="implemented">Implemented</option>
              </select>
              {updating && <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'Share Tech Mono' }}>Saving...</span>}
              {!isAdmin && <span style={{ fontSize: '9px', color: '#ef4444', fontFamily: 'Share Tech Mono', fontWeight: 'bold' }}>(READ-ONLY)</span>}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ padding: '12px 20px', borderBottom: '1.5px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontFamily: 'Share Tech Mono', fontSize: '10px' }}>
            <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Completion</span>
            <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
              {currentPct}%
            </span>
          </div>
          <div className="progress-bar-wrap" style={{ height: '6px' }}>
            <div
              className="progress-bar-fill indigo"
              style={{ width: `${currentPct}%`, background: 'var(--color-accent)' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--color-border)', padding: '0 20px' }}>
          {(['overview', 'requirements', 'checklist', 'evidence'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 14px',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'Share Tech Mono',
                textTransform: 'uppercase',
                color: activeTab === tab ? '#000000' : 'var(--color-text-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #000000' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="drawer-body">
          {activeTab === 'overview' && (
            <>
              {control.description && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Description</div>
                  <p className="drawer-text">{control.description}</p>
                </div>
              )}
              {control.objective && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Objective</div>
                  <p className="drawer-text">{control.objective}</p>
                </div>
              )}
              {control.purpose && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Purpose</div>
                  <p className="drawer-text">{control.purpose}</p>
                </div>
              )}
              {control.implementation_guidance && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Implementation Guidance</div>
                  <p className="drawer-text">{control.implementation_guidance}</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="drawer-section">
                  <div className="drawer-section-title">Responsible Role</div>
                  <p className="drawer-text">{control.responsible_role || '—'}</p>
                </div>
                <div className="drawer-section">
                  <div className="drawer-section-title">Review Frequency</div>
                  <p className="drawer-text">{control.review_frequency || '—'}</p>
                </div>
                <div className="drawer-section">
                  <div className="drawer-section-title">Maturity Level</div>
                  <p className="drawer-text">{control.maturity_level || '—'}</p>
                </div>
                <div className="drawer-section">
                  <div className="drawer-section-title">Applicability</div>
                  <p className="drawer-text">{control.applicability || '—'}</p>
                </div>
              </div>
              {control.related_controls?.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Related Controls</div>
                  <div className="tag-list">
                    {control.related_controls.map((c) => (
                      <span key={c} className="tag indigo">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {control.evidence_requirements?.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Evidence Requirements</div>
                  <ul style={{ paddingLeft: '16px', listStyle: 'disc' }}>
                    {control.evidence_requirements.map((e, i) => (
                      <li key={i} className="drawer-text" style={{ marginBottom: '4px' }}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {activeTab === 'requirements' && (
            <>
              {reqSections.length === 0 ? (
                <div className="empty-state">
                  <div className="emoji">📋</div>
                  <div className="empty-title">No requirements specified</div>
                </div>
              ) : (
                reqSections.map((sec) => (
                  <div key={sec.label} className="drawer-section">
                    <div className="drawer-section-title">{sec.label}</div>
                    <div className="tag-list">
                      {sec.items.map((item, i) => (
                        <span key={i} className="tag">{item}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'checklist' && (
            <>
              {!control.checklists?.length ? (
                <div className="empty-state">
                  <div className="emoji">✅</div>
                  <div className="empty-title">No checklist items</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {control.checklists.map((item, i) => (
                    <label
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 14px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-bg-primary)',
                      }}
                    >
                      <input
                        type="checkbox"
                        disabled={!isAdmin}
                        checked={!!checkedItems[i]}
                        onChange={(e) => handleCheckChange(i, e.target.checked)}
                        style={{ marginTop: '2px', flexShrink: 0, cursor: !isAdmin ? 'not-allowed' : 'pointer' }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Expected Evidence Guidance callout */}
              {expectedEvidence ? (
                <div style={{
                  background: '#f0fdf4', border: '1.5px solid #16a34a', padding: '12px', fontSize: '11px',
                  fontFamily: 'Inter', display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                  <div style={{ fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🎯 Required Compliance Evidence
                  </div>
                  <div>
                    <strong style={{ fontFamily: 'Share Tech Mono', textTransform: 'uppercase' }}>Expected Title:</strong> {expectedEvidence.title}
                  </div>
                  <div>
                    <strong style={{ fontFamily: 'Share Tech Mono', textTransform: 'uppercase' }}>Expected Type:</strong> {expectedEvidence.type}
                  </div>
                  <div style={{ color: '#374151', marginTop: '2px', fontStyle: 'italic' }}>
                    &ldquo;{expectedEvidence.description}&rdquo;
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f9fafb', border: '1.5px solid #d1d5db', padding: '12px', fontSize: '11px',
                  color: '#6b7280', fontStyle: 'italic'
                }}>
                  No predefined ISO 27001 evidence template for this control. You can link custom documents as needed.
                </div>
              )}

              {/* Linked Documents List */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', fontFamily: 'Share Tech Mono', marginBottom: '8px' }}>
                  Linked Evidence ({linkedDocs.length})
                </div>
                {loadingDocs ? (
                  <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono' }}>Loading...</div>
                ) : linkedDocs.length === 0 ? (
                  <div style={{
                    border: '1.5px dashed var(--color-border)', padding: '20px', textAlign: 'center',
                    color: '#6b7280', fontSize: '11px', fontFamily: 'Share Tech Mono'
                  }}>
                    No evidence documents linked yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {linkedDocs.map((doc) => (
                      <div key={doc.id} style={{
                        border: '1.5px solid var(--color-border)', padding: '10px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff'
                      }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: '10px' }}>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: '#111827' }}>{doc.title}</div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{
                              fontSize: '8px', background: '#f3f4f6', border: '1px solid #d1d5db',
                              padding: '1px 4px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase'
                            }}>{doc.status}</span>
                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer" style={{
                              color: 'var(--color-accent)', fontSize: '11px', textDecoration: 'underline',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block'
                            }}>
                              🔗 View Document
                            </a>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              if (confirm('Delete this document reference?')) {
                                await fetch(`/api/v1/documents/${doc.id}`, { method: 'DELETE' })
                                setLinkedDocs(prev => prev.filter(d => d.id !== doc.id))
                              }
                            }}
                            style={{
                              background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer',
                              fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Link Action Redirect button */}
              {isAdmin && (
                <button
                  onClick={() => {
                    window.location.href = `/documents?add=true&controlId=${control.control_id}`
                  }}
                  style={{
                    marginTop: '8px', background: '#000', color: '#fff', border: 'none',
                    padding: '8px 16px', fontSize: '11px', fontFamily: 'Share Tech Mono',
                    cursor: 'pointer', textAlign: 'center', width: '100%'
                  }}
                >
                  + Link Evidence Document 🔗
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
