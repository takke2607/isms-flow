import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const clauses = await prisma.clause.findMany({
      orderBy: { clauseId: 'asc' }
    })

    const mappedClauses = clauses.map((c: any) => ({
      id: c.id,
      clause_id: c.clauseId,
      title: c.title,
      description: c.description,
      objective: c.objective,
      mandatory: c.mandatory,
      responsible_role: c.responsibleRole,
      review_frequency: c.reviewFrequency,
      status: c.status,
      completion_percentage: c.completionPercentage
    }))

    return NextResponse.json(mappedClauses)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { clauseId, status, completionPercentage } = body

    if (!clauseId) {
      return NextResponse.json({ error: 'clauseId is required' }, { status: 400 })
    }

    const updated = await prisma.clause.update({
      where: { clauseId: String(clauseId) },
      data: {
        status,
        completionPercentage: parseFloat(completionPercentage)
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Failed to update clause:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
