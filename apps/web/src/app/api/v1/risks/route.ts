import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { createdAt: 'desc' }
    })
    const mapped = risks.map((r: any) => ({
      id: r.id,
      riskId: r.riskId,
      title: r.title,
      description: r.description,
      category: r.category,
      likelihood: r.likelihood,
      impact: r.impact,
      riskScore: r.riskScore,
      riskLevel: r.riskLevel,
      treatment: r.treatment,
      status: r.status,
      owner: r.owner,
      relatedControls: JSON.parse(r.relatedControls || '[]'),
      metadata: JSON.parse(r.metadata || '{}'),
      createdAt: r.createdAt,
    }))
    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const likelihood = parseInt(body.likelihood) || 3
    const impact = parseInt(body.impact) || 3
    const riskScore = likelihood * impact
    const riskLevel = riskScore >= 15 ? 'High' : riskScore >= 8 ? 'Medium' : 'Low'

    // Auto-generate riskId
    const count = await prisma.risk.count()
    const riskId = `RISK-${String(count + 1).padStart(3, '0')}`

    const risk = await prisma.risk.create({
      data: {
        riskId,
        title: body.title,
        description: body.description || '',
        category: body.category || 'Information Security',
        likelihood,
        impact,
        riskScore,
        riskLevel,
        treatment: body.treatment || 'mitigate',
        status: body.status || 'open',
        owner: body.owner || '',
        relatedControls: JSON.stringify(body.relatedControls || []),
        metadata: JSON.stringify(body.metadata || {}),
      }
    })
    return NextResponse.json(risk)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
