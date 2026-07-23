import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function ReportsPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Reports" subtitle="Generate Statement of Applicability (SoA) and executive summaries" />
        <main className="page-body">
          <div className="page-header">
            <h2 className="page-title">Compliance Reports</h2>
            <p className="page-desc">
              Generate one-click reports for management reviews, auditors, and customers.
            </p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Available Templates</div>
              <div className="card-subtitle">Select a report format to generate</div>
            </div>
            <div className="card-body">
              <div className="empty-state">
                <div className="emoji">📈</div>
                <div className="empty-title">Reports Panel</div>
                <div className="empty-desc">Statement of Applicability (SoA), Executive Summaries, and Custom exports.</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
