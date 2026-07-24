import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import * as fs from 'fs'
import * as path from 'path'

const adapter = new PrismaLibSql({
  url: 'file:dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Next.js Prisma database...')

  const dataPath = path.join(__dirname, 'seedData.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const { clauses, controls } = JSON.parse(rawData)

  // Seed clauses
  const clauseMap: Record<string, number> = {}
  for (const c of clauses) {
    const dbClause = await prisma.clause.upsert({
      where: { clauseId: String(c.clause_id) },
      update: {},
      create: {
        clauseId: String(c.clause_id),
        title: c.title,
        description: c.description,
        objective: c.objective || '',
        mandatory: c.mandatory ?? true,
        responsibleRole: c.responsible_role || '',
        reviewFrequency: c.review_frequency || '',
        status: 'not_started',
        completionPercentage: 0.0
      }
    })
    clauseMap[String(c.clause_id)] = dbClause.id
  }

  // Seed controls
  for (const ctrl of controls) {
    const controlId = String(ctrl.control_id)
    const prefix = controlId.split('.')[0]
    const clauseDbId = clauseMap[prefix] || null

    const jsonFields: Record<string, any> = {}
    const listFields = [
      'required_policies', 'required_procedures',
      'required_standards', 'required_sops', 'required_guidelines',
      'required_registers', 'required_records', 'required_forms',
      'required_logs', 'required_technical_configs', 'required_templates',
      'required_training_materials', 'required_agreements', 'required_plans',
      'checklists', 'evidence_requirements'
    ]

    for (const field of listFields) {
      const val = (ctrl as any)[field] || []
      const camelName = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      jsonFields[camelName] = JSON.stringify(val)
    }

    await prisma.control.upsert({
      where: { controlId },
      update: {},
      create: {
        controlId,
        clauseDbId,
        title: ctrl.title,
        category: ctrl.category,
        description: ctrl.description || '',
        objective: ctrl.objective || '',
        purpose: ctrl.purpose || '',
        applicability: ctrl.applicability || 'All organizations',
        mandatory: ctrl.mandatory ?? true,
        implementationGuidance: ctrl.implementation_guidance || '',
        maturityLevel: ctrl.maturity_level || 'Initial',
        responsibleRole: ctrl.responsible_role || '',
        reviewFrequency: ctrl.review_frequency || '',
        retentionPeriod: ctrl.retention_period || '',
        status: 'not_started',
        completionPercentage: 0.0,
        ...jsonFields
      }
    })
  }

  console.log(`Seeding complete: ${clauses.length} clauses and ${controls.length} controls successfully initialized.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
