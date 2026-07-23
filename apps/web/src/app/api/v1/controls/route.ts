import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const page_size = parseInt(searchParams.get('page_size') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { controlId: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }
    if (category) {
      where.category = category
    }
    if (status) {
      where.status = status
    }

    const total = await prisma.control.count({ where })
    const items = await prisma.control.findMany({
      where,
      skip: (page - 1) * page_size,
      take: page_size,
      orderBy: { controlId: 'asc' }
    })

    // Map camelCase fields to snake_case to match previous API models seamlessly
    const mappedItems = items.map((item: any) => ({
      id: item.id,
      control_id: item.controlId,
      clause_db_id: item.clauseDbId,
      title: item.title,
      category: item.category,
      description: item.description,
      objective: item.objective,
      purpose: item.purpose,
      applicability: item.applicability,
      mandatory: item.mandatory,
      implementation_guidance: item.implementationGuidance,
      maturity_level: item.maturityLevel,
      dependencies: JSON.parse(item.dependencies || '[]'),
      related_controls: JSON.parse(item.relatedControls || '[]'),
      related_risks: JSON.parse(item.relatedRisks || '[]'),
      related_assets: JSON.parse(item.relatedAssets || '[]'),
      responsible_role: item.responsibleRole,
      supporting_teams: JSON.parse(item.supportingTeams || '[]'),
      review_frequency: item.reviewFrequency,
      retention_period: item.retentionPeriod,
      status: item.status,
      completion_percentage: item.completionPercentage,
      required_policies: JSON.parse(item.requiredPolicies || '[]'),
      required_procedures: JSON.parse(item.requiredProcedures || '[]'),
      required_standards: JSON.parse(item.requiredStandards || '[]'),
      required_records: JSON.parse(item.requiredRecords || '[]'),
      checklists: JSON.parse(item.checklists || '[]'),
      evidence_requirements: JSON.parse(item.evidenceRequirements || '[]')
    }))

    return NextResponse.json({
      items: mappedItems,
      total,
      page,
      page_size
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
