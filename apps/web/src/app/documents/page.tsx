'use client'

import { useState, useEffect, Suspense } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

interface Document {
  id: number
  docType: string
  title: string
  description: string
  controlId: string
  status: string
  filePath: string // We will use this to store the Trust Portal / SharePoint link URL
  createdAt: string
}

const DOC_TYPES = [
  'Policy', 'Procedure', 'Standard', 'Guideline', 'SOP',
  'Register', 'Record', 'Form', 'Log', 'Template',
  'Training Material', 'Agreement', 'Plan', 'Report'
]

const ISO_POLICIES = [
  { title: 'Information Security Policy', type: 'Policy', control: '5.1', description: 'General rules and high-level requirements governing information security.' },
  { title: 'Access Control Policy', type: 'Policy', control: '8.2', description: 'User registration, authentication, authorization, and review guidelines.' },
  { title: 'Asset Management Procedure', type: 'Procedure', control: '5.9', description: 'Defines how information assets are identified, cataloged, owned, and discarded.' },
  { title: 'Risk Assessment Methodology', type: 'Procedure', control: '6.1.2', description: 'Criteria and steps for evaluating vulnerability likelihood and impact.' },
  { title: 'Incident Response Procedure', type: 'Procedure', control: '5.24', description: 'Step-by-step procedure to report, investigate, contain, and resolve security incidents.' },
  { title: 'Business Continuity Plan', type: 'Plan', control: '5.29', description: 'Procedures to maintain operations during an emergency or disruption.' },
  { title: 'Supplier Security Policy', type: 'Policy', control: '5.19', description: 'Information security requirements for third-party vendors and contracts.' },
  { title: 'Data Classification Guideline', type: 'Guideline', control: '5.12', description: 'Sensitivity labels and handling instructions for company records.' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    draft: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
    review: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
    approved: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    published: { bg: '#000', color: '#fff', border: '#000' },
    deprecated: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  }
  const s = map[status] || map.draft
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 8px', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase'
    }}>
      {status}
    </span>
  )
}

function DocTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    Policy: '📋', Procedure: '📝', Standard: '📐', Guideline: '📌',
    SOP: '📋', Register: '📊', Record: '📁', Form: '🗒', Log: '📒',
    Template: '📄', 'Training Material': '📚', Agreement: '🤝', Plan: '🗺', Report: '📈'
  }
  return <span style={{ fontSize: '20px' }}>{icons[type] || '📄'}</span>
}

import { getExpectedEvidence } from '@/lib/evidenceMap'

function mapEvidenceTypeToDocType(type: string): string {
  const mapping: Record<string, string> = {
    'Document': 'Policy',
    'Record': 'Record',
    'Training': 'Training Material',
    'Report': 'Report',
    'Minutes': 'Log',
    'Register': 'Register',
    'Agreement': 'Agreement',
    'Photo/Log': 'Log',
    'Log': 'Log',
    'Configuration': 'Standard'
  }
  return mapping[type] || 'Policy'
}

interface AddDocModalProps {
  onClose: () => void
  onSave: (doc: Document) => void
  initialControlId?: string
}

function AddDocModal({ onClose, onSave, initialControlId = '' }: AddDocModalProps) {
  const [form, setForm] = useState({
    title: '', description: '', docType: 'Policy', controlId: initialControlId, status: 'draft', filePath: ''
  })
  const [saving, setSaving] = useState(false)
  const [controlsList, setControlsList] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function loadOptions() {
      try {
        const [clausesRes, controlsRes] = await Promise.all([
          fetch(`/api/v1/clauses?t=${Date.now()}`),
          fetch(`/api/v1/controls?page_size=200&t=${Date.now()}`)
        ])
        const clausesData = await clausesRes.json()
        const controlsData = await controlsRes.json()

        const list: { id: string; name: string }[] = []
        if (Array.isArray(clausesData)) {
          clausesData.forEach((c: any) => {
            list.push({
              id: `clause-${c.clause_id}`,
              name: `Clause ${c.clause_id} - ${c.title}`
            })
          })
        }
        if (controlsData && Array.isArray(controlsData.items)) {
          controlsData.items.forEach((c: any) => {
            list.push({
              id: c.control_id,
              name: `Control ${c.control_id} - ${c.title}`
            })
          })
        }
        setControlsList(list)
      } catch (e) {
        console.error('Failed to load controls list', e)
      }
    }
    loadOptions()
  }, [])

  useEffect(() => {
    if (initialControlId) {
      const requirement = getExpectedEvidence(initialControlId)
      if (requirement) {
        setForm(f => ({
          ...f,
          title: requirement.title,
          description: requirement.description,
          docType: mapEvidenceTypeToDocType(requirement.type)
        }))
      }
    }
  }, [initialControlId, controlsList])

  const handleControlChange = (selectedId: string) => {
    const requirement = getExpectedEvidence(selectedId)
    setForm(f => ({
      ...f,
      controlId: selectedId,
      title: requirement ? requirement.title : f.title,
      description: requirement ? requirement.description : f.description,
      docType: requirement ? mapEvidenceTypeToDocType(requirement.type) : f.docType
    }))
  }

  const save = async () => {
    if (!form.title.trim() || !form.filePath.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const doc = await res.json()
      onSave(doc)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const selectedRequirement = getExpectedEvidence(form.controlId)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', border: '2px solid #000', width: '580px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: '24px'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Centralized Evidence Linker</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono' }}>Upload once to automatically map to DOC GEN, Evidence Map & Annex controls</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Map to Clause / Control Requirement *
            </label>
            <select
              value={form.controlId}
              onChange={e => handleControlChange(e.target.value)}
              style={{ width: '100%', border: '1.5px solid #000', padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter', background: '#fff' }}
            >
              <option value="">-- Optional: Custom / Unmapped Document --</option>
              {controlsList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Expected Evidence Guidance Callout */}
          {selectedRequirement && (
            <div style={{
              background: '#f0fdf4', border: '1.5px solid #16a34a', padding: '12px', fontSize: '11px',
              fontFamily: 'Inter', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <div style={{ fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎯 Expected Evidence Guidance
              </div>
              <div>
                <strong style={{ fontFamily: 'Share Tech Mono', textTransform: 'uppercase' }}>Expected Title:</strong> {selectedRequirement.title}
              </div>
              <div>
                <strong style={{ fontFamily: 'Share Tech Mono', textTransform: 'uppercase' }}>Expected Type:</strong> {selectedRequirement.type}
              </div>
              <div style={{ color: '#374151', marginTop: '2px', fontStyle: 'italic' }}>
                &ldquo;{selectedRequirement.description}&rdquo;
              </div>
              <div style={{ fontSize: '9px', color: '#166534', marginTop: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                💡 Fields below pre-filled to match this requirement.
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Document Title *
            </label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Data Retention Policy"
              style={{ width: '100%', border: '1.5px solid #000', padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Trust Portal / SharePoint Document Link URL *
            </label>
            <input
              value={form.filePath}
              onChange={e => setForm(f => ({ ...f, filePath: e.target.value }))}
              placeholder="e.g. https://trust.company.com/documents/data-retention"
              style={{ width: '100%', border: '1.5px solid #000', padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief purpose of this document link..."
              rows={2}
              style={{ width: '100%', border: '1.5px solid #000', padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Type</label>
              <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter', background: '#fff' }}>
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter', background: '#fff' }}>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={onClose} style={{ background: 'none', border: '1.5px solid #000', padding: '8px 20px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}>Cancel</button>
            <button onClick={save} disabled={saving || !form.title.trim() || !form.filePath.trim()} style={{
              background: saving || !form.title.trim() || !form.filePath.trim() ? '#9ca3af' : '#000', color: '#fff',
              border: 'none', padding: '8px 20px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer'
            }}>
              {saving ? 'Linking...' : 'Link Document 🔗'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DocDetailModalProps {
  doc: Document
  onClose: () => void
  onUpdateStatus: (id: number, status: string) => void
  onUpdateLink: (id: number, link: string) => void
  onDelete: (id: number) => void
}

function DocDetailModal({ doc, onClose, onUpdateStatus, onUpdateLink, onDelete }: DocDetailModalProps) {
  const [linkInput, setLinkInput] = useState(doc.filePath || '')
  const [editingLink, setEditingLink] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveLink = async () => {
    if (!linkInput.trim()) return
    await fetch(`/api/v1/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: linkInput })
    })
    onUpdateLink(doc.id, linkInput)
    setEditingLink(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', border: '2px solid #000', width: '560px', maxWidth: '95vw', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DocTypeIcon type={doc.docType} />
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{doc.title}</div>
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'Share Tech Mono', marginTop: '4px' }}>
              {doc.docType} {doc.controlId ? `· Control ${doc.controlId}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {doc.description && (
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: 'var(--color-accent)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Description</span>
              <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.4, margin: 0 }}>{doc.description}</p>
            </div>
          )}

          <div>
            <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: 'var(--color-accent)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Trust Portal / SharePoint Document Link</span>
            {editingLink ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  style={{ flex: 1, border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
                />
                <button onClick={handleSaveLink} style={{ background: '#000', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '10px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}>Save</button>
                <button onClick={() => { setEditingLink(false); setLinkInput(doc.filePath) }} style={{ background: 'none', border: '1.5px solid #000', padding: '6px 12px', fontSize: '10px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: '12px' }}>
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: '12px', textDecoration: 'underline', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🔗 {doc.filePath}
                  </a>
                </div>
                <button onClick={() => setEditingLink(true)} style={{ background: '#fff', border: '1px solid #000', padding: '4px 8px', fontSize: '10px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}>
                  Change Link
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1.5px dashed var(--color-border)', paddingTop: '14px' }}>
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: 'var(--color-accent)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Document Status</span>
              <select
                value={doc.status}
                onChange={e => onUpdateStatus(doc.id, e.target.value)}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter', background: '#fff', cursor: 'pointer' }}
              >
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: 'var(--color-accent)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Audit Readiness</span>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: doc.status === 'published' ? '#166534' : doc.status === 'approved' ? '#166534' : '#92400e'
              }}>
                {doc.status === 'published' ? '🟢 Ready for Certification' : '🟡 In Review Process'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #000', paddingTop: '12px', marginTop: '8px' }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: '#fee2e2', color: '#b91c1c', border: '1.5px solid #b91c1c', padding: '8px 20px', fontSize: '11px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}
          >
            Delete Link 🗑
          </button>
          <button onClick={onClose} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 20px', fontSize: '11px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      </div>

      {/* Custom App Confirm Dialog Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: '#fff', border: '2.5px solid #000', width: '380px', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '4px 4px 0px #000'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ Confirm Deletion
            </div>
            <div style={{ fontSize: '11px', color: '#374151', lineHeight: 1.4 }}>
              Are you sure you want to delete this document link? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'none', border: '1.5px solid #000', padding: '6px 14px', fontSize: '10px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch(`/api/v1/documents/${doc.id}`, { method: 'DELETE' })
                    onDelete(doc.id)
                    onClose()
                  } catch (e) {
                    console.error(e)
                  }
                }}
                style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '6px 14px', fontSize: '10px', fontFamily: 'Share Tech Mono', cursor: 'pointer' }}
              >
                Delete Link 🗑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useSearchParams } from 'next/navigation'

function DocumentsContent() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const searchParams = useSearchParams()
  const addParam = searchParams.get('add') === 'true'
  const controlIdParam = searchParams.get('controlId') || ''

  useEffect(() => {
    if (addParam) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [addParam])

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/documents?t=${Date.now()}`)
      const data = await res.json()
      setDocs(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [])

  const handleCloseModal = () => {
    setShowModal(false)
    // Clear URL parameters without page reload
    window.history.replaceState({}, '', window.location.pathname)
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch(`/api/v1/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setDocs(d => d.map(doc => doc.id === id ? { ...doc, status } : doc))
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc(prev => prev ? { ...prev, status } : null)
    }
  }

  const handleUpdateLink = (id: number, link: string) => {
    setDocs(d => d.map(doc => doc.id === id ? { ...doc, filePath: link } : doc))
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc(prev => prev ? { ...prev, filePath: link } : null)
    }
  }

  const handleDelete = (id: number) => {
    setDocs(d => d.filter(doc => doc.id !== id))
    setSelectedDoc(null)
  }

  const filtered = docs.filter(d => {
    if (filterType && d.docType !== filterType) return false
    if (filterStatus && d.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const titleMatch = d.title?.toLowerCase().includes(q)
      const descMatch = d.description?.toLowerCase().includes(q)
      const controlMatch = d.controlId?.toLowerCase().includes(q)
      return titleMatch || descMatch || controlMatch
    }
    return true
  })

  const stats = {
    total: docs.length,
    approved: docs.filter(d => d.status === 'approved' || d.status === 'published').length,
    draft: docs.filter(d => d.status === 'draft').length,
    review: docs.filter(d => d.status === 'review').length,
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Document Library" />
        <main className="page-body">
          <div className="page-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="page-title">ISMS Document Library</h2>
                <p className="page-desc">
                  Link mandatory and recommended documented information required by ISO/IEC 27001:2022 directly from your Trust Portal or SharePoint.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: '#000', color: '#fff', border: 'none',
                  padding: '10px 18px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                + Link Document
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Linked', value: stats.total, color: '#1e40af', bg: '#dbeafe' },
              { label: 'Approved/Published', value: stats.approved, color: '#166534', bg: '#dcfce7' },
              { label: 'Under Review', value: stats.review, color: '#92400e', bg: '#fef3c7' },
              { label: 'Draft Links', value: stats.draft, color: '#374151', bg: '#f3f4f6' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}`, padding: '14px 16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Share Tech Mono', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: s.color, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by title, description or control..."
              style={{ border: '1.5px solid #000', padding: '6px 12px', fontSize: '11px', fontFamily: 'Inter', width: '250px', outline: 'none' }}
            />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}>
              <option value="">All Types</option>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}>
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
            {(filterType || filterStatus || searchQuery) && (
              <button onClick={() => { setFilterType(''); setFilterStatus(''); setSearchQuery('') }}
                style={{ border: '1.5px solid #000', padding: '6px 12px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff', cursor: 'pointer' }}>
                ✕ Clear
              </button>
            )}
            <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono', marginLeft: 'auto' }}>
              {filtered.length} document{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Document Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '120px' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div className="emoji">🔗</div>
              <div className="empty-title">
                {docs.length === 0 ? 'No Documents Linked' : 'No Documents Match Filters'}
              </div>
              <div className="empty-desc">
                {docs.length === 0
                  ? 'Link your first ISO 27001 document from standard templates or link a custom URL.'
                  : 'Try adjusting your filters.'}
              </div>
              {docs.length === 0 && (
                <button onClick={() => setShowModal(true)} style={{
                  marginTop: '16px', background: '#000', color: '#fff', border: 'none',
                  padding: '10px 20px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer'
                }}>+ Link First Document</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {filtered.map(doc => (
                <div key={doc.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
                  <div style={{
                    height: '3px',
                    background: doc.status === 'published' ? '#000' : doc.status === 'approved' ? '#166534' : doc.status === 'review' ? '#92400e' : '#9ca3af'
                  }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <DocTypeIcon type={doc.docType} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#6b7280', textTransform: 'uppercase' }}>
                          {doc.docType}{doc.controlId ? ` · Control ${doc.controlId}` : ''}
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                    {doc.description && (
                      <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.4, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {doc.description}
                      </p>
                    )}
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-accent)', fontWeight: 600, flex: 1, marginRight: '8px' }}>
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                        >
                          🔗 {doc.filePath}
                        </a>
                      </div>
                      <span style={{ fontSize: '8px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: '#888', flexShrink: 0 }}>
                        Details
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      {showModal && (
        <AddDocModal
          initialControlId={controlIdParam}
          onClose={handleCloseModal}
          onSave={doc => { setDocs(d => [doc, ...d]); }}
        />
      )}
      {selectedDoc && (
        <DocDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateLink={handleUpdateLink}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header title="Document Library" />
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Share Tech Mono' }}>
            LOADING DOCUMENT PORTAL...
          </div>
        </div>
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  )
}
