import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const total_controls = await prisma.control.count()
    const implemented = await prisma.control.count({ where: { status: 'implemented' } })
    const in_progress = await prisma.control.count({ where: { status: 'in_progress' } })
    const not_started = await prisma.control.count({ where: { status: 'not_started' } })

    // Strict percentage calculation: only implemented controls are 100%, in_progress are 50%
    const controls = await prisma.control.findMany({
      select: { status: true, updatedAt: true }
    })
    const totalPoints = controls.reduce((sum: number, c: { status: string }) => {
      if (c.status === 'implemented') return sum + 100
      if (c.status === 'in_progress') return sum + 50
      return sum
    }, 0)
    const avg_completion = controls.length > 0 ? totalPoints / controls.length : 0.0

    const total_clauses = await prisma.clause.count()
    const total_documents = await prisma.document.count()

    const total_risks = await prisma.risk.count()
    const risk_high = await prisma.risk.count({ where: { riskLevel: 'High' } })
    const risk_medium = await prisma.risk.count({ where: { riskLevel: 'Medium' } })
    const risk_low = await prisma.risk.count({ where: { riskLevel: 'Low' } })

    // Calculate evidence mapping percentage dynamically
    const controlsWithDocs = await prisma.document.groupBy({
      by: ['controlId'],
      where: {
        controlId: { not: null }
      }
    })
    const evidence_mapped_count = controlsWithDocs.length
    // Base is 55 key evidence controls
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

    return NextResponse.json({
      total_controls,
      implemented,
      in_progress,
      not_started,
      overall_completion: round(avg_completion, 1),
      total_clauses,
      total_documents,
      total_risks,
      risk_high,
      risk_medium,
      risk_low,
      evidence_mapped_pct,
      trend
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function round(value: number, precision: number) {
  const multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}
