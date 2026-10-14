import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const servicesRouter = Router();

// Default fallback catalog if database is not initialized
const FALLBACK_SERVICES = [
  {
    id: 'srv-1',
    name: 'Business Advisory & Consultation',
    description: 'Strategic planning, financial modeling, and growth advisory.',
    reviewContext: 'Provided comprehensive business growth and advisory consultation.',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'srv-2',
    name: 'Tax & Compliance Filing',
    description: 'Corporate and personal tax structuring, filing, and GST compliance.',
    reviewContext: 'Handled corporate tax filing and statutory compliance on time.',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'srv-3',
    name: 'Financial Audit & Assurance',
    description: 'Statutory audit, internal controls review, and assurance reporting.',
    reviewContext: 'Conducted rigorous financial audit and delivered assurance report.',
    isActive: true,
    sortOrder: 3
  }
];

const FALLBACK_EMPLOYEES = [
  { id: 'seed-admin-uuid', name: 'System Admin', email: 'admin@smeexperts.com', role: 'admin' },
  { id: 'emp-1', name: 'Sarah Jenkins', email: 'sarah.j@smeexperts.com', role: 'employee' },
  { id: 'emp-2', name: 'David Chen', email: 'david.c@smeexperts.com', role: 'employee' }
];

// GET /api/services - Active services
servicesRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(services.length > 0 ? services : FALLBACK_SERVICES);
  } catch {
    res.json(FALLBACK_SERVICES);
  }
});

// GET /api/employees - Active employees for attribution selector
servicesRouter.get('/employees', async (_req: Request, res: Response): Promise<void> => {
  try {
    const employees = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' }
    });
    res.json(employees.length > 0 ? employees : FALLBACK_EMPLOYEES);
  } catch {
    res.json(FALLBACK_EMPLOYEES);
  }
});
