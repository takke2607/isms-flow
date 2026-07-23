import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function CopilotPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="AI Copilot" subtitle="Ask questions and get implementation guidance" />
        <main className="page-body">
          <div className="page-header">
            <h2 className="page-title">AI Copilot</h2>
            <p className="page-desc">
              Your virtual ISO 27001 implementation consultant. Ask questions about policies, controls, or evidence.
            </p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Chat with Copilot</div>
              <div className="card-subtitle">AI-guided advice on ISO/IEC 27001:2022</div>
            </div>
            <div className="card-body">
              <div className="empty-state">
                <div className="emoji">✦</div>
                <div className="empty-title">AI Copilot Chat Interface</div>
                <div className="empty-desc">Type your questions below to seek audit assistance or policy generation tips.</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
