-- CreateTable
CREATE TABLE "Clause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clauseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "responsibleRole" TEXT,
    "reviewFrequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completionPercentage" REAL NOT NULL DEFAULT 0.0
);

-- CreateTable
CREATE TABLE "Control" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "controlId" TEXT NOT NULL,
    "clauseDbId" INTEGER,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT,
    "purpose" TEXT,
    "applicability" TEXT NOT NULL DEFAULT 'All organizations',
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "implementationGuidance" TEXT,
    "maturityLevel" TEXT NOT NULL DEFAULT 'Initial',
    "dependencies" TEXT NOT NULL DEFAULT '[]',
    "relatedControls" TEXT NOT NULL DEFAULT '[]',
    "relatedRisks" TEXT NOT NULL DEFAULT '[]',
    "relatedAssets" TEXT NOT NULL DEFAULT '[]',
    "responsibleRole" TEXT,
    "supportingTeams" TEXT NOT NULL DEFAULT '[]',
    "reviewFrequency" TEXT,
    "retentionPeriod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completionPercentage" REAL NOT NULL DEFAULT 0.0,
    "requiredPolicies" TEXT NOT NULL DEFAULT '[]',
    "requiredProcedures" TEXT NOT NULL DEFAULT '[]',
    "requiredStandards" TEXT NOT NULL DEFAULT '[]',
    "requiredSops" TEXT NOT NULL DEFAULT '[]',
    "requiredGuidelines" TEXT NOT NULL DEFAULT '[]',
    "requiredRegisters" TEXT NOT NULL DEFAULT '[]',
    "requiredRecords" TEXT NOT NULL DEFAULT '[]',
    "requiredForms" TEXT NOT NULL DEFAULT '[]',
    "requiredLogs" TEXT NOT NULL DEFAULT '[]',
    "requiredTechnicalConfigs" TEXT NOT NULL DEFAULT '[]',
    "requiredTemplates" TEXT NOT NULL DEFAULT '[]',
    "requiredTrainingMaterials" TEXT NOT NULL DEFAULT '[]',
    "requiredAgreements" TEXT NOT NULL DEFAULT '[]',
    "requiredPlans" TEXT NOT NULL DEFAULT '[]',
    "checklists" TEXT NOT NULL DEFAULT '[]',
    "evidenceRequirements" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Control_clauseDbId_fkey" FOREIGN KEY ("clauseDbId") REFERENCES "Clause" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "docType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "controlId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "impact" INTEGER NOT NULL DEFAULT 3,
    "riskScore" REAL NOT NULL DEFAULT 9.0,
    "riskLevel" TEXT NOT NULL DEFAULT 'Medium',
    "treatment" TEXT NOT NULL DEFAULT 'mitigate',
    "status" TEXT NOT NULL DEFAULT 'open',
    "owner" TEXT,
    "relatedControls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Clause_clauseId_key" ON "Clause"("clauseId");

-- CreateIndex
CREATE UNIQUE INDEX "Control_controlId_key" ON "Control"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_riskId_key" ON "Risk"("riskId");
