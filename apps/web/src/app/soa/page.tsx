import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import SoAClient from './SoAClient'
import prisma from '@/lib/prisma'

export default async function SoABuilderPage() {
  let controls: any[] = []
  let allRisks: any[] = []
  
  try {
    controls = await prisma.control.findMany({
      orderBy: { controlId: 'asc' },
      select: {
        id: true,
        controlId: true,
        title: true,
        category: true,
        mandatory: true,
        status: true,
        completionPercentage: true,
        relatedRisks: true,
      }
    })
    
    allRisks = await prisma.risk.findMany({
      orderBy: { riskId: 'asc' },
      select: {
        id: true,
        riskId: true,
        title: true,
        relatedControls: true,
      }
    })
  } catch (e) {
    console.error('Failed to load controls/risks:', e)
  }

  const mappedControls = controls.map(c => {
    const associatedRisks = allRisks.filter(r => {
      let rControls: string[] = []
      try {
        rControls = JSON.parse(r.relatedControls || '[]')
      } catch (e) {}
      return rControls.includes(c.controlId)
    }).map(r => r.riskId)

    return {
      id: c.id,
      controlId: c.controlId,
      title: c.title,
      category: c.category,
      mandatory: c.mandatory,
      status: c.status,
      completionPercentage: c.completionPercentage,
      relatedRisks: associatedRisks,
    }
  })

  const mappedRisks = allRisks.map(r => ({
    id: r.id,
    riskId: r.riskId,
    title: r.title,
  }))

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="SoA Builder" />
        <SoAClient controls={mappedControls} allRisks={mappedRisks} />
      </div>
    </div>
  )
}
