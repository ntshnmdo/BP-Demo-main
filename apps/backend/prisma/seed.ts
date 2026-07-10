import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Users ───────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@batterypassport.eu' },
    update: {},
    create: {
      email: 'admin@batterypassport.eu',
      name: 'System Administrator',
      passwordHash,
      role: 'ADMIN',
      organization: 'Battery Passport Authority',
      isActive: true,
    },
  });

  const manufacturer = await prisma.user.upsert({
    where: { email: 'manufacturer@voltaics.de' },
    update: {},
    create: {
      email: 'manufacturer@voltaics.de',
      name: 'Klaus Weber',
      passwordHash,
      role: 'MANUFACTURER',
      organization: 'Voltaics GmbH',
      isActive: true,
    },
  });

  const manufacturer2 = await prisma.user.upsert({
    where: { email: 'ops@ecopower.nl' },
    update: {},
    create: {
      email: 'ops@ecopower.nl',
      name: 'Sophie van der Berg',
      passwordHash,
      role: 'MANUFACTURER',
      organization: 'EcoPower NL',
      isActive: true,
    },
  });

  const lab = await prisma.user.upsert({
    where: { email: 'lab@tuv-testing.de' },
    update: {},
    create: {
      email: 'lab@tuv-testing.de',
      name: 'Dr. Ingrid Müller',
      passwordHash,
      role: 'TESTING_LABORATORY',
      organization: 'TÜV Battery Testing GmbH',
      isActive: true,
    },
  });

  const sustainability = await prisma.user.upsert({
    where: { email: 'sustainability@greenchain.eu' },
    update: {},
    create: {
      email: 'sustainability@greenchain.eu',
      name: 'Marco Rossi',
      passwordHash,
      role: 'SUSTAINABILITY_TEAM',
      organization: 'GreenChain EU',
      isActive: true,
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supply@lithiumsource.cn' },
    update: {},
    create: {
      email: 'supply@lithiumsource.cn',
      name: 'Wei Zhang',
      passwordHash,
      role: 'MATERIAL_SUPPLIER',
      organization: 'LithiumSource Asia',
      isActive: true,
    },
  });

  console.log('✅ Users seeded');

  // ─── Helper: create passport with certs & audit logs ─────────────────────
  async function createPassport(data: {
    passportId: string;
    serialNumber: string;
    model: string;
    batteryType: 'EV' | 'INDUSTRIAL' | 'STATIONARY' | 'OTHER';
    chemistry: string;
    productionDate: Date;
    intendedUse: string;
    capacity: number;
    nominalVoltage: number;
    countryOfOrigin: string;
    materialComposition: object;
    carbonFootprint: number;
    ghgEmissions: number;
    manufacturingSiteEmissions: number;
    recycledContent: number;
    recyclingInfo: string;
    circularityScore: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
    createdById: string;
    approvedById?: string;
    submittedAt?: Date;
    approvedAt?: Date;
    publishedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    warrantyStart?: Date;
    warrantyEnd?: Date;
    warrantyKm?: number;
    blockchainHash?: string;
    blockchainTx?: string;
    lifecycleEvents?: object[];
    certificates: Array<{
      type: string;
      issuer: string;
      issuedDate: Date;
      expiryDate?: Date;
      status: string;
    }>;
    auditActions: Array<{
      action: 'CREATED' | 'UPDATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DOCUMENT_UPLOADED';
      actorId: string;
      details: string;
      createdAt: Date;
    }>;
  }) {
    const passport = await prisma.batteryPassport.upsert({
      where: { passportId: data.passportId },
      update: {},
      create: {
        passportId: data.passportId,
        serialNumber: data.serialNumber,
        model: data.model,
        batteryType: data.batteryType,
        chemistry: data.chemistry,
        productionDate: data.productionDate,
        intendedUse: data.intendedUse,
        capacity: data.capacity,
        nominalVoltage: data.nominalVoltage,
        countryOfOrigin: data.countryOfOrigin,
        materialComposition: data.materialComposition,
        carbonFootprint: data.carbonFootprint,
        ghgEmissions: data.ghgEmissions,
        manufacturingSiteEmissions: data.manufacturingSiteEmissions,
        recycledContent: data.recycledContent,
        recyclingInfo: data.recyclingInfo,
        circularityScore: data.circularityScore,
        status: data.status,
        createdById: data.createdById,
        approvedById: data.approvedById,
        submittedAt: data.submittedAt,
        approvedAt: data.approvedAt,
        publishedAt: data.publishedAt,
        rejectedAt: data.rejectedAt,
        rejectionReason: data.rejectionReason,
        warrantyStart: data.warrantyStart,
        warrantyEnd: data.warrantyEnd,
        warrantyKm: data.warrantyKm,
        blockchainHash: data.blockchainHash,
        blockchainTx: data.blockchainTx,
        lifecycleEvents: data.lifecycleEvents as any,
        qrCode: `https://passport.batterypassport.eu/scan/${data.passportId}`,
      },
    });

    for (const cert of data.certificates) {
      await prisma.certificate.create({
        data: {
          passportId: passport.id,
          type: cert.type,
          issuer: cert.issuer,
          issuedDate: cert.issuedDate,
          expiryDate: cert.expiryDate,
          status: cert.status,
        },
      });
    }

    for (const log of data.auditActions) {
      await prisma.auditLog.create({
        data: {
          passportId: passport.id,
          action: log.action,
          actorId: log.actorId,
          details: log.details,
          createdAt: log.createdAt,
        },
      });
    }

    return passport;
  }

  // ─── Passport 1: PUBLISHED EV Battery ────────────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000001',
    serialNumber: 'VLT-EV-NMC-2024-001',
    model: 'VoltPack Ultra 100',
    batteryType: 'EV',
    chemistry: 'NMC-811',
    productionDate: new Date('2024-01-15'),
    intendedUse: 'Electric Vehicle Traction Battery',
    capacity: 100.0,
    nominalVoltage: 400.0,
    countryOfOrigin: 'Germany',
    materialComposition: {
      lithium: { percentage: 7.2, supplier: 'LithiumSource Asia', origin: 'Chile' },
      nickel: { percentage: 34.5, supplier: 'Nordic Nickel AS', origin: 'Finland' },
      manganese: { percentage: 11.0, supplier: 'MangaCorp EU', origin: 'Sweden' },
      cobalt: { percentage: 5.5, supplier: 'EthicalMinerals SA', origin: 'Zambia' },
      graphite: { percentage: 20.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      aluminum: { percentage: 8.0, supplier: 'EuroAlum AG', origin: 'Norway' },
      copper: { percentage: 6.0, supplier: 'CopperMine EU', origin: 'Poland' },
      other: { percentage: 7.8 },
    },
    carbonFootprint: 85.4,
    ghgEmissions: 72.3,
    manufacturingSiteEmissions: 13.1,
    recycledContent: 22.5,
    recyclingInfo: 'EU Battery Regulation compliant recycling process. Contact recycling@voltaics.de',
    circularityScore: 78,
    status: 'PUBLISHED',
    createdById: manufacturer.id,
    approvedById: admin.id,
    submittedAt: new Date('2024-02-01'),
    approvedAt: new Date('2024-02-10'),
    publishedAt: new Date('2024-02-12'),
    warrantyStart: new Date('2024-01-15'),
    warrantyEnd: new Date('2032-01-15'),
    warrantyKm: 300000,
    blockchainHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    blockchainTx: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    lifecycleEvents: [
      { event: 'MANUFACTURED', date: '2024-01-15', location: 'Wolfsburg, Germany' },
      { event: 'QUALITY_CHECK', date: '2024-01-20', location: 'TÜV Lab, Munich' },
      { event: 'SHIPPED', date: '2024-01-25', location: 'Hamburg Port' },
      { event: 'INSTALLED', date: '2024-02-05', location: 'Berlin, Germany' },
    ],
    certificates: [
      { type: 'CE_MARKING', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-01-20'), expiryDate: new Date('2027-01-20'), status: 'COMPLIANT' },
      { type: 'UN38.3', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-01-22'), expiryDate: new Date('2027-01-22'), status: 'COMPLIANT' },
      { type: 'ISO_14001', issuer: 'Bureau Veritas', issuedDate: new Date('2023-06-01'), expiryDate: new Date('2026-06-01'), status: 'COMPLIANT' },
      { type: 'EU_BATTERY_REG', issuer: 'European Compliance Body', issuedDate: new Date('2024-02-08'), expiryDate: new Date('2027-02-08'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer.id, details: 'Battery passport created for VoltPack Ultra 100', createdAt: new Date('2024-01-16') },
      { action: 'UPDATED', actorId: manufacturer.id, details: 'Material composition and carbon footprint data added', createdAt: new Date('2024-01-25') },
      { action: 'SUBMITTED', actorId: manufacturer.id, details: 'Passport submitted for regulatory approval', createdAt: new Date('2024-02-01') },
      { action: 'APPROVED', actorId: admin.id, details: 'Passport approved after compliance review', createdAt: new Date('2024-02-10') },
      { action: 'PUBLISHED', actorId: admin.id, details: 'Passport published to public registry', createdAt: new Date('2024-02-12') },
    ],
  });

  // ─── Passport 2: PUBLISHED Industrial Battery ─────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000002',
    serialNumber: 'ECO-IND-LFP-2024-002',
    model: 'EcoPower Industrial 200',
    batteryType: 'INDUSTRIAL',
    chemistry: 'LFP',
    productionDate: new Date('2024-02-20'),
    intendedUse: 'Industrial Energy Storage System',
    capacity: 200.0,
    nominalVoltage: 48.0,
    countryOfOrigin: 'Netherlands',
    materialComposition: {
      lithium: { percentage: 5.8, supplier: 'LithiumSource Asia', origin: 'Australia' },
      iron: { percentage: 28.0, supplier: 'EuroSteel NL', origin: 'Netherlands' },
      phosphate: { percentage: 22.0, supplier: 'PhosphateEU', origin: 'Morocco' },
      graphite: { percentage: 18.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      aluminum: { percentage: 12.0, supplier: 'EuroAlum AG', origin: 'Norway' },
      copper: { percentage: 7.0, supplier: 'CopperMine EU', origin: 'Poland' },
      other: { percentage: 7.2 },
    },
    carbonFootprint: 62.1,
    ghgEmissions: 54.8,
    manufacturingSiteEmissions: 7.3,
    recycledContent: 31.0,
    recyclingInfo: 'LFP chemistry enables safe and efficient end-of-life processing',
    circularityScore: 85,
    status: 'PUBLISHED',
    createdById: manufacturer2.id,
    approvedById: admin.id,
    submittedAt: new Date('2024-03-05'),
    approvedAt: new Date('2024-03-15'),
    publishedAt: new Date('2024-03-18'),
    warrantyStart: new Date('2024-02-20'),
    warrantyEnd: new Date('2034-02-20'),
    blockchainHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    blockchainTx: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901',
    lifecycleEvents: [
      { event: 'MANUFACTURED', date: '2024-02-20', location: 'Rotterdam, Netherlands' },
      { event: 'QUALITY_CHECK', date: '2024-02-28', location: 'TÜV Lab, Cologne' },
      { event: 'INSTALLED', date: '2024-03-20', location: 'Amsterdam, Netherlands' },
    ],
    certificates: [
      { type: 'CE_MARKING', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-02-28'), expiryDate: new Date('2027-02-28'), status: 'COMPLIANT' },
      { type: 'IEC_62619', issuer: 'Bureau Veritas', issuedDate: new Date('2024-03-01'), expiryDate: new Date('2027-03-01'), status: 'COMPLIANT' },
      { type: 'EU_BATTERY_REG', issuer: 'European Compliance Body', issuedDate: new Date('2024-03-12'), expiryDate: new Date('2027-03-12'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer2.id, details: 'Battery passport created for EcoPower Industrial 200', createdAt: new Date('2024-02-21') },
      { action: 'SUBMITTED', actorId: manufacturer2.id, details: 'Passport submitted for regulatory approval', createdAt: new Date('2024-03-05') },
      { action: 'APPROVED', actorId: admin.id, details: 'Passport approved - all compliance requirements met', createdAt: new Date('2024-03-15') },
      { action: 'PUBLISHED', actorId: admin.id, details: 'Passport published to public registry', createdAt: new Date('2024-03-18') },
    ],
  });

  // ─── Passport 3: APPROVED Battery ─────────────────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000003',
    serialNumber: 'VLT-EV-NCA-2024-003',
    model: 'VoltPack Sport 75',
    batteryType: 'EV',
    chemistry: 'NCA',
    productionDate: new Date('2024-03-10'),
    intendedUse: 'High-performance Electric Vehicle Battery',
    capacity: 75.0,
    nominalVoltage: 400.0,
    countryOfOrigin: 'Germany',
    materialComposition: {
      lithium: { percentage: 7.5, supplier: 'LithiumSource Asia', origin: 'Argentina' },
      nickel: { percentage: 38.0, supplier: 'Nordic Nickel AS', origin: 'Finland' },
      cobalt: { percentage: 9.0, supplier: 'EthicalMinerals SA', origin: 'Zambia' },
      aluminum: { percentage: 3.0, supplier: 'EuroAlum AG', origin: 'Norway' },
      graphite: { percentage: 21.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      copper: { percentage: 7.0, supplier: 'CopperMine EU', origin: 'Poland' },
      other: { percentage: 14.5 },
    },
    carbonFootprint: 91.2,
    ghgEmissions: 78.6,
    manufacturingSiteEmissions: 12.6,
    recycledContent: 18.0,
    recyclingInfo: 'NCA chemistry requires specialized recycling - use certified partner network',
    circularityScore: 71,
    status: 'APPROVED',
    createdById: manufacturer.id,
    approvedById: admin.id,
    submittedAt: new Date('2024-04-01'),
    approvedAt: new Date('2024-04-12'),
    warrantyStart: new Date('2024-03-10'),
    warrantyEnd: new Date('2032-03-10'),
    warrantyKm: 250000,
    certificates: [
      { type: 'CE_MARKING', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-03-20'), expiryDate: new Date('2027-03-20'), status: 'COMPLIANT' },
      { type: 'UN38.3', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-03-22'), expiryDate: new Date('2027-03-22'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer.id, details: 'Battery passport created for VoltPack Sport 75', createdAt: new Date('2024-03-11') },
      { action: 'SUBMITTED', actorId: manufacturer.id, details: 'Passport submitted for regulatory approval', createdAt: new Date('2024-04-01') },
      { action: 'APPROVED', actorId: admin.id, details: 'Passport approved, pending publication', createdAt: new Date('2024-04-12') },
    ],
  });

  // ─── Passport 4: SUBMITTED Battery ────────────────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000004',
    serialNumber: 'ECO-STAT-LFP-2024-004',
    model: 'EcoPower Stationary 500',
    batteryType: 'STATIONARY',
    chemistry: 'LFP',
    productionDate: new Date('2024-04-05'),
    intendedUse: 'Grid-scale Energy Storage System',
    capacity: 500.0,
    nominalVoltage: 800.0,
    countryOfOrigin: 'Netherlands',
    materialComposition: {
      lithium: { percentage: 5.5, supplier: 'LithiumSource Asia', origin: 'Australia' },
      iron: { percentage: 30.0, supplier: 'EuroSteel NL', origin: 'Netherlands' },
      phosphate: { percentage: 23.5, supplier: 'PhosphateEU', origin: 'Morocco' },
      graphite: { percentage: 18.5, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      aluminum: { percentage: 10.0, supplier: 'EuroAlum AG', origin: 'Norway' },
      other: { percentage: 12.5 },
    },
    carbonFootprint: 58.7,
    ghgEmissions: 51.2,
    manufacturingSiteEmissions: 7.5,
    recycledContent: 34.0,
    recyclingInfo: 'LFP chemistry - EU compliant end-of-life processing available',
    circularityScore: 88,
    status: 'SUBMITTED',
    createdById: manufacturer2.id,
    submittedAt: new Date('2024-05-01'),
    certificates: [
      { type: 'IEC_62619', issuer: 'Bureau Veritas', issuedDate: new Date('2024-04-20'), expiryDate: new Date('2027-04-20'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer2.id, details: 'Battery passport created for EcoPower Stationary 500', createdAt: new Date('2024-04-06') },
      { action: 'UPDATED', actorId: manufacturer2.id, details: 'Carbon footprint data updated with lifecycle assessment', createdAt: new Date('2024-04-20') },
      { action: 'SUBMITTED', actorId: manufacturer2.id, details: 'Passport submitted for regulatory review', createdAt: new Date('2024-05-01') },
    ],
  });

  // ─── Passport 5: REJECTED Battery ─────────────────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000005',
    serialNumber: 'VLT-EV-NMC-2024-005',
    model: 'VoltPack Economy 60',
    batteryType: 'EV',
    chemistry: 'NMC-622',
    productionDate: new Date('2024-05-15'),
    intendedUse: 'Entry-level Electric Vehicle Battery',
    capacity: 60.0,
    nominalVoltage: 355.0,
    countryOfOrigin: 'Germany',
    materialComposition: {
      lithium: { percentage: 6.8, supplier: 'Unknown', origin: 'Unknown' },
      nickel: { percentage: 29.0, supplier: 'Nordic Nickel AS', origin: 'Finland' },
      manganese: { percentage: 14.5, supplier: 'MangaCorp EU', origin: 'Sweden' },
      cobalt: { percentage: 14.5, supplier: 'Unknown', origin: 'DRC' },
      graphite: { percentage: 19.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      other: { percentage: 16.2 },
    },
    carbonFootprint: 105.3,
    ghgEmissions: 92.1,
    manufacturingSiteEmissions: 13.2,
    recycledContent: 8.0,
    recyclingInfo: 'Standard recycling process',
    circularityScore: 52,
    status: 'REJECTED',
    createdById: manufacturer.id,
    submittedAt: new Date('2024-06-01'),
    rejectedAt: new Date('2024-06-15'),
    rejectionReason: 'Insufficient cobalt supply chain documentation. Conflict mineral origin (DRC) requires enhanced due diligence report per EU regulation. Recycled content below 10% threshold. Carbon footprint calculation methodology not compliant with EN 50604 standard.',
    certificates: [
      { type: 'CE_MARKING', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-05-25'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer.id, details: 'Battery passport created for VoltPack Economy 60', createdAt: new Date('2024-05-16') },
      { action: 'SUBMITTED', actorId: manufacturer.id, details: 'Passport submitted for regulatory approval', createdAt: new Date('2024-06-01') },
      { action: 'REJECTED', actorId: admin.id, details: 'Passport rejected due to supply chain compliance issues', createdAt: new Date('2024-06-15') },
    ],
  });

  // ─── Passport 6: DRAFT Battery ────────────────────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000006',
    serialNumber: 'VLT-IND-NMC-2024-006',
    model: 'VoltPack Industrial 150',
    batteryType: 'INDUSTRIAL',
    chemistry: 'NMC-532',
    productionDate: new Date('2024-06-20'),
    intendedUse: 'Heavy Industrial Equipment Battery',
    capacity: 150.0,
    nominalVoltage: 96.0,
    countryOfOrigin: 'Germany',
    materialComposition: {
      lithium: { percentage: 7.0, supplier: 'LithiumSource Asia', origin: 'Chile' },
      nickel: { percentage: 26.5, supplier: 'Nordic Nickel AS', origin: 'Finland' },
      manganese: { percentage: 16.0, supplier: 'MangaCorp EU', origin: 'Sweden' },
      cobalt: { percentage: 10.5, supplier: 'EthicalMinerals SA', origin: 'Zambia' },
      graphite: { percentage: 20.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      other: { percentage: 20.0 },
    },
    carbonFootprint: 88.9,
    ghgEmissions: 76.4,
    manufacturingSiteEmissions: 12.5,
    recycledContent: 19.5,
    recyclingInfo: 'Contact recycling@voltaics.de for end-of-life processing',
    circularityScore: 74,
    status: 'DRAFT',
    createdById: manufacturer.id,
    certificates: [],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer.id, details: 'Battery passport created for VoltPack Industrial 150', createdAt: new Date('2024-06-21') },
      { action: 'UPDATED', actorId: manufacturer.id, details: 'Technical specifications added', createdAt: new Date('2024-06-25') },
    ],
  });

  // ─── Passport 7: PUBLISHED Stationary Battery ────────────────────────────
  await createPassport({
    passportId: 'BAT-2024-000007',
    serialNumber: 'ECO-STAT-LFP-2024-007',
    model: 'EcoPower Home 10',
    batteryType: 'STATIONARY',
    chemistry: 'LFP',
    productionDate: new Date('2024-07-08'),
    intendedUse: 'Residential Energy Storage (Solar)',
    capacity: 10.0,
    nominalVoltage: 48.0,
    countryOfOrigin: 'Netherlands',
    materialComposition: {
      lithium: { percentage: 5.6, supplier: 'LithiumSource Asia', origin: 'Australia' },
      iron: { percentage: 29.5, supplier: 'EuroSteel NL', origin: 'Netherlands' },
      phosphate: { percentage: 23.0, supplier: 'PhosphateEU', origin: 'Morocco' },
      graphite: { percentage: 19.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      aluminum: { percentage: 11.0, supplier: 'EuroAlum AG', origin: 'Norway' },
      other: { percentage: 11.9 },
    },
    carbonFootprint: 45.2,
    ghgEmissions: 38.7,
    manufacturingSiteEmissions: 6.5,
    recycledContent: 38.0,
    recyclingInfo: 'Take-back program available through authorized dealers. LFP safe recycling.',
    circularityScore: 91,
    status: 'PUBLISHED',
    createdById: manufacturer2.id,
    approvedById: admin.id,
    submittedAt: new Date('2024-07-20'),
    approvedAt: new Date('2024-07-28'),
    publishedAt: new Date('2024-07-30'),
    warrantyStart: new Date('2024-07-08'),
    warrantyEnd: new Date('2034-07-08'),
    blockchainHash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    blockchainTx: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789012',
    lifecycleEvents: [
      { event: 'MANUFACTURED', date: '2024-07-08', location: 'Rotterdam, Netherlands' },
      { event: 'QUALITY_CHECK', date: '2024-07-15', location: 'TÜV Lab, Cologne' },
      { event: 'SHIPPED', date: '2024-07-22', location: 'Rotterdam Port' },
    ],
    certificates: [
      { type: 'CE_MARKING', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-07-15'), expiryDate: new Date('2027-07-15'), status: 'COMPLIANT' },
      { type: 'IEC_62619', issuer: 'Bureau Veritas', issuedDate: new Date('2024-07-16'), expiryDate: new Date('2027-07-16'), status: 'COMPLIANT' },
      { type: 'EU_BATTERY_REG', issuer: 'European Compliance Body', issuedDate: new Date('2024-07-25'), expiryDate: new Date('2027-07-25'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer2.id, details: 'Battery passport created for EcoPower Home 10', createdAt: new Date('2024-07-09') },
      { action: 'SUBMITTED', actorId: manufacturer2.id, details: 'Passport submitted for regulatory approval', createdAt: new Date('2024-07-20') },
      { action: 'APPROVED', actorId: admin.id, details: 'Excellent compliance scores - approved', createdAt: new Date('2024-07-28') },
      { action: 'PUBLISHED', actorId: admin.id, details: 'Passport published to public registry', createdAt: new Date('2024-07-30') },
    ],
  });

  // ─── Passport 8: DRAFT Battery (resubmit after rejection) ────────────────
  await createPassport({
    passportId: 'BAT-2024-000008',
    serialNumber: 'VLT-EV-NMC-2024-008',
    model: 'VoltPack Economy 60 v2',
    batteryType: 'EV',
    chemistry: 'NMC-622',
    productionDate: new Date('2024-08-01'),
    intendedUse: 'Entry-level Electric Vehicle Battery - Revised',
    capacity: 60.0,
    nominalVoltage: 355.0,
    countryOfOrigin: 'Germany',
    materialComposition: {
      lithium: { percentage: 6.8, supplier: 'LithiumSource Asia', origin: 'Chile' },
      nickel: { percentage: 29.0, supplier: 'Nordic Nickel AS', origin: 'Finland' },
      manganese: { percentage: 14.5, supplier: 'MangaCorp EU', origin: 'Sweden' },
      cobalt: { percentage: 14.5, supplier: 'EthicalMinerals SA', origin: 'Zambia' },
      graphite: { percentage: 19.0, supplier: 'SyntheticGraph GmbH', origin: 'Germany' },
      other: { percentage: 16.2 },
    },
    carbonFootprint: 89.4,
    ghgEmissions: 76.2,
    manufacturingSiteEmissions: 13.2,
    recycledContent: 16.0,
    recyclingInfo: 'EU compliant recycling via certified partner network. Due diligence report attached.',
    circularityScore: 67,
    status: 'DRAFT',
    createdById: manufacturer.id,
    certificates: [
      { type: 'CE_MARKING', issuer: 'TÜV Battery Testing GmbH', issuedDate: new Date('2024-08-10'), expiryDate: new Date('2027-08-10'), status: 'COMPLIANT' },
      { type: 'CONFLICT_MINERALS', issuer: 'Responsible Minerals Initiative', issuedDate: new Date('2024-08-12'), expiryDate: new Date('2027-08-12'), status: 'COMPLIANT' },
    ],
    auditActions: [
      { action: 'CREATED', actorId: manufacturer.id, details: 'Revised battery passport created after previous rejection', createdAt: new Date('2024-08-02') },
      { action: 'UPDATED', actorId: manufacturer.id, details: 'Added conflict minerals due diligence documentation', createdAt: new Date('2024-08-12') },
      { action: 'UPDATED', actorId: manufacturer.id, details: 'Carbon footprint recalculated using EN 50604 compliant methodology', createdAt: new Date('2024-08-15') },
    ],
  });

  console.log('✅ Battery Passports seeded (8 passports)');
  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Seeded users:');
  console.log('  admin@batterypassport.eu       | ADMIN');
  console.log('  manufacturer@voltaics.de       | MANUFACTURER');
  console.log('  ops@ecopower.nl                | MANUFACTURER');
  console.log('  lab@tuv-testing.de             | TESTING_LABORATORY');
  console.log('  sustainability@greenchain.eu   | SUSTAINABILITY_TEAM');
  console.log('  supply@lithiumsource.cn        | MATERIAL_SUPPLIER');
  console.log('  Password for all: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
