'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

interface JourneyStep {
  num: string
  title: string
  desc: string
  documents: string[]
  evidence: string[]
}

const STEPS_DATA: JourneyStep[] = [
  {
    num: '01',
    title: 'Context & Scope Definition',
    desc: 'Identify organizational boundaries, regulatory requirements, and construct the initial ISMS Scope statement.',
    documents: [
      'ISMS Scope Statement Document (Clause 4.3)',
      'Regulatory & Compliance Requirements Register (Clause 4.2)',
      'Interested Parties Analysis Sheet (Clause 4.2)'
    ],
    evidence: [
      'Approved minutes of context definition meeting',
      'Signed organizational charts',
      'Contracts detailing third-party boundaries'
    ]
  },
  {
    num: '02',
    title: 'Leadership & Policy Foundation',
    desc: 'Define information security policies, establish governance roles, and distribute responsibilities (RACI).',
    documents: [
      'Top-Level Information Security Policy (Clause 5.2)',
      'ISMS Roles, Responsibilities & RACI Matrix (Clause 5.3)',
      'Information Security Objectives Document (Clause 6.2)'
    ],
    evidence: [
      'Executive board approval signature on Top Policy',
      'Security committee charter & meeting notes',
      'Internal roles and responsibilities announcement emails'
    ]
  },
  {
    num: '03',
    title: 'Asset Inventory & Classification',
    desc: 'Build the asset register, identify data owners, and categorize information based on sensitivity levels.',
    documents: [
      'Asset Inventory and Classification Procedure (Control 5.9)',
      'Information Asset Register Template (Control 5.9)',
      'Information Classification Guidelines (Control 5.12)'
    ],
    evidence: [
      'Asset owner sign-offs on ownership assignments',
      'Sample information classification labels on files/databases',
      'Completed master asset inventory spreadsheet'
    ]
  },
  {
    num: '04',
    title: 'Risk Assessment & Treatment Plan',
    desc: 'Evaluate vulnerability likelihood and impact, map risks to treatment controls, and generate the risk register.',
    documents: [
      'Information Security Risk Assessment Methodology (Clause 6.1.2)',
      'Risk Treatment Plan Document (Clause 6.1.3)',
      'Risk Assessment & Mitigation Register'
    ],
    evidence: [
      'Completed risk assessment spreadsheets/records',
      'Risk owner approval signatures on risk treatment plans',
      'Minutes of risk acceptance review meetings'
    ]
  },
  {
    num: '05',
    title: 'Control Implementation & SoA',
    desc: 'Address the 93 Annex A controls, upload policies, configurations, logs, and establish the Statement of Applicability.',
    documents: [
      'Statement of Applicability (SoA) Document (Clause 6.1.3)',
      'Access Control Policy (Control 8.2)',
      'Supplier Relationship Security Policy (Control 5.19)',
      'Incident Management Procedure (Control 5.24)'
    ],
    evidence: [
      'Signed Statement of Applicability',
      'Active directory password/access configuration logs',
      'Completed business continuity test reports',
      'Vendor security assessment forms'
    ]
  },
  {
    num: '06',
    title: 'Internal Audit & Certification',
    desc: 'Conduct mock audits, identify compliance gaps, and run formal certifications.',
    documents: [
      'Internal Audit Procedure (Clause 9.2)',
      'Internal Audit Schedule & Plan (Clause 9.2)',
      'Internal Audit Report (Clause 9.2)',
      'Management Review Meeting Minutes (Clause 9.3)'
    ],
    evidence: [
      'Internal audit findings and corrective action logs (CAPA)',
      'Signed management review notes from top leadership',
      'Stage 1 and Stage 2 certification body audit reports'
    ]
  }
]

// Map journey step numbers to ISO 27001 Clause IDs
const STEP_TO_CLAUSES_MAP: Record<string, string[]> = {
  '01': ['4'],      // Context of the Organization
  '02': ['5'],      // Leadership
  '03': ['7'],      // Support (resources, awareness, doc info)
  '04': ['6'],      // Planning (risks, objectives)
  '05': ['8'],      // Operation
  '06': ['9', '10'] // Performance Evaluation & Improvement
}

export default function ISMSJourneyPage() {
  const [activeStep, setActiveStep] = useState<string>('01')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load checklist state from localStorage on client side mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isms_journey_checklist')
      if (saved) {
        setCheckedItems(JSON.parse(saved))
      } else {
        // Initialize default completed state for steps 1 and 2 to match original visual representation
        const initial: Record<string, boolean> = {}
        // Step 1: all docs and evidence checked
        STEPS_DATA[0].documents.forEach((_, i) => { initial[`01-doc-${i}`] = true })
        STEPS_DATA[0].evidence.forEach((_, i) => { initial[`01-evi-${i}`] = true })
        // Step 2: all docs and evidence checked
        STEPS_DATA[1].documents.forEach((_, i) => { initial[`02-doc-${i}`] = true })
        STEPS_DATA[1].evidence.forEach((_, i) => { initial[`02-evi-${i}`] = true })
        // Step 3: partial (e.g. first doc checked)
        initial[`03-doc-0`] = true
        setCheckedItems(initial)

        // Push initial state to database
        setTimeout(() => {
          STEPS_DATA.forEach(s => {
            syncStepToDb(s, initial)
          })
        }, 500)
      }
    } catch (e) {
      console.error('Failed to parse saved checklist', e)
    }
    setIsLoaded(true)
  }, [])

  // Sync step completion to SQLite database via Clauses API
  const syncStepToDb = async (step: JourneyStep, currentChecked: Record<string, boolean>) => {
    const totalItems = step.documents.length + step.evidence.length
    if (totalItems === 0) return

    let checkedCount = 0
    step.documents.forEach((_, i) => {
      if (currentChecked[`${step.num}-doc-${i}`]) checkedCount++
    })
    step.evidence.forEach((_, i) => {
      if (currentChecked[`${step.num}-evi-${i}`]) checkedCount++
    })

    const pct = Math.round((checkedCount / totalItems) * 100)
    const dbStatus = pct === 100 ? 'implemented' : pct > 0 ? 'in_progress' : 'not_started'

    const targetClauses = STEP_TO_CLAUSES_MAP[step.num] || []
    for (const clauseId of targetClauses) {
      try {
        await fetch('/api/v1/clauses', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clauseId,
            status: dbStatus,
            completionPercentage: pct
          })
        })
      } catch (err) {
        console.error(`Failed to sync clause ${clauseId} status:`, err)
      }
    }
  }

  // Save checklist state to localStorage and update DB when it changes
  const toggleItem = (key: string) => {
    const next = { ...checkedItems, [key]: !checkedItems[key] }
    setCheckedItems(next)
    localStorage.setItem('isms_journey_checklist', JSON.stringify(next))

    // Identify which step this key belongs to and sync
    const stepNum = key.substring(0, 2)
    const step = STEPS_DATA.find(s => s.num === stepNum)
    if (step) {
      syncStepToDb(step, next)
    }
  }

  // Get status of a step dynamically based on checklist items
  const getStepStatus = (step: JourneyStep) => {
    const totalItems = step.documents.length + step.evidence.length
    if (totalItems === 0) return 'NOT_STARTED'

    let checkedCount = 0
    step.documents.forEach((_, i) => {
      if (checkedItems[`${step.num}-doc-${i}`]) checkedCount++
    })
    step.evidence.forEach((_, i) => {
      if (checkedItems[`${step.num}-evi-${i}`]) checkedCount++
    })

    if (checkedCount === totalItems) return 'COMPLETED'
    if (checkedCount > 0) return 'IN_PROGRESS'
    return 'NOT_STARTED'
  }

  const current = STEPS_DATA.find((s) => s.num === activeStep) || STEPS_DATA[0]

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="ISMS Journey" />
        <main className="page-body">
          <div className="page-header">
            <h2 className="page-title">ISMS Implementation Journey</h2>
            <p className="page-desc">
              Your interactive step-by-step roadmap. Check or uncheck items to automatically progress the status of each implementation step and update your Mandatory Clauses status in real-time.
            </p>
          </div>

          <div className="two-col" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Step Selection List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {STEPS_DATA.map((s) => {
                const isActive = s.num === activeStep
                const status = isLoaded ? getStepStatus(s) : 'NOT_STARTED'
                return (
                  <div
                    key={s.num}
                    className="card"
                    onClick={() => setActiveStep(s.num)}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderWidth: isActive ? '2px' : '1.5px',
                      borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                      background: isActive ? '#fff' : 'var(--color-bg-primary)',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px',
                        border: '1px solid #000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Share Tech Mono', fontSize: '12px', fontWeight: 700,
                        background: isActive ? 'var(--color-accent)' : 'transparent',
                        color: isActive ? '#fff' : '#000'
                      }}>
                        {s.num}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>{s.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {s.desc}
                        </div>
                      </div>
                      <div>
                        <span style={{
                          fontFamily: 'Share Tech Mono',
                          fontSize: '8px',
                          fontWeight: 700,
                          border: '1px solid #000',
                          padding: '2px 6px',
                          background: status === 'COMPLETED' ? '#000' : status === 'IN_PROGRESS' ? 'var(--color-accent-light)' : 'transparent',
                          color: status === 'COMPLETED' ? '#fff' : status === 'IN_PROGRESS' ? 'var(--color-accent)' : '#888'
                        }}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Checklist Panel */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Step {current.num} Checklist Details</div>
                  <div className="card-subtitle">{current.title}</div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontFamily: 'Share Tech Mono',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                    marginBottom: '8px'
                  }}>
                    Required Documents (Policies/Procedures)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {current.documents.map((doc, idx) => {
                      const key = `${current.num}-doc-${idx}`
                      const isChecked = !!checkedItems[key]
                      return (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '11px',
                            color: isChecked ? '#000' : 'var(--color-text-secondary)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            lineHeight: 1.4,
                            cursor: 'pointer',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem(key)}
                            style={{ marginTop: '2px', cursor: 'pointer' }}
                          />
                          {doc}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1.5px dashed var(--color-border)', paddingTop: '16px' }}>
                  <div style={{
                    fontFamily: 'Share Tech Mono',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                    marginBottom: '8px'
                  }}>
                    Audit Evidence checklist
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {current.evidence.map((ev, idx) => {
                      const key = `${current.num}-evi-${idx}`
                      const isChecked = !!checkedItems[key]
                      return (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '11px',
                            color: isChecked ? '#000' : 'var(--color-text-secondary)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            lineHeight: 1.4,
                            cursor: 'pointer',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem(key)}
                            style={{ marginTop: '2px', cursor: 'pointer' }}
                          />
                          {ev}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
