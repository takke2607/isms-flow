'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useAuth } from '@/components/layout/AuthWrapper'

interface Risk {
  id: number
  riskId: string
  title: string
  description: string
  category: string
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: string
  treatment: string
  status: string
  owner: string
  relatedControls?: string[]
  metadata?: Record<string, string>
  createdAt: string
}

const CATEGORIES = [
  'Information Security', 'Physical Security', 'Access Control',
  'Third Party', 'Business Continuity', 'Compliance', 'Human Resources', 'Technical'
]

const TREATMENTS = ['mitigate', 'accept', 'transfer', 'avoid']

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    High: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    Medium: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    Low: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  }
  const c = colors[level] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '2px 8px', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono',
      textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      {level}
    </span>
  )
}

interface RiskDetailDrawerProps {
  risk: Risk | null
  onClose: () => void
}

function RiskDetailDrawer({ risk, onClose }: RiskDetailDrawerProps) {
  if (!risk) return null

  const getVal = (key: string, fallback: string = '—') => {
    return risk.metadata?.[key] || fallback
  }

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900 }} 
        onClick={onClose} 
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '580px', maxWidth: '100vw',
        background: '#fff', borderLeft: '3px solid #000', zIndex: 1000, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', fontFamily: 'Inter'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '2.5px solid #000', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'Inter', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {risk.riskId} Details
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 0 0', color: '#111827' }}>
              {risk.title}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px' }}>✕</button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Risk Identification */}
          <div>
            <h4 style={{ fontSize: '11px', fontFamily: 'Inter', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '10px', color: '#111827', fontWeight: 800, letterSpacing: '0.5px' }}>
              01. Risk Identification
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Department / Function</strong>
                <span style={{ color: '#1f2937' }}>{getVal('department', risk.owner)}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Risk Context / Category</strong>
                <span style={{ color: '#1f2937' }}>{getVal('context', risk.category)}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Threat Scenario</strong>
                <span style={{ color: '#1f2937' }}>{getVal('threat', risk.title)}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Vulnerability / Cause</strong>
                <span style={{ color: '#1f2937' }}>{getVal('vulnerability', '—')}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Consequence / Impact</strong>
                <span style={{ color: '#1f2937' }}>{getVal('consequence', '—')}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Impact Analysis */}
          <div>
            <h4 style={{ fontSize: '11px', fontFamily: 'Inter', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '10px', color: '#111827', fontWeight: 800, letterSpacing: '0.5px' }}>
              02. Risk Assessment & Analysis
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '12px', marginBottom: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Impact on Org</strong>
                <span style={{ color: '#1f2937' }}>{getVal('impactOrganization')}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Confidentiality</strong>
                <span style={{ color: '#1f2937' }}>{getVal('impactConfidentiality')}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Integrity</strong>
                <span style={{ color: '#1f2937' }}>{getVal('impactIntegrity')}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Availability</strong>
                <span style={{ color: '#1f2937' }}>{getVal('impactAvailability')}</span>
              </div>
            </div>
            
            <div style={{ background: '#f9fafb', border: '1.5px solid #000', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Likelihood Probability</strong>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1f2937' }}>{getVal('likelihoodProbability')} ({risk.likelihood})</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Overall Impact Value</strong>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1f2937' }}>{getVal('overallImpact', String(risk.impact))}</span>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>Risk Score: {risk.riskScore}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, display: 'flex', gap: '4px', alignItems: 'center' }}>Risk Level: <RiskBadge level={risk.riskLevel} /></span>
              </div>
            </div>
          </div>

          {/* Section 3: Risk Treatment */}
          <div>
            <h4 style={{ fontSize: '11px', fontFamily: 'Inter', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '10px', color: '#111827', fontWeight: 800, letterSpacing: '0.5px' }}>
              03. Risk Treatment Plan
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Treatment Option / Decision</strong>
                <span style={{ color: '#1f2937' }}>{getVal('treatmentOption', risk.treatment)} (Priority: {getVal('riskTreatmentPriority', '—')})</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Mitigation Plan / Actions</strong>
                <p style={{ margin: '4px 0 0 0', background: '#fef3c7', padding: '8px 10px', border: '1px solid #fcd34d', borderRadius: '2px', fontStyle: 'italic', color: '#1f2937' }}>
                  {getVal('mitigationPlan', '—')}
                </p>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Mitigating Control(s) from Annex A</strong>
                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                  {risk.relatedControls && risk.relatedControls.length > 0 ? risk.relatedControls.join(', ') : getVal('correspondingControl')}
                </span>
              </div>
              {getVal('opportunity') && getVal('opportunity') !== 'None' && (
                <div>
                  <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Opportunity Identified</strong>
                  <span style={{ color: '#1f2937' }}>{getVal('opportunity')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Implementation & Review */}
          <div>
            <h4 style={{ fontSize: '11px', fontFamily: 'Inter', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '10px', color: '#111827', fontWeight: 800, letterSpacing: '0.5px' }}>
              04. Action Implementation & Review
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Risk Owner</strong>
                <span style={{ color: '#1f2937' }}>{getVal('owner', risk.owner)}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Implementation Responsibility</strong>
                <span style={{ color: '#1f2937' }}>{getVal('responsibility', '—')}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Target Completion Date</strong>
                <span style={{ color: '#1f2937' }}>{getVal('targetDate', '—')}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Status</strong>
                <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#1f2937' }}>{risk.status}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Will this mitigate the Risk completely?</strong>
                <span style={{ color: '#1f2937' }}>{getVal('mitigateCompletely', '—')}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>Further Action Plan</strong>
                <span style={{ color: '#1f2937' }}>{getVal('furtherAction', '—')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}



const IMPACT_ORG_OPTIONS = [
  { text: 'One Function impacted', val: 1 },
  { text: 'One Person or Process impacted', val: 1 },
  { text: 'Small Financial Loss', val: 1 },
  { text: 'Some Downtime or Outage in Service', val: 1 },
  { text: 'Impact on Client Service or Contract', val: 2 },
  { text: 'Considerable Financial Loss occurred', val: 2 },
  { text: 'Breach of Contract or SLA', val: 2 },
  { text: 'Minor Incident', val: 2 },
  { text: 'Minor impact on Company Brand, Image, Goodwill', val: 2 },
  { text: 'Breach of Internal Policy or Process or Code', val: 2 },
  { text: 'Impact on Multiple Functions or Processes', val: 2 },
  { text: 'Considerable impact on Service Delivery', val: 2 },
  { text: 'Impact on Supplier or Service Provider', val: 2 },
  { text: 'Impact on Entire Organization', val: 3 },
  { text: 'Impact on entire Product or Service Delivery', val: 3 },
  { text: 'High or Major Financial Loss', val: 3 },
  { text: 'Breach of Legal or Statutory or Regulatory compliance', val: 3 },
  { text: 'Major Downtime or Outage', val: 3 },
  { text: 'Personal Data or PII Breach', val: 3 },
]

const LIKELIHOOD_OPTIONS = [
  { text: 'No possibility of happening', val: 1 },
  { text: 'Not happened in past - not likely to happen in future', val: 1 },
  { text: 'Possible - as happened with others', val: 2 },
  { text: 'Has happened in past - some times', val: 2 },
  { text: 'Likely to happen', val: 2 },
  { text: 'Not happened in past - but may happen in future', val: 2 },
  { text: 'Almost certain to happen', val: 3 },
  { text: 'Happens every now and then', val: 3 },
  { text: 'Has happened in past - many times', val: 3 },
]

const PRIORITY_OPTIONS = [
  'Asset related Risk - Mitigate within 30 Days',
  'Client related Risk - Mitigate within 7 Days',
  'Compliance related Risk - Mitigate within 7 Days',
  'Continuity related Risk - Mitigate within 60 Days',
  'Service related Risk - Mitigate as per SLA',
  'System or Technical Vulnerability - Mitigate in 7 Days',
  'Process related Risk - Mitigate within 30 Days',
  'User or Person related Risk - Mitigate within 30 Days',
  'Financial Risk - Mitigate within 15 Days',
  'Partner related Risk - Mitigate within 30 Days',
  'Not Applicable as Risk is within Acceptance'
]

const TREATMENT_OPTIONS = [
  'Not Applicable as Risk is within Acceptance',
  'Change the Likelihood',
  'Change the Consequence',
  'Remove the Risk Source',
  'Share the risk',
  'Take or increase the risk in order to pursue an opportunity'
]

const MITIGATE_COMPLETELY_OPTIONS = [
  'Maybe or Not Sure',
  'No - some possibility of risk remains',
  'Will have to monitor the effectiveness',
  'Yes - Completely',
  'Not Applicable as Risk is Acceptable'
]

const FURTHER_ACTION_OPTIONS = [
  'Not Applicable as Risk is within Acceptance Level',
  'Add Action and Control to mitigate the Risk',
  'Monitor the effectiveness of Action',
  'No Action desired as Risk is mitigated',
  'Retain the Risk with Management Approval'
]

interface AddRiskModalProps {
  onClose: () => void
  onSave: (risk: Risk) => void
}

function AddRiskModal({ onClose, onSave }: AddRiskModalProps) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Information Security',
    owner: '', relatedControlsStr: '',
    impactOrg: IMPACT_ORG_OPTIONS[0].text,
    confidentiality: false, integrity: false, availability: false,
    likelihoodText: LIKELIHOOD_OPTIONS[0].text,
    priority: PRIORITY_OPTIONS[0],
    treatmentOption: TREATMENT_OPTIONS[0],
    opportunity: 'None',
    mitigationPlan: '',
    responsibility: '',
    targetDate: '',
    status: 'open',
    mitigateCompletely: MITIGATE_COMPLETELY_OPTIONS[0],
    furtherAction: FURTHER_ACTION_OPTIONS[0]
  })
  const [saving, setSaving] = useState(false)
  const [availableControls, setAvailableControls] = useState<{ controlId: string, title: string }[]>([])

  useEffect(() => {
    const loadControls = async () => {
      try {
        const res = await fetch('/api/v1/controls?page_size=120')
        const data = await res.json()
        if (data && Array.isArray(data.items)) {
          setAvailableControls(data.items.map((i: any) => ({ controlId: i.control_id, title: i.title })))
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadControls()
  }, [])

  const parts = form.relatedControlsStr.split(',')
  const lastPart = parts[parts.length - 1]
  const activeToken = lastPart.trim()

  const suggestions = useMemo(() => {
    if (!activeToken) return []
    return availableControls.filter(c => {
      const cleanedId = c.controlId.toLowerCase()
      const isAlreadyAdded = parts.slice(0, -1).map(p => p.trim().toLowerCase()).includes(cleanedId)
      if (isAlreadyAdded) return false

      const tokenLower = activeToken.toLowerCase()
      return cleanedId.includes(tokenLower) || c.title.toLowerCase().includes(tokenLower)
    }).slice(0, 5)
  }, [activeToken, availableControls, parts])

  const selectSuggestion = (ctrlId: string) => {
    const nextParts = [...parts.slice(0, -1), ctrlId]
    setForm(f => ({ ...f, relatedControlsStr: nextParts.join(', ') + ', ' }))
  }

  // RATP Dynamic calculation
  const orgImpactObj = IMPACT_ORG_OPTIONS.find(o => o.text === form.impactOrg) || IMPACT_ORG_OPTIONS[0]
  const orgValue = orgImpactObj.val
  const cVal = form.confidentiality ? 1 : 0
  const iVal = form.integrity ? 1 : 0
  const aVal = form.availability ? 1 : 0
  const overallImpact = (cVal + iVal + aVal) * orgValue

  const likelihoodObj = LIKELIHOOD_OPTIONS.find(o => o.text === form.likelihoodText) || LIKELIHOOD_OPTIONS[0]
  const likelihoodValue = likelihoodObj.val

  const score = likelihoodValue * overallImpact
  const level = score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low'
  const decision = level === 'Low' ? 'Acceptable' : 'Not Acceptable'

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const ctrlArray = form.relatedControlsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const metadata = {
      srNo: '',
      additionDate: new Date().toLocaleDateString(),
      department: form.category,
      context: form.category,
      threat: form.title,
      vulnerability: form.description,
      consequence: '—',
      impactOrganization: form.impactOrg,
      impactConfidentiality: form.confidentiality ? 'YES' : 'NO',
      impactIntegrity: form.integrity ? 'YES' : 'NO',
      impactAvailability: form.availability ? 'YES' : 'NO',
      overallImpact: String(overallImpact),
      likelihoodProbability: form.likelihoodText,
      probabilityValue: likelihoodValue === 3 ? 'High' : likelihoodValue === 2 ? 'Medium' : 'Low',
      riskLevel: level,
      riskDecision: decision,
      riskTreatmentPriority: form.priority,
      treatmentOption: form.treatmentOption,
      opportunity: form.opportunity,
      mitigationPlan: form.mitigationPlan,
      correspondingControl: form.relatedControlsStr,
      owner: form.owner,
      responsibility: form.responsibility,
      targetDate: form.targetDate,
      status: form.status,
      mitigateCompletely: form.mitigateCompletely,
      furtherAction: form.furtherAction
    }

    try {
      const res = await fetch('/api/v1/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: `Vulnerability: ${form.description}`,
          category: form.category,
          likelihood: likelihoodValue,
          impact: overallImpact,
          treatment: form.treatmentOption,
          status: form.status,
          owner: form.owner,
          relatedControls: ctrlArray,
          metadata
        })
      })
      const data = await res.json()
      onSave(data)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', border: '2px solid #000', width: '780px', maxWidth: '95vw', maxHeight: '90vh',
        overflow: 'auto', padding: '24px'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Add New RATP Risk</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono' }}>Clause 6.1.2 — Risk Assessment & Treatment Plan</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
          {/* Left Column: Risk Identification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '2px', margin: 0, fontWeight: 700 }}>
              01. Identification & Controls
            </h4>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Risk Title / Threat Scenario *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Threat situation..."
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Vulnerability / Cause
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Vulnerability causing risk..."
                rows={2}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter', resize: 'vertical' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Mitigating Controls (e.g. 5.1, 8.2)
              </label>
              <input
                value={form.relatedControlsStr}
                onChange={e => setForm(f => ({ ...f, relatedControlsStr: e.target.value }))}
                placeholder="Auto-suggest as you type..."
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
              />
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 10,
                  background: '#fff', border: '1.5px solid #000', marginTop: '2px',
                  boxShadow: '3px 3px 0px #000', maxHeight: '120px', overflowY: 'auto'
                }}>
                  {suggestions.map(s => (
                    <div
                      key={s.controlId}
                      onClick={() => selectSuggestion(s.controlId)}
                      style={{ padding: '6px 10px', fontSize: '11px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <strong>{s.controlId}</strong> - {s.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Risk Context / Category
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Risk Owner
                </label>
                <input
                  value={form.owner}
                  onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  placeholder="e.g. Admin"
                  style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '2px', margin: '10px 0 0 0', fontWeight: 700 }}>
              03. Assessment Calculator
            </h4>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Impact on Organization
              </label>
              <select
                value={form.impactOrg}
                onChange={e => setForm(f => ({ ...f, impactOrg: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
              >
                {IMPACT_ORG_OPTIONS.map(o => <option key={o.text} value={o.text}>{o.text} (Value: {o.val})</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <strong style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase' }}>CIA Impact:</strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.confidentiality} onChange={e => setForm(f => ({ ...f, confidentiality: e.target.checked }))} /> Confidentiality
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.integrity} onChange={e => setForm(f => ({ ...f, integrity: e.target.checked }))} /> Integrity
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.checked }))} /> Availability
              </label>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Likelihood or Probability
              </label>
              <select
                value={form.likelihoodText}
                onChange={e => setForm(f => ({ ...f, likelihoodText: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
              >
                {LIKELIHOOD_OPTIONS.map(o => <option key={o.text} value={o.text}>{o.text} (Value: {o.val})</option>)}
              </select>
            </div>

            <div style={{ background: '#f9fafb', border: '1.5px solid #000', padding: '10px', fontSize: '11px', fontFamily: 'Share Tech Mono' }}>
              <div>Overall Impact Value: <strong>{overallImpact}</strong> <span style={{ color: '#6b7280' }}>((C+I+A) x OrgValue)</span></div>
              <div>Likelihood Value: <strong>{likelihoodValue}</strong></div>
              <div>Risk Score: <strong>{score}</strong> | Level: <strong style={{ color: level === 'High' ? '#b91c1c' : level === 'Medium' ? '#92400e' : '#166534' }}>{level.toUpperCase()}</strong></div>
              <div>Acceptance Status: <strong>{decision.toUpperCase()}</strong></div>
            </div>
          </div>

          {/* Right Column: Treatment & Action Plans */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '2px', margin: 0, fontWeight: 700 }}>
              02. Risk Treatment Plan
            </h4>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Risk Treatment Priority
              </label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
              >
                {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Treatment Option
              </label>
              <select
                value={form.treatmentOption}
                onChange={e => setForm(f => ({ ...f, treatmentOption: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
              >
                {TREATMENT_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Mitigation Plan / Actions
              </label>
              <textarea
                value={form.mitigationPlan}
                onChange={e => setForm(f => ({ ...f, mitigationPlan: e.target.value }))}
                placeholder="Mitigation actions..."
                rows={2}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Responsibility
                </label>
                <input
                  value={form.responsibility}
                  onChange={e => setForm(f => ({ ...f, responsibility: e.target.value }))}
                  placeholder="Responsibility for action..."
                  style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid #000', padding: '5px 8px', fontSize: '12px', fontFamily: 'Inter' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Opportunity (if any)
              </label>
              <input
                value={form.opportunity}
                onChange={e => setForm(f => ({ ...f, opportunity: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
              />
            </div>

            <h4 style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '2px', margin: '10px 0 0 0', fontWeight: 700 }}>
              04. Re-Evaluation & Review
            </h4>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Will the Action mitigate the Risk completely?
              </label>
              <select
                value={form.mitigateCompletely}
                onChange={e => setForm(f => ({ ...f, mitigateCompletely: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
              >
                {MITIGATE_COMPLETELY_OPTIONS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Further Action on the Risk
              </label>
              <select
                value={form.furtherAction}
                onChange={e => setForm(f => ({ ...f, furtherAction: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '11px', fontFamily: 'Inter' }}
              >
                {FURTHER_ACTION_OPTIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Risk Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter' }}
                >
                  <option value="open">Open</option>
                  <option value="in_treatment">In Treatment</option>
                  <option value="closed">Closed</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end', borderTop: '2px solid #000', paddingTop: '16px' }}>
          <button onClick={onClose} style={{
            background: 'none', border: '1.5px solid #000', padding: '8px 20px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={save} disabled={saving || !form.title.trim()} style={{
            background: saving || !form.title.trim() ? '#9ca3af' : '#000', color: '#fff',
            border: 'none', padding: '8px 20px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer'
          }}>
            {saving ? 'Saving...' : 'Add Risk →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RisksPage() {
  const { isAdmin } = useAuth()
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeRisk, setActiveRisk] = useState<Risk | null>(null)
  const [filterLevel, setFilterLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isms_filter_risk_level') || ''
    }
    return ''
  })
  const [filterStatus, setFilterStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isms_filter_risk_status') || ''
    }
    return ''
  })

  useEffect(() => {
    sessionStorage.setItem('isms_filter_risk_level', filterLevel)
  }, [filterLevel])

  useEffect(() => {
    sessionStorage.setItem('isms_filter_risk_status', filterStatus)
  }, [filterStatus])

  const fetchRisks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/risks')
      const data = await res.json()
      setRisks(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRisks() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this risk?')) return
    await fetch(`/api/v1/risks/${id}`, { method: 'DELETE' })
    setRisks(r => r.filter(x => x.id !== id))
  }

  const filtered = risks.filter(r => {
    if (filterLevel && r.riskLevel !== filterLevel) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  const stats = {
    high: risks.filter(r => r.riskLevel === 'High').length,
    medium: risks.filter(r => r.riskLevel === 'Medium').length,
    low: risks.filter(r => r.riskLevel === 'Low').length,
    open: risks.filter(r => r.status === 'open').length,
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Risk Register" />
        <main className="page-body">
          <div className="page-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="page-title">Risk Register (Clause 6.1.2)</h2>
                <p className="page-desc">
                  Identify, evaluate, and treat information security risks. All risks must be tracked with likelihood, impact, and treatment plans.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: '#000', color: '#fff', border: 'none',
                    padding: '10px 18px', fontSize: '12px', fontFamily: 'Share Tech Mono',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                  }}
                >
                  + Add Risk
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'High Risks', value: stats.high, color: '#b91c1c', bg: '#fee2e2' },
              { label: 'Medium Risks', value: stats.medium, color: '#92400e', bg: '#fef3c7' },
              { label: 'Low Risks', value: stats.low, color: '#166534', bg: '#dcfce7' },
              { label: 'Open Risks', value: stats.open, color: '#1e40af', bg: '#dbeafe' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}`, padding: '14px 16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Share Tech Mono', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: s.color, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}
            >
              <option value="">All Risk Levels</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_treatment">In Treatment</option>
              <option value="closed">Closed</option>
              <option value="accepted">Accepted</option>
            </select>
            {(filterLevel || filterStatus) && (
              <button onClick={() => { setFilterLevel(''); setFilterStatus('') }}
                style={{ border: '1.5px solid #000', padding: '6px 12px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff', cursor: 'pointer' }}>
                ✕ Clear
              </button>
            )}
            <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono', marginLeft: 'auto' }}>
              {filtered.length} risk{filtered.length !== 1 ? 's' : ''} shown
            </span>
          </div>

          {/* Risk Table */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Share Tech Mono' }}>
                Loading risks...
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <div className="emoji">⚠</div>
                <div className="empty-title">No Risks Found</div>
                <div className="empty-desc">
                  {risks.length === 0
                    ? 'Begin by identifying security risks. Click "+ Add Risk" to log your first entry.'
                    : 'No risks match your current filters.'}
                </div>
                {risks.length === 0 && isAdmin && (
                  <button onClick={() => setShowModal(true)} style={{
                    marginTop: '16px', background: '#000', color: '#fff', border: 'none',
                    padding: '10px 20px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer'
                  }}>+ Add First Risk</button>
                )}
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '70px 2fr 1.2fr 50px 70px 80px 80px 40px',
                  gap: '8px', padding: '10px 16px', borderBottom: '2px solid #000',
                  background: '#f9fafb', fontSize: '10px', fontFamily: 'Share Tech Mono',
                  fontWeight: 700, textTransform: 'uppercase', color: '#374151'
                }}>
                  <span>Risk ID</span>
                  <span>Title</span>
                  <span>Category</span>
                  <span>Score</span>
                  <span>Level</span>
                  <span>Treatment</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {filtered.map(r => (
                  <div key={r.id} id={`risk-${r.riskId}`}
                    onClick={() => setActiveRisk(r)}
                    style={{
                      display: 'grid', gridTemplateColumns: '70px 2fr 1.2fr 50px 70px 80px 80px 40px',
                      gap: '8px', padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
                      alignItems: 'center', transition: 'background 0.1s', cursor: 'pointer'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontFamily: 'Share Tech Mono', fontSize: '10px', color: '#6b7280' }}>{r.riskId}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{r.title}</div>
                      {r.description && (
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.description}
                        </div>
                      )}
                      {r.relatedControls && r.relatedControls.length > 0 && (
                        <div style={{ fontSize: '10px', color: 'var(--color-accent)', marginTop: '2px', fontFamily: 'Share Tech Mono', fontWeight: 600 }}>
                          Mitigating Controls: {r.relatedControls.join(', ')}
                        </div>
                      )}
                      {r.owner && (
                        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', fontFamily: 'Share Tech Mono' }}>
                          Owner: {r.owner}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: '#374151' }}>{r.category}</span>
                    <span style={{ fontFamily: 'Share Tech Mono', fontWeight: 700, fontSize: '14px', color: r.riskLevel === 'High' ? '#b91c1c' : r.riskLevel === 'Medium' ? '#92400e' : '#166534' }}>
                      {r.riskScore}
                    </span>
                    <span><RiskBadge level={r.riskLevel} /></span>
                    <span style={{ fontSize: '10px', textTransform: 'capitalize', fontFamily: 'Share Tech Mono', color: '#374151' }}>{r.treatment}</span>
                    <span style={{
                      fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase',
                      padding: '2px 6px', border: '1px solid #000',
                      background: r.status === 'closed' ? '#000' : r.status === 'accepted' ? '#f3f4f6' : 'transparent',
                      color: r.status === 'closed' ? '#fff' : '#374151'
                    }}>
                      {r.status.replace('_', ' ')}
                    </span>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} title="Delete risk"
                        style={{ background: 'none', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', zIndex: 10 }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {showModal && (
        <AddRiskModal onClose={() => setShowModal(false)} onSave={risk => setRisks(r => [risk, ...r])} />
      )}
      {activeRisk && (
        <RiskDetailDrawer risk={activeRisk} onClose={() => setActiveRisk(null)} />
      )}
    </div>
  )
}
