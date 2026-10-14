import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generatePublicToken } from '../utils/crypto.js';
import { prisma } from '../db.js';

export const reviewRequestsRouter = Router();

export interface DevRequest {
  id: string;
  publicTokenHash: string;
  rawToken: string;
  createdByUserId: string;
  createdByName: string;
  attributedEmployeeId?: string | null;
  serviceIds: string[];
  clientReference?: string | null;
  status: 'created' | 'opened' | 'drafting_started' | 'google_link_opened' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  googleLinkOpenedAt?: string | null;
}

export const devRequestsStore: DevRequest[] = [];

// Helper to construct public URL
function getPublicUrl(rawToken: string): string {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/review/${rawToken}`;
}

// POST /api/review-requests - Create a new review request
reviewRequestsRouter.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { serviceIds, attributedEmployeeId, clientReference } = req.body;
  const currentUser = req.user!;

  if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    res.status(400).json({ error: 'At least one service must be selected.' });
    return;
  }

  const { rawToken, tokenHash } = generatePublicToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30-day token lifetime

  const attributedId = attributedEmployeeId || currentUser.id;

  try {
    const created = await prisma.reviewRequest.create({
      data: {
        publicTokenHash: tokenHash,
        createdByUserId: currentUser.id,
        attributedEmployeeId: attributedId,
        serviceIds,
        clientReference: clientReference?.trim() || null,
        status: 'created',
        expiresAt
      }
    });

    res.status(201).json({
      id: created.id,
      publicUrl: getPublicUrl(rawToken),
      token: rawToken,
      status: created.status,
      serviceIds: created.serviceIds,
      clientReference: created.clientReference,
      createdAt: created.createdAt,
      expiresAt: created.expiresAt
    });
  } catch {
    // Dev fallback if DB is not reachable
    const mockRequest: DevRequest = {
      id: `req-${Date.now()}`,
      publicTokenHash: tokenHash,
      rawToken,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name,
      attributedEmployeeId: attributedId,
      serviceIds,
      clientReference: clientReference?.trim() || null,
      status: 'created',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      googleLinkOpenedAt: null
    };
    devRequestsStore.unshift(mockRequest);

    res.status(201).json({
      id: mockRequest.id,
      publicUrl: getPublicUrl(rawToken),
      token: rawToken,
      status: mockRequest.status,
      serviceIds: mockRequest.serviceIds,
      clientReference: mockRequest.clientReference,
      createdAt: mockRequest.createdAt,
      expiresAt: mockRequest.expiresAt
    });
  }
});

// GET /api/review-requests - List requests with RBAC filtering
reviewRequestsRouter.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user!;
  const isAdmin = currentUser.role === 'admin';

  try {
    const whereClause = isAdmin ? {} : { createdByUserId: currentUser.id };
    const requests = await prisma.reviewRequest.findMany({
      where: whereClause,
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        attributedEmployee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch {
    // Dev fallback
    const filtered = isAdmin
      ? devRequestsStore
      : devRequestsStore.filter((r) => r.createdByUserId === currentUser.id);

    const formatted = filtered.map((r) => ({
      id: r.id,
      status: r.status,
      serviceIds: r.serviceIds,
      clientReference: r.clientReference,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      revokedAt: r.revokedAt,
      googleLinkOpenedAt: r.googleLinkOpenedAt,
      publicUrl: getPublicUrl(r.rawToken),
      createdByUser: { id: r.createdByUserId, name: r.createdByName },
      attributedEmployee: { id: r.attributedEmployeeId || r.createdByUserId, name: r.createdByName }
    }));

    res.json(formatted);
  }
});

// GET /api/review-requests/:id - Inspect single request
reviewRequestsRouter.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    const request = await prisma.reviewRequest.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        attributedEmployee: { select: { id: true, name: true, email: true } },
        events: true
      }
    });

    if (!request) {
      res.status(404).json({ error: 'Review request not found.' });
      return;
    }

    if (currentUser.role !== 'admin' && request.createdByUserId !== currentUser.id) {
      res.status(403).json({ error: 'You do not have permission to view this review request.' });
      return;
    }

    res.json(request);
  } catch {
    const mock = devRequestsStore.find((r) => r.id === id);
    if (!mock) {
      res.status(404).json({ error: 'Review request not found.' });
      return;
    }
    if (currentUser.role !== 'admin' && mock.createdByUserId !== currentUser.id) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }
    res.json(mock);
  }
});

// POST /api/review-requests/:id/revoke - Revoke a request link
reviewRequestsRouter.post('/:id/revoke', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    const existing = await prisma.reviewRequest.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Review request not found.' });
      return;
    }

    if (currentUser.role !== 'admin' && existing.createdByUserId !== currentUser.id) {
      res.status(403).json({ error: 'You do not have permission to revoke this request.' });
      return;
    }

    const updated = await prisma.reviewRequest.update({
      where: { id },
      data: {
        status: 'revoked',
        revokedAt: new Date()
      }
    });

    res.json({ ok: true, status: updated.status, revokedAt: updated.revokedAt });
  } catch {
    const mock = devRequestsStore.find((r) => r.id === id);
    if (!mock) {
      res.status(404).json({ error: 'Review request not found.' });
      return;
    }
    if (currentUser.role !== 'admin' && mock.createdByUserId !== currentUser.id) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    mock.status = 'revoked';
    mock.revokedAt = new Date().toISOString();
    res.json({ ok: true, status: mock.status, revokedAt: mock.revokedAt });
  }
});
