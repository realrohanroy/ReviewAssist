import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. AppSettings singleton
  await prisma.appSettings.upsert({
    where: { id: 'default' },
    update: {
      googleReviewUrl: 'https://g.page/r/CQggM93k8GK1EBM/review'
    },
    create: {
      id: 'default',
      companyName: 'SME Experts',
      logoUrl: null,
      googleReviewUrl: 'https://g.page/r/CQggM93k8GK1EBM/review',
      clientIntroMessage: 'Thank you for choosing SME Experts. We would appreciate your genuine feedback.',
      aiDraftingEnabled: true,
      defaultLanguage: 'en'
    }
  });
  console.log('✓ Default AppSettings ensured');

  // 2. Admin User
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smeexperts.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@smeexperts.com',
      passwordHash,
      role: Role.admin,
      isActive: true
    }
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  // 3. Team Members
  const employeeSeedData = [
    { name: 'Saksham Gupta', email: 'saksham.g@smeexperts.com' },
    { name: 'Rohan Roy', email: 'rohan.r@smeexperts.com' },
    { name: 'Sachin', email: 'sachin@smeexperts.com' },
    { name: 'Chirag', email: 'chirag@smeexperts.com' },
    { name: 'Arshad', email: 'arshad@smeexperts.com' },
    { name: 'Rhitika', email: 'rhitika@smeexperts.com' },
    { name: 'Shubham', email: 'shubham@smeexperts.com' },
    { name: 'Mayur', email: 'mayur@smeexperts.com' },
    { name: 'Ravi', email: 'ravi@smeexperts.com' }
  ];

  for (const emp of employeeSeedData) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: { name: emp.name },
      create: {
        name: emp.name,
        email: emp.email,
        passwordHash,
        role: Role.employee,
        isActive: true
      }
    });
  }
  console.log(`✓ Seeded ${employeeSeedData.length} team members`);

  // 4. Sample Services
  const sampleServices = [
    {
      name: 'Business Advisory & Consultation',
      description: 'Strategic planning, financial modeling, and growth advisory.',
      reviewContext: 'Provided comprehensive business growth and advisory consultation.',
      sortOrder: 1
    },
    {
      name: 'Tax & Compliance Filing',
      description: 'Corporate and personal tax structuring, filing, and GST compliance.',
      reviewContext: 'Handled corporate tax filing and statutory compliance on time.',
      sortOrder: 2
    },
    {
      name: 'Financial Audit & Assurance',
      description: 'Statutory audit, internal controls review, and assurance reporting.',
      reviewContext: 'Conducted rigorous financial audit and delivered assurance report.',
      sortOrder: 3
    }
  ];

  for (const svc of sampleServices) {
    const existing = await prisma.service.findFirst({ where: { name: svc.name } });
    if (!existing) {
      await prisma.service.create({ data: svc });
    }
  }
  console.log(`✓ Seeded ${sampleServices.length} default service offerings`);
  console.log('🌱 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
