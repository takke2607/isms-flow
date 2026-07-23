export interface EvidenceRequirement {
  title: string;
  description: string;
  type: string;
}

export const REQUIRED_EVIDENCE_MAP: Record<string, EvidenceRequirement> = {
  // Clause-based Controls (prefixed with clause-)
  'clause-6.1.2': { title: 'Completed Risk Assessment & Treatment Plan', description: 'Risk register database exports or files identifying security risks, likelihood/impact ratings, and owners.', type: 'Document' },
  'clause-6.1.3': { title: 'Statement of Applicability (SoA)', description: 'Signed and approved SoA detailing which of the 93 controls are applicable and their implementation status.', type: 'Document' },
  'clause-7.2': { title: 'Competence Records / CVs', description: 'Training certs, resumes, or skill matrices proving competence of staff holding key security roles.', type: 'Record' },
  'clause-7.3': { title: 'Security Awareness training slides/records', description: 'Evidence of recurring employee training, slides, attendance registers, or test scores.', type: 'Training' },
  'clause-9.1': { title: 'ISMS Performance Monitoring Metrics', description: 'Documented objectives, KPIs, and reports showing how the performance of the ISMS is monitored.', type: 'Report' },
  'clause-9.2': { title: 'Internal Audit Reports & Schedule', description: 'Annual audit program, auditor credentials, and reports detailing audit findings and corrective actions.', type: 'Report' },
  'clause-9.3': { title: 'Management Review Minutes & Action Items', description: 'Agenda, attendance, signed minutes, and tracking logs of actions decided during management reviews.', type: 'Minutes' },
  'clause-10.1': { title: 'Nonconformity & Corrective Action Register', description: 'Log of nonconformities, root cause analyses, and tracking of remediation actions.', type: 'Register' },

  // Annex A: 5. Organizational Controls
  '5.1': { title: 'Information Security Policy Set', description: 'Approved Information Security Policy, Access Control Policy, and Acceptable Use Policy.', type: 'Document' },
  '5.2': { title: 'Security Roles & Responsibilities RACI', description: 'Organizational chart, job descriptions, and RACI matrix assigning ISMS responsibilities.', type: 'Record' },
  '5.3': { title: 'Segregation of Duties Matrix', description: 'Matrix mapping incompatible roles (e.g. Developer vs. Production Deployer) to prevent abuse.', type: 'Document' },
  '5.5': { title: 'Contact with Authorities Registry', description: 'List of relevant external authorities, police departments, and utility providers with contact logs.', type: 'Register' },
  '5.6': { title: 'Contact with Special Interest Groups Log', description: 'List of security forums, memberships, or mailing list subscriptions relevant to compliance.', type: 'Register' },
  '5.8': { title: 'Project Management Security Reviews', description: 'Evidence of risk assessments conducted for key projects or major architecture changes.', type: 'Record' },
  '5.9': { title: 'Information Asset Register', description: 'List of all hardware, software, user data, and facility assets with owners and classification ratings.', type: 'Register' },
  '5.10': { title: 'Signed Acceptable Use Policies', description: 'Signed employee acknowledgments or policy manuals detailing acceptable use of corporate assets.', type: 'Record' },
  '5.11': { title: 'Asset Handover & Return Logs', description: 'Checklists signed by employees when receiving or returning laptops, badges, and equipment.', type: 'Record' },
  '5.12': { title: 'Information Classification Scheme', description: 'Policy defining classification tiers (e.g. Public, Internal, Confidential) and labeling rules.', type: 'Document' },
  '5.14': { title: 'Non-Disclosure Agreements (NDA)', description: 'Signed NDAs or confidentiality agreements for employees, contractors, and third parties.', type: 'Agreement' },
  '5.15': { title: 'Access Control Policy & Rules', description: 'Policy defining password complexity, MFA requirements, account timeouts, and access approval workflows.', type: 'Document' },
  '5.16': { title: 'User Identity Provisioning Records', description: 'Tickets or logs showing approval, creation, modification, and deletion of user accounts.', type: 'Record' },
  '5.18': { title: 'Access Rights Review Reports', description: 'Quarterly review reports verifying that user access levels are accurate and privileges are trimmed.', type: 'Report' },
  '5.19': { title: 'Supplier Security Policy / NDA templates', description: 'Standard security requirements and clauses integrated into vendor contracts and agreements.', type: 'Document' },
  '5.20': { title: 'Supplier Security Agreements & SLA', description: 'Signed vendor contracts containing security requirements and service level agreements (SLAs).', type: 'Agreement' },
  '5.22': { title: 'Supplier Performance Review Log', description: 'Annual assessment records or compliance certificates for critical vendors (e.g. AWS SOC2 reports).', type: 'Record' },
  '5.24': { title: 'Incident Management Plan & Playbooks', description: 'Incident Response Policy detailing procedures for detecting, reporting, and responding to events.', type: 'Document' },
  '5.26': { title: 'Incident Log & Post-Mortem Reviews', description: 'Completed incident response reports, root cause analyses, and action registers for closed incidents.', type: 'Log' },
  '5.29': { title: 'Business Continuity & Disaster Recovery Plan', description: 'Approved BCP/DR plans outlining procedures for system failovers, emergency contacts, and recovery.', type: 'Document' },
  '5.30': { title: 'DR / BCP Test Reports', description: 'Logs, test checklists, and reports showing periodic testing of database restorations and server failovers.', type: 'Report' },
  '5.31': { title: 'Legal & Statutory Compliance Register', description: 'Register listing all applicable laws (e.g. GDPR, HIPAA, local acts) and how compliance is met.', type: 'Register' },
  '5.34': { title: 'Privacy Policy & PII Inventory', description: 'External/Internal privacy policy, cookie consent config, and inventory of where PII is stored.', type: 'Document' },
  '5.36': { title: 'Technical Compliance Audit Reports', description: 'Internal vulnerability scan reviews or compliance audit reports verifying systems adhere to policies.', type: 'Report' },
  '5.37': { title: 'Standard Operating Procedures (SOPs)', description: 'Documented operational procedures for system backups, system patching, and deployments.', type: 'Document' },

  // Annex A: 6. People Controls
  '6.1': { title: 'Candidate Screening Records', description: 'Background checks, identity verification, or academic certificate verifications for new hires.', type: 'Record' },
  '6.2': { title: 'Employment Contracts Security Clauses', description: 'Employment agreements specifying security responsibilities before, during, and after employment.', type: 'Agreement' },
  '6.4': { title: 'Disciplinary Process Document', description: 'HR disciplinary policy defining actions taken against employees who violate security procedures.', type: 'Document' },
  '6.5': { title: 'Employee Offboarding Checklist', description: 'HR exit forms confirming revocation of access badges, accounts, and return of company assets.', type: 'Record' },
  '6.6': { title: 'Signed Employee NDA Letters', description: 'Signed confidentiality agreements binding employees to protect sensitive company information.', type: 'Agreement' },

  // Annex A: 7. Physical Controls
  '7.1': { title: 'Physical Perimeter Security Controls', description: 'Floor plans, photos of fences, doors, visitor desks, and physical security barrier details.', type: 'Photo/Log' },
  '7.2': { title: 'Physical Access Visitors Log', description: 'Signed visitor sign-in/out logs or electronic badge entry reports verifying authorized access.', type: 'Log' },
  '7.4': { title: 'CCTV Monitoring Logs & CCTV Photos', description: 'Photos of cameras, CCTV logs, or maintenance records verifying monitoring of physical entry points.', type: 'Photo/Log' },
  '7.5': { title: 'Environmental Threat Protection maintenance', description: 'Fire extinguisher inspection certs, smoke detector tests, and UPS load tests.', type: 'Record' },
  '7.7': { title: 'Clear Desk and Clear Screen Audits', description: 'Logs or reports from office security sweeps checking for left-behind documents or unlocked PCs.', type: 'Record' },
  '7.10': { title: 'Storage Media Disposal Certificates', description: 'Certificates of destruction or sanitization logs for recycled laptops, hard drives, or servers.', type: 'Record' },

  // Annex A: 8. Technological Controls
  '8.1': { title: 'Mobile Device Management (MDM) Policy', description: 'MDM configurations and endpoints policy restricting data transfer to unmanaged mobile devices.', type: 'Document' },
  '8.2': { title: 'Privileged Access Registry & Approvals', description: 'Admin account matrix, MFA setups, and ticketing logs approving root/admin accounts.', type: 'Configuration' },
  '8.3': { title: 'Access Control Matrix (RBT/ABAC)', description: 'Table mapping system access permissions to specific user groups or roles (e.g. HR, DevOps).', type: 'Record' },
  '8.4': { title: 'Source Code Repository Access Control', description: 'Screenshots of user access permissions in Git repositories (GitHub/GitLab) and branch protections.', type: 'Configuration' },
  '8.7': { title: 'Antivirus Console Status & Policy', description: 'Antivirus dashboard reports showing active agent counts, scan frequency, and quarantine logs.', type: 'Log' },
  '8.8': { title: 'Vulnerability Scan Reports & Patch Logs', description: 'Monthly vulnerability scan reports (Nessus/Qualys) and WSUS/patching completion records.', type: 'Report' },
  '8.9': { title: 'OS & System Hardening Guidelines', description: 'Documented checklists defining secure baseline configurations (e.g. disabling unused ports).', type: 'Document' },
  '8.10': { title: 'Data Deletion Certificates / Software logs', description: 'Logs from disk wiping tools proving secure erasure of decommissioned storage media.', type: 'Log' },
  '8.12': { title: 'Data Leakage Prevention (DLP) Policies', description: 'DLP console rules configuration, active alert logs, or blocking incident records.', type: 'Configuration' },
  '8.13': { title: 'Backup Schedules & Test Restorations', description: 'Schedules of daily/weekly backups and logs showing a successful test database restore within the year.', type: 'Log' },
  '8.15': { title: 'SIEM Log Configuration & Retention Rules', description: 'Server audit log configuration screenshots, log retention parameters, and syslog details.', type: 'Configuration' },
  '8.16': { title: 'Security Monitoring SOC alerts', description: 'Sample alert reports or logs from SIEM/IDS systems showing active event monitoring.', type: 'Log' },
  '8.20': { title: 'Network Topology & Firewall Rules Review', description: 'Up-to-date network architecture diagram and evidence of annual firewall rule reviews.', type: 'Configuration' },
  '8.22': { title: 'Network Segregation Rules Configuration', description: 'VLAN maps, subnets, and routing table configuration restricting traffic between zones.', type: 'Configuration' },
  '8.24': { title: 'Cryptographic Key Management Policy', description: 'Key management procedure and screenshots of SSL certificates, SSH keys, and database encryption.', type: 'Document' },
  '8.25': { title: 'Secure Development Lifecycle Policy', description: 'Guidelines for code reviews, third-party library scans, and secure software development.', type: 'Document' },
  '8.28': { title: 'Static Code Analysis (SAST) Reports', description: 'SonarQube or GitHub security alerts report showing code scanned for security flaws.', type: 'Report' },
  '8.29': { title: 'User Acceptance Testing (UAT) Sign-offs', description: 'Signed UAT records showing new software was tested and signed off before production deployment.', type: 'Record' },
  '8.31': { title: 'Dev / Stage / Prod Segregation controls', description: 'Configuration rules or IAM policies proving developers do not have admin access to production.', type: 'Configuration' },
  '8.32': { title: 'Change Request & CAB Approvals', description: 'Approved Change Requests, roll-back plans, and approvals from the Change Advisory Board (CAB).', type: 'Record' }
};

export function getExpectedEvidence(controlId: string): EvidenceRequirement | null {
  if (REQUIRED_EVIDENCE_MAP[controlId]) {
    return REQUIRED_EVIDENCE_MAP[controlId];
  }
  const clauseKey = `clause-${controlId}`;
  if (REQUIRED_EVIDENCE_MAP[clauseKey]) {
    return REQUIRED_EVIDENCE_MAP[clauseKey];
  }
  return null;
}
