import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import EvidenceClient from './EvidenceClient'
import prisma from '@/lib/prisma'

import { REQUIRED_EVIDENCE_MAP } from '@/lib/evidenceMap'

export const dynamic = 'force-dynamic'

export default async function EvidencePage() {
  let clauses: any[] = []
  let controls: any[] = []
  let documents: any[] = []

  try {
    clauses = await prisma.clause.findMany({
      orderBy: { clauseId: 'asc' }
    })
    controls = await prisma.control.findMany({
      orderBy: { controlId: 'asc' }
    })
    documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    console.error('Error fetching evidence data:', e)
  }

  const mappedEvidence: any[] = []

  // 1. Process Clauses
  clauses.forEach(cl => {
    const key = `clause-${cl.clauseId}`
    const requirement = REQUIRED_EVIDENCE_MAP[key]
    if (!requirement) return

    const linkedDocs = documents.filter(d => d.controlId === key || d.controlId === cl.clauseId)
    const status = linkedDocs.length > 0 ? 'collected' : 'missing'

    mappedEvidence.push({
      id: key,
      controlId: cl.clauseId,
      controlTitle: cl.title,
      category: 'Clause',
      evidenceType: requirement.type,
      title: requirement.title,
      description: requirement.description,
      status,
      controlStatus: cl.status || 'not_started',
      linkedDocs: linkedDocs.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description || '',
        url: d.filePath || ''
      }))
    })
  })

  // 2. Process Controls
  controls.forEach(c => {
    const requirement = REQUIRED_EVIDENCE_MAP[c.controlId]
    if (!requirement) return

    const linkedDocs = documents.filter(d => d.controlId === c.controlId)
    const status = linkedDocs.length > 0 ? 'collected' : 'missing'

    mappedEvidence.push({
      id: c.controlId,
      controlId: c.controlId,
      controlTitle: c.title,
      category: c.category || 'Organizational',
      evidenceType: requirement.type,
      title: requirement.title,
      description: requirement.description,
      status,
      controlStatus: c.status || 'not_started',
      linkedDocs: linkedDocs.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description || '',
        url: d.filePath || ''
      }))
    })
  })

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Evidence Hub" />
        <EvidenceClient initialEvidence={mappedEvidence} />
      </div>
    </div>
  )
}
