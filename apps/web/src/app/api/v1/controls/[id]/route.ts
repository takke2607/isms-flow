import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.control.findFirst({
      where: {
        OR: [
          { id: isNaN(parseInt(id)) ? undefined : parseInt(id) },
          { controlId: id }
        ]
      }
    })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const mapped = {
      id: item.id,
      control_id: item.controlId,
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
      evidence_requirements: JSON.parse(item.evidenceRequirements || '[]'),
    }
    return NextResponse.json(mapped)
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

    const item = await prisma.control.findFirst({
      where: {
        OR: [
          { id: isNaN(parseInt(id)) ? undefined : parseInt(id) },
          { controlId: id }
        ]
      }
    })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.control.update({
      where: { id: item.id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.completion_percentage !== undefined && {
          completionPercentage: parseFloat(body.completion_percentage)
        }),
        ...(body.related_risks !== undefined && {
          relatedRisks: JSON.stringify(body.related_risks)
        }),
      }
    })
    return NextResponse.json({ success: true, status: updated.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
