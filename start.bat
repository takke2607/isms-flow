@echo off
echo =============================================
echo  ISMS-Flow — ISO 27001 Implementation Portal
echo =============================================
echo.
echo Starting development server on port 3001...
echo.
echo  Dashboard:       http://localhost:3001
echo  Controls:        http://localhost:3001/controls  
echo  Risk Register:   http://localhost:3001/risks
echo  Documents:       http://localhost:3001/documents
echo  Clauses:         http://localhost:3001/clauses
echo  ISMS Journey:    http://localhost:3001/journey
echo  Evidence Hub:    http://localhost:3001/evidence
echo  SoA Builder:     http://localhost:3001/soa
echo  Audit Prep:      http://localhost:3001/audit
echo.
echo Press Ctrl+C to stop.
echo.
cd "%~dp0apps\web"
node "%~dp0node_modules\next\dist\bin\next" dev --port 3001
