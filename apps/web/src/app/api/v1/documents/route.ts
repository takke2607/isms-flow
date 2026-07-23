import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    })
    const mapped = docs.map((d: any) => ({
      id: d.id,
      docType: d.docType,
      title: d.title,
      description: d.description,
      controlId: d.controlId,
      status: d.status,
      filePath: d.filePath,
      createdAt: d.createdAt,
    }))
    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const doc = await prisma.document.create({
      data: {
        docType: body.docType || 'Policy',
        title: body.title,
        description: body.description || '',
        controlId: body.controlId || null,
        status: body.status || 'draft',
        filePath: body.filePath || null,
      }
    })
    return NextResponse.json(doc)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
