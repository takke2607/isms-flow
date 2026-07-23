import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import DashboardClient from './DashboardClient'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let s = {
    total_controls: 93, implemented: 0, in_progress: 0, not_started: 93,
    overall_completion: 0, total_clauses: 7, total_documents: 0,
    total_risks: 0, risk_high: 0, risk_medium: 0, risk_low: 0,
    evidence_mapped_pct: 0,
    trend: [] as { month: string; value: number }[]
  }

  try {
    const [
      total_controls, implemented, in_progress, not_started,
      total_clauses, total_documents, total_risks, risk_high, risk_medium, risk_low,
      controls, controlsWithDocs
    ] = await Promise.all([
      prisma.control.count(),
      prisma.control.count({ where: { status: 'implemented' } }),
      prisma.control.count({ where: { status: 'in_progress' } }),
      prisma.control.count({ where: { status: 'not_started' } }),
      prisma.clause.count(),
      prisma.document.count(),
      prisma.risk.count(),
      prisma.risk.count({ where: { riskLevel: 'High' } }),
      prisma.risk.count({ where: { riskLevel: 'Medium' } }),
      prisma.risk.count({ where: { riskLevel: 'Low' } }),
      prisma.control.findMany({ select: { status: true, updatedAt: true } }),
      prisma.document.groupBy({
        by: ['controlId'],
        where: {
          controlId: { not: null }
        }
      })
    ])

    const totalPoints = controls.reduce((sum: number, c: { status: string }) => {
      if (c.status === 'implemented') return sum + 100
      if (c.status === 'in_progress') return sum + 50
      return sum
    }, 0)
    const overall_completion = controls.length > 0 ? totalPoints / controls.length : 0

    const evidence_mapped_count = controlsWithDocs.length
    const evidence_mapped_pct = Math.min(Math.round((evidence_mapped_count / 55) * 100), 100)

    // Calculate actual progressive maturity trend for the past 6 calendar months
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        value: 0
      })
    }

    months.forEach((m) => {
      const endOfMonth = new Date(m.year, m.monthNum + 1, 0, 23, 59, 59)
      const points = controls.reduce((sum: number, c: any) => {
        const isUpdatedBefore = new Date(c.updatedAt) <= endOfMonth
        if (isUpdatedBefore && c.status === 'implemented') return sum + 100
        if (isUpdatedBefore && c.status === 'in_progress') return sum + 50
        return sum
      }, 0)
      m.value = controls.length > 0 ? Math.round((points / controls.length) * 10) / 10 : 0
    })

    const trend = months.map(m => ({ month: m.name, value: m.value }))

    s = {
      total_controls, implemented, in_progress, not_started,
      overall_completion: Math.round(overall_completion * 10) / 10,
      total_clauses, total_documents, total_risks,
      risk_high, risk_medium, risk_low,
      evidence_mapped_pct,
      trend
    }
  } catch (e) {
    console.error('Dashboard DB error:', e)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Dashboard" />
        <DashboardClient stats={s} />
      </div>
    </div>
  )
}
