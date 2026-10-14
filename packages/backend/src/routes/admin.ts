import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { isValidGoogleReviewUrl } from '../utils/validators.js';
import { prisma } from '../db.js';
import { devRequestsStore } from './reviewRequests.js';

export const adminRouter = Router();

// Apply auth + admin guards to all /api/admin routes
adminRouter.use(requireAuth, requireAdmin);

// In-memory dev fallbacks if database is disconnected
const devSettings = {
  id: 'default',
  companyName: 'SME Experts',
  logoUrl: null as string | null,
  googleReviewUrl: 'https://g.page/r/CQggM93k8GK1EBM/review',
  clientIntroMessage: 'Thank you for choosing SME Experts. We would appreciate your genuine feedback.',
  aiDraftingEnabled: true,
  defaultLanguage: 'en'
};

const devServices = [
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

const devUsers = [
  { id: 'seed-admin-uuid', name: 'System Admin', email: 'admin@smeexperts.com', role: 'admin', isActive: true },
  { id: 'emp-1', name: 'Sarah Jenkins', email: 'sarah.j@smeexperts.com', role: 'employee', isActive: true },
  { id: 'emp-2', name: 'David Chen', email: 'david.c@smeexperts.com', role: 'employee', isActive: true }
];

/* -------------------------------------------------------------------------- */
/*                                SETTINGS                                    */
/* -------------------------------------------------------------------------- */

// GET /api/admin/settings
adminRouter.get('/settings', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 'default' } });
    res.json(settings || devSettings);
  } catch {
    res.json(devSettings);
  }
});

// PATCH /api/admin/settings
adminRouter.patch('/settings', async (req: Request, res: Response): Promise<void> => {
  const { companyName, logoUrl, googleReviewUrl, clientIntroMessage, aiDraftingEnabled } = req.body;

  if (googleReviewUrl !== undefined && googleReviewUrl.trim() !== '') {
    if (!isValidGoogleReviewUrl(googleReviewUrl)) {
      res.status(400).json({
        error: 'invalid_url',
        message: 'Google review link must be a valid secure HTTPS Google URL (e.g. https://g.page/r/.../review or https://search.google.com/local/writereview...)'
      });
      return;
    }
  }

  const updateData: Record<string, unknown> = {};
  if (companyName !== undefined) updateData.companyName = companyName.trim();
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl ? logoUrl.trim() : null;
  if (googleReviewUrl !== undefined) updateData.googleReviewUrl = googleReviewUrl.trim();
  if (clientIntroMessage !== undefined) updateData.clientIntroMessage = clientIntroMessage.trim();
  if (aiDraftingEnabled !== undefined) updateData.aiDraftingEnabled = Boolean(aiDraftingEnabled);

  try {
    const updated = await prisma.appSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        companyName: companyName || devSettings.companyName,
        googleReviewUrl: googleReviewUrl || devSettings.googleReviewUrl,
        aiDraftingEnabled: aiDraftingEnabled ?? devSettings.aiDraftingEnabled,
        ...updateData
      }
    });
    res.json(updated);
  } catch {
    Object.assign(devSettings, updateData);
    res.json(devSettings);
  }
});

/* -------------------------------------------------------------------------- */
/*                                SERVICES                                    */
/* -------------------------------------------------------------------------- */

// GET /api/admin/services
adminRouter.get('/services', async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(services.length > 0 ? services : devServices);
  } catch {
    res.json(devServices);
  }
});

// POST /api/admin/services - Add service
adminRouter.post('/services', async (req: Request, res: Response): Promise<void> => {
  const { name, description, reviewContext, sortOrder } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: 'Service name is required.' });
    return;
  }

  try {
    const created = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        reviewContext: reviewContext?.trim() || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: true
      }
    });
    res.status(201).json(created);
  } catch {
    const mock = {
      id: `srv-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      reviewContext: reviewContext?.trim() || '',
      isActive: true,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : devServices.length + 1
    };
    devServices.push(mock);
    res.status(201).json(mock);
  }
});

// PATCH /api/admin/services/:id - Edit service or toggle active
adminRouter.patch('/services/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, reviewContext, isActive, sortOrder } = req.body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (reviewContext !== undefined) updateData.reviewContext = reviewContext.trim();
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: updateData
    });
    res.json(updated);
  } catch {
    const svc = devServices.find((s) => s.id === id);
    if (!svc) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }
    Object.assign(svc, updateData);
    res.json(svc);
  }
});

/* -------------------------------------------------------------------------- */
/*                                 USERS                                      */
/* -------------------------------------------------------------------------- */

// GET /api/admin/users
adminRouter.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users.length > 0 ? users : devUsers);
  } catch {
    res.json(devUsers);
  }
});

// POST /api/admin/users - Add user
adminRouter.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const roleValue = role === 'admin' ? 'admin' : 'employee';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: roleValue,
        isActive: true
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    res.status(201).json(created);
  } catch {
    const mock = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: roleValue,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    devUsers.push(mock);
    res.status(201).json(mock);
  }
});

// PATCH /api/admin/users/:id - Update role or active state
adminRouter.patch('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  const updateData: Record<string, unknown> = {};
  if (role !== undefined) updateData.role = role === 'admin' ? 'admin' : 'employee';
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true, updatedAt: true }
    });
    res.json(updated);
  } catch {
    const usr = devUsers.find((u) => u.id === id);
    if (!usr) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    Object.assign(usr, updateData);
    res.json(usr);
  }
});

/* -------------------------------------------------------------------------- */
/*                               REPORTING                                    */
/* -------------------------------------------------------------------------- */

// GET /api/admin/reporting
adminRouter.get('/reporting', async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalRequests = await prisma.reviewRequest.count();
    const openedRequests = await prisma.reviewRequest.count({
      where: { status: { in: ['opened', 'drafting_started', 'google_link_opened'] } }
    });
    const googleOpenedRequests = await prisma.reviewRequest.count({
      where: { status: 'google_link_opened' }
    });
    const revokedRequests = await prisma.reviewRequest.count({
      where: { status: 'revoked' }
    });

    res.json({
      summary: {
        totalRequests,
        openedRequests,
        googleOpenedRequests,
        revokedRequests,
        openRate: totalRequests > 0 ? Math.round((openedRequests / totalRequests) * 100) : 0,
        conversionRate: totalRequests > 0 ? Math.round((googleOpenedRequests / totalRequests) * 100) : 0
      }
    });
  } catch {
    const total = devRequestsStore.length;
    const opened = devRequestsStore.filter((r) => r.status !== 'created' && r.status !== 'revoked').length;
    const google = devRequestsStore.filter((r) => r.status === 'google_link_opened').length;
    const revoked = devRequestsStore.filter((r) => r.status === 'revoked').length;

    res.json({
      summary: {
        totalRequests: total,
        openedRequests: opened,
        googleOpenedRequests: google,
        revokedRequests: revoked,
        openRate: total > 0 ? Math.round((opened / total) * 100) : 0,
        conversionRate: total > 0 ? Math.round((google / total) * 100) : 0
      }
    });
  }
});
