// Prisma 7.x client setup using the libsql adapter for SQLite
// The connection URL is configured in prisma.config.ts

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.DATABASE_URL || 'file:./dev.db'
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter } as any)
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
