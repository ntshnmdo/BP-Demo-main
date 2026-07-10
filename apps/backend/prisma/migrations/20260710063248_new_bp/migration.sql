-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANUFACTURER', 'MATERIAL_SUPPLIER', 'TESTING_LABORATORY', 'SUSTAINABILITY_TEAM', 'PUBLIC_USER');

-- CreateEnum
CREATE TYPE "PassportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BatteryType" AS ENUM ('EV', 'INDUSTRIAL', 'STATIONARY', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'DOCUMENT_UPLOADED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MANUFACTURER',
    "organization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatteryPassport" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "status" "PassportStatus" NOT NULL DEFAULT 'DRAFT',
    "serialNumber" TEXT NOT NULL,
    "qrCode" TEXT,
    "model" TEXT NOT NULL,
    "batteryType" "BatteryType" NOT NULL,
    "chemistry" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "intendedUse" TEXT,
    "capacity" DOUBLE PRECISION,
    "nominalVoltage" DOUBLE PRECISION,
    "countryOfOrigin" TEXT,
    "stateOfHealth" DOUBLE PRECISION DEFAULT 100,
    "stateOfCharge" DOUBLE PRECISION DEFAULT 100,
    "materialComposition" JSONB,
    "carbonFootprint" DOUBLE PRECISION,
    "ghgEmissions" DOUBLE PRECISION,
    "manufacturingSiteEmissions" DOUBLE PRECISION,
    "recycledContent" DOUBLE PRECISION,
    "recyclingInfo" TEXT,
    "circularityScore" INTEGER,
    "blockchainHash" TEXT,
    "blockchainTx" TEXT,
    "warrantyStart" TIMESTAMP(3),
    "warrantyEnd" TIMESTAMP(3),
    "warrantyKm" INTEGER,
    "lifecycleEvents" JSONB,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatteryPassport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BatteryPassport_passportId_key" ON "BatteryPassport"("passportId");

-- CreateIndex
CREATE UNIQUE INDEX "BatteryPassport_serialNumber_key" ON "BatteryPassport"("serialNumber");

-- AddForeignKey
ALTER TABLE "BatteryPassport" ADD CONSTRAINT "BatteryPassport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatteryPassport" ADD CONSTRAINT "BatteryPassport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "BatteryPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "BatteryPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "BatteryPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
