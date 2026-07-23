// API client — uses relative URLs so it works in both SSR and client-side
// For SSR (server components), Next.js resolves relative URLs automatically

export const API_BASE = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  : ''

export interface Control {
  id: number
  control_id: string
  title: string
  category: string
  description: string
  objective: string
  purpose: string
  applicability: string
  mandatory: boolean
  implementation_guidance: string
  maturity_level: string
  dependencies: string[]
  related_controls: string[]
  related_risks: string[]
  related_assets: string[]
  responsible_role: string
  supporting_teams: string[]
  review_frequency: string
  retention_period: string
  status: string
  completion_percentage: number
  required_policies: string[]
  required_procedures: string[]
  required_standards: string[]
  required_sops: string[]
  required_guidelines: string[]
  required_registers: string[]
  required_records: string[]
  required_forms: string[]
  required_logs: string[]
  required_technical_configs: string[]
  required_templates: string[]
  required_training_materials: string[]
  required_agreements: string[]
  checklists: string[]
  evidence_requirements: string[]
  created_at: string
}

export interface Clause {
  id: number
  clause_id: string
  title: string
  description: string
  objective: string
  mandatory: boolean
  status: string
  completion_percentage: number
  responsible_role: string
  review_frequency: string
}

export interface DashboardStats {
  total_controls: number
  implemented: number
  in_progress: number
  not_started: number
  overall_completion: number
  total_clauses: number
  total_documents: number
  total_risks: number
  risk_high: number
  risk_medium: number
  risk_low: number
}

export interface PaginatedControls {
  total: number
  page: number
  page_size: number
  items: Control[]
}

export interface Risk {
  id: number
  riskId: string
  title: string
  description: string
  category: string
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: string
  treatment: string
  status: string
  owner: string
  relatedControls: string[]
  createdAt: string
}

export interface Document {
  id: number
  docType: string
  title: string
  description: string
  controlId: string
  status: string
  filePath: string
  createdAt: string
}

async function apiFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, typeof window === 'undefined' ? `http://localhost:3000` : window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`API Error: ${res.status} ${path}`)
  return res.json()
}

export const api = {
  getDashboard: () => apiFetch<DashboardStats>('/api/v1/dashboard'),
  getClauses: () => apiFetch<Clause[]>('/api/v1/clauses'),
  getControls: (params?: Record<string, string | number>) =>
    apiFetch<PaginatedControls>('/api/v1/controls', params),
  getControl: (id: string) => apiFetch<Control>(`/api/v1/controls/${id}`),
  getRisks: () => apiFetch<Risk[]>('/api/v1/risks'),
  getDocuments: () => apiFetch<Document[]>('/api/v1/documents'),
}
