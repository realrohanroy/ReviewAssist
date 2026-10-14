import { Router, Request, Response } from 'express';
import { hashToken } from '../utils/crypto.js';
import { prisma } from '../db.js';
import { devRequestsStore } from './reviewRequests.js';

export const publicRouter = Router();

// Default fallback company settings
const DEFAULT_COMPANY_SETTINGS = {
  companyName: 'SME Experts',
  logoUrl: null,
  googleReviewUrl: 'https://g.page/r/CQggM93k8GK1EBM/review',
  clientIntroMessage: 'Thank you for choosing SME Experts. We would appreciate your genuine feedback.'
};

// GET /api/public/review-requests/:token - Safe client context
publicRouter.get('/:token', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  if (!token || token.trim().length === 0) {
    res.status(400).json({ error: 'Token is required.' });
    return;
  }

  const tokenHash = hashToken(token);

  try {
    const request = await prisma.reviewRequest.findUnique({
      where: { publicTokenHash: tokenHash },
      include: {
        attributedEmployee: { select: { name: true } }
      }
    });

    if (!request) {
      res.status(404).json({ error: 'not_found', message: 'Review request link not found.' });
      return;
    }

    if (request.status === 'revoked') {
      res.status(410).json({ error: 'revoked', message: 'This review link is no longer active.' });
      return;
    }

    if (new Date() > new Date(request.expiresAt)) {
      res.status(410).json({ error: 'expired', message: 'This review link has expired.' });
      return;
    }

    // Record request_opened event & update status to 'opened' if freshly created
    try {
      await prisma.reviewRequestEvent.create({
        data: {
          reviewRequestId: request.id,
          eventType: 'request_opened'
        }
      });

      if (request.status === 'created') {
        await prisma.reviewRequest.update({
          where: { id: request.id },
          data: { status: 'opened' }
        });
      }
    } catch {
      // Non-blocking telemetry
    }

    // Get company settings
    const settings = (await prisma.appSettings.findUnique({ where: { id: 'default' } })) || DEFAULT_COMPANY_SETTINGS;

    // Get service names
    const services = await prisma.service.findMany({
      where: { id: { in: request.serviceIds } },
      select: { id: true, name: true, description: true }
    });

    res.json({
      companyName: settings.companyName,
      logoUrl: settings.logoUrl,
      clientIntroMessage: settings.clientIntroMessage,
      googleReviewUrl: settings.googleReviewUrl || DEFAULT_COMPANY_SETTINGS.googleReviewUrl,
      services: services.length > 0 ? services : [{ id: 'srv-1', name: 'Delivered Consultation' }],
      attributedEmployeeName: request.attributedEmployee?.name || null
    });
  } catch {
    // Dev fallback when local PostgreSQL is offline
    const mock = devRequestsStore.find((r) => r.rawToken === token || r.publicTokenHash === tokenHash);

    if (!mock) {
      res.status(404).json({ error: 'not_found', message: 'Review request link not found.' });
      return;
    }

    if (mock.status === 'revoked') {
      res.status(410).json({ error: 'revoked', message: 'This review link is no longer active.' });
      return;
    }

    if (new Date() > new Date(mock.expiresAt)) {
      res.status(410).json({ error: 'expired', message: 'This review link has expired.' });
      return;
    }

    if (mock.status === 'created') {
      mock.status = 'opened';
    }

    res.json({
      companyName: DEFAULT_COMPANY_SETTINGS.companyName,
      logoUrl: DEFAULT_COMPANY_SETTINGS.logoUrl,
      clientIntroMessage: DEFAULT_COMPANY_SETTINGS.clientIntroMessage,
      googleReviewUrl: DEFAULT_COMPANY_SETTINGS.googleReviewUrl,
      services: [
        { id: 'srv-1', name: 'Business Advisory & Consultation' }
      ],
      attributedEmployeeName: mock.createdByName || 'Sarah Jenkins'
    });
  }
});

// POST /api/public/review-requests/:token/events - Record public interaction events
publicRouter.post('/:token/events', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { eventType } = req.body;

  const validEvents = ['request_opened', 'text_copied', 'google_link_opened'];
  if (!eventType || !validEvents.includes(eventType)) {
    res.status(400).json({ error: 'Invalid or missing eventType.' });
    return;
  }

  const tokenHash = hashToken(token);

  try {
    const request = await prisma.reviewRequest.findUnique({
      where: { publicTokenHash: tokenHash }
    });

    if (!request) {
      res.status(404).json({ error: 'Review request not found.' });
      return;
    }

    await prisma.reviewRequestEvent.create({
      data: {
        reviewRequestId: request.id,
        eventType
      }
    });

    if (eventType === 'google_link_opened') {
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: {
          status: 'google_link_opened',
          googleLinkOpenedAt: new Date()
        }
      });
    }

    res.json({ ok: true });
  } catch {
    // Dev fallback
    const mock = devRequestsStore.find((r) => r.rawToken === token || r.publicTokenHash === tokenHash);
    if (!mock) {
      res.status(404).json({ error: 'Review request not found.' });
      return;
    }

    if (eventType === 'google_link_opened') {
      mock.status = 'google_link_opened';
      mock.googleLinkOpenedAt = new Date().toISOString();
    }

    res.json({ ok: true, devFallback: true });
  }
});
