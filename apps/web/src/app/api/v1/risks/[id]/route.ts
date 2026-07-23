import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const risk = await prisma.risk.findUnique({ where: { id: parseInt(id) } })
    if (!risk) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(risk)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const likelihood = body.likelihood ? parseInt(body.likelihood) : undefined
    const impact = body.impact ? parseInt(body.impact) : undefined

    const existing = await prisma.risk.findUnique({ where: { id: parseInt(id) } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newLikelihood = likelihood ?? existing.likelihood
    const newImpact = impact ?? existing.impact
    const riskScore = newLikelihood * newImpact
    const riskLevel = riskScore >= 15 ? 'High' : riskScore >= 8 ? 'Medium' : 'Low'

    const risk = await prisma.risk.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.treatment !== undefined && { treatment: body.treatment }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.owner !== undefined && { owner: body.owner }),
        likelihood: newLikelihood,
        impact: newImpact,
        riskScore,
        riskLevel,
      }
    })
    return NextResponse.json(risk)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.risk.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
