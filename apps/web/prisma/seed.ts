import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Directly import seed arrays to avoid runtime regex parsing issues
const CLAUSES = [
  {
    clause_id: "4",
    title: "Context of the Organization",
    description: "Understanding the organization and its context, the needs and expectations of interested parties, and determining the scope of the ISMS.",
    objective: "Establish the organizational context and scope of the ISMS.",
    mandatory: true,
    responsible_role: "CISO / Top Management",
    review_frequency: "Annual",
  },
  {
    clause_id: "5",
    title: "Leadership",
    description: "Top management must demonstrate leadership and commitment to the ISMS, establish information security policy, and assign roles and responsibilities.",
    objective: "Ensure top management commitment to information security.",
    mandatory: true,
    responsible_role: "CEO / Top Management",
    review_frequency: "Annual",
  },
  {
    clause_id: "6",
    title: "Planning",
    description: "Address risks and opportunities, set information security objectives, and plan actions to achieve them.",
    objective: "Ensure ISMS achieves its intended outcomes and prevents/reduces undesired effects.",
    mandatory: true,
    responsible_role: "CISO / Risk Manager",
    review_frequency: "Annual",
  },
  {
    clause_id: "7",
    title: "Support",
    description: "Provide resources, ensure competence, awareness, communication, and maintain documented information.",
    objective: "Ensure the ISMS is supported with adequate resources and documented information.",
    mandatory: true,
    responsible_role: "CISO / HR Manager",
    review_frequency: "Annual",
  },
  {
    clause_id: "8",
    title: "Operation",
    description: "Plan, implement, and control processes to meet information security requirements.",
    objective: "Implement and operationalize all ISMS processes effectively.",
    mandatory: true,
    responsible_role: "IT Manager / CISO",
    review_frequency: "Quarterly",
  },
  {
    clause_id: "9",
    title: "Performance Evaluation",
    description: "Monitor, measure, analyze, evaluate, conduct internal audits, and management reviews.",
    objective: "Evaluate ISMS performance and effectiveness.",
    mandatory: true,
    responsible_role: "Internal Audit / CISO",
    review_frequency: "Annual",
  },
  {
    clause_id: "10",
    title: "Improvement",
    description: "Address nonconformities and corrective actions, and continually improve the ISMS.",
    objective: "Continually improve the suitability, adequacy, and effectiveness of the ISMS.",
    mandatory: true,
    responsible_role: "CISO / Quality Manager",
    review_frequency: "Ongoing",
  },
]

const CONTROLS = [
  {
    control_id: "5.1",
    title: "Policies for information security",
    category: "Organizational",
    description: "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to, and acknowledged by relevant personnel.",
    objective: "Provide management direction and support for information security in accordance with business requirements.",
    purpose: "Establish the foundation of information security governance through documented policies.",
    applicability: "All organizations",
    mandatory: true,
    implementation_guidance: "Develop an overarching Information Security Policy approved by top management. Create topic-specific policies (e.g., access control, acceptable use, mobile devices). Communicate to all staff. Review annually or upon significant changes.",
    maturity_level: "Initial",
    responsible_role: "CISO",
    supporting_teams: ["HR", "Legal", "IT"],
    review_frequency: "Annual",
    retention_period: "3 years",
    required_policies: ["Information Security Policy", "Acceptable Use Policy"],
    required_procedures: ["Policy Review Procedure", "Policy Communication Procedure"],
    required_records: ["Policy Approval Records", "Staff Acknowledgment Records"],
    related_controls: ["5.2", "5.3", "6.1"],
    checklists: ["Policy approved by management", "Policy communicated to all staff", "Annual review scheduled"],
    evidence_requirements: ["Signed policy document", "Distribution email/records", "Review meeting minutes"],
  },
  {
    control_id: "5.2",
    title: "Information security roles and responsibilities",
    category: "Organizational",
    description: "Information security roles and responsibilities shall be defined and allocated according to the needs of the organization.",
    objective: "Ensure clear ownership and accountability for information security.",
    purpose: "Define who is responsible for what in the ISMS.",
    applicability: "All organizations",
    mandatory: true,
    implementation_guidance: "Define roles such as CISO, Data Owner, System Owner, Security Champion. Document in job descriptions. Assign responsibilities matrix (RACI). Communicate to all staff.",
    maturity_level: "Initial",
    responsible_role: "CISO / HR",
    supporting_teams: ["HR", "Management"],
    review_frequency: "Annual",
    retention_period: "3 years",
    required_policies: ["Information Security Roles Policy"],
    required_procedures: ["Role Assignment Procedure"],
    required_records: ["RACI Matrix", "Job Descriptions"],
    related_controls: ["5.1", "5.3"],
    checklists: ["RACI matrix documented", "Roles communicated", "Job descriptions updated"],
    evidence_requirements: ["RACI matrix", "Org chart with security roles", "Job descriptions"],
  },
  {
    control_id: "5.3",
    title: "Segregation of duties",
    category: "Organizational",
    description: "Conflicting duties and conflicting areas of responsibility shall be segregated.",
    objective: "Reduce opportunities for unauthorized or unintentional modification or misuse of assets.",
    purpose: "Prevent fraud and error by ensuring no single person controls all critical processes.",
    applicability: "All organizations",
    mandatory: true,
    implementation_guidance: "Identify critical processes that require segregation. Map duties and identify conflicts. Implement compensating controls where segregation is not feasible. Document exceptions.",
    maturity_level: "Developing",
    responsible_role: "CISO / IT Manager",
    supporting_teams: ["IT", "Finance", "HR"],
    review_frequency: "Annual",
    retention_period: "3 years",
    required_policies: ["Segregation of Duties Policy"],
    required_procedures: ["SoD Review Procedure"],
    required_records: ["Duty Matrix", "Exception Log"],
    related_controls: ["5.2", "8.2", "8.3"],
    checklists: ["Critical duties identified", "Conflicts resolved", "Compensating controls documented"],
    evidence_requirements: ["SoD matrix", "Exception approvals", "Access control records"],
  },
  {
    control_id: "5.4",
    title: "Management responsibilities",
    category: "Organizational",
    description: "Management shall require all personnel to apply information security in accordance with the established information security policy.",
    objective: "Ensure management actively enforces information security compliance.",
    purpose: "Create accountability at the management level for information security.",
    applicability: "All organizations",
    mandatory: true,
    implementation_guidance: "Include information security responsibilities in performance reviews. Ensure managers cascade security requirements to their teams. Conduct periodic compliance checks.",
    maturity_level: "Initial",
    responsible_role: "Top Management / HR",
    supporting_teams: ["HR", "CISO"],
    review_frequency: "Annual",
    retention_period: "3 years",
    required_policies: ["Management Information Security Responsibilities Policy"],
    required_procedures: ["Compliance Enforcement Procedure"],
    required_records: ["Performance Review Records", "Compliance Reports"],
    related_controls: ["5.1", "5.2", "6.1"],
    checklists: ["Management briefed on responsibilities", "Compliance integrated in performance reviews"],
    evidence_requirements: ["Performance appraisal records", "Management briefing records"],
  },
  {
    control_id: "5.9",
    title: "Inventory of assets",
    category: "Organizational",
    description: "An inventory of information and other associated assets, including the owners, shall be compiled and maintained.",
    objective: "Identify organization's assets and define appropriate protection responsibilities.",
    purpose: "Maintain a single source of truth for assets that need protection.",
    applicability: "All organizations",
    mandatory: true,
    implementation_guidance: "Identify all assets (hardware, software, data, services, people). Document in an asset register. Assign an owner to each asset. Classify the assets. Review annually.",
    maturity_level: "Initial",
    responsible_role: "Asset Manager / CISO",
    supporting_teams: ["IT", "Facility"],
    review_frequency: "Annual",
    retention_period: "5 years",
    required_policies: ["Asset Management Policy"],
    required_procedures: ["Asset Inventory Procedure"],
    required_records: ["Asset Register", "Asset Discard logs"],
    related_controls: ["5.12", "5.13"],
    checklists: ["Asset owners assigned", "Asset register maintained", "Asset classifications defined"],
    evidence_requirements: ["Asset register", "Owner approval logs"],
  },
  {
    control_id: "8.1",
    title: "User endpoint devices",
    category: "Technological",
    description: "Information security requirements for user endpoint devices shall be defined, approved, implemented, and monitored.",
    objective: "Protect user devices (laptops, phones) against malware and access breaches.",
    purpose: "Ensure remote work and endpoints meet minimum security configurations.",
    applicability: "All organizations",
    mandatory: true,
    implementation_guidance: "Enforce disk encryption, local firewall, antivirus/EDR, and strong passwords. Set up remote wipe capabilities.",
    maturity_level: "Developing",
    responsible_role: "IT Support / CISO",
    supporting_teams: ["IT Team"],
    review_frequency: "Bi-annual",
    retention_period: "3 years",
    required_policies: ["Endpoint Security Policy", "Bring Your Own Device (BYOD) Policy"],
    required_procedures: ["Device Provisioning Procedure", "Endpoint Encryption Procedure"],
    required_records: ["MDM Enrollment Logs", "Encryption Compliance Audit Logs"],
    related_controls: ["8.2", "8.20"],
    checklists: ["MDM software installed", "Disk encryption enabled", "Endpoint firewalls active"],
    evidence_requirements: ["MDM dashboard reports", "Active directory encryption status export"],
  }
]

const adapter = new PrismaLibSql({
  url: 'file:dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Next.js Prisma database...')

  // Seed clauses
  const clauseMap: Record<string, number> = {}
  for (const c of CLAUSES) {
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
  for (const ctrl of CONTROLS) {
    const controlId = String(ctrl.control_id)
    const prefix = controlId.split('.')[0]
    const clauseDbId = clauseMap[prefix] || null

    // Determine status & completion for 5.1, 5.2, 5.9 to match mockup exactly
    let status = 'not_started'
    let pct = 0.0
    if (controlId === '5.1' || controlId === '5.2') {
      status = 'implemented'
      pct = 100.0
    } else if (controlId === '5.9') {
      status = 'in_progress'
      pct = 50.0
    }

    const jsonFields: Record<string, any> = {}
    const listFields = [
      'required_policies', 'required_procedures',
      'required_standards', 'required_records',
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
        status,
        completionPercentage: pct,
        ...jsonFields
      }
    })
  }

  // Seed 1 default active high risk record to match dashboard metrics
  await prisma.risk.upsert({
    where: { riskId: 'R-01' },
    update: {},
    create: {
      riskId: 'R-01',
      title: 'Unauthorized access to user endpoint devices',
      description: 'Lack of endpoint device monitoring and encryption could lead to data breach',
      riskLevel: 'High',
      status: 'open',
      impact: 4,
      likelihood: 4,
      riskScore: 16.0,
      treatment: 'mitigate',
      relatedControls: JSON.stringify(['8.1'])
    }
  })

  console.log(`Seeding complete: ${CLAUSES.length} clauses, ${CONTROLS.length} controls, and 1 Risk record seeded.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
