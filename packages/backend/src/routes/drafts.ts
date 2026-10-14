import { Router, Request, Response } from 'express';
import { hashToken } from '../utils/crypto.js';
import { prisma } from '../db.js';
import { generateReviewDrafts } from '../services/ai.js';
import { devRequestsStore } from './reviewRequests.js';

export const draftsRouter = Router();

// In-memory rate limiter: tokenHash -> timestamps[]
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(tokenHash: string): boolean {
  const now = Date.now();
  const timestamps = rateLimits.get(tokenHash) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimits.set(tokenHash, recent);
  return false;
}

// POST /api/public/review-requests/:token/drafts
draftsRouter.post('/:token/drafts', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { clientNotes } = req.body;

  if (!token) {
    res.status(400).json({ error: 'Token is required.' });
    return;
  }

  const tokenHash = hashToken(token);

  if (isRateLimited(tokenHash)) {
    res.status(429).json({
      error: 'rate_limited',
      message: 'Too many draft generation attempts. Please wait a few minutes before trying again.'
    });
    return;
  }

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

    if (request.status === 'revoked' || new Date() > new Date(request.expiresAt)) {
      res.status(410).json({ error: 'inactive', message: 'This review request is expired or revoked.' });
      return;
    }

    // Company Settings
    const settings = await prisma.appSettings.findUnique({ where: { id: 'default' } });
    const companyName = settings?.companyName || 'SME Experts';

    // Services
    const services = await prisma.service.findMany({
      where: { id: { in: request.serviceIds } },
      select: { name: true, description: true, reviewContext: true }
    });

    const aiResult = await generateReviewDrafts({
      companyName,
      services: services.length > 0 ? services : [{ name: 'Consultation & Advisory' }],
      employeeName: request.attributedEmployee?.name || null,
      clientNotes: clientNotes?.trim() || null
    });

    // Telemetry log in DraftGenerationLog (deliberately omitting draft text)
    try {
      await prisma.draftGenerationLog.create({
        data: {
          requestId: request.id,
          promptTokens: aiResult.promptTokens || null,
          completionTokens: aiResult.completionTokens || null,
          latencyMs: aiResult.latencyMs,
          status: 'success'
        }
      });

      if (request.status === 'created' || request.status === 'opened') {
        await prisma.reviewRequest.update({
          where: { id: request.id },
          data: { status: 'drafting_started' }
        });
      }
    } catch {
      // Non-blocking telemetry
    }

    res.json({
      suggestions: aiResult.suggestions,
      provider: aiResult.provider
    });
  } catch {
    // Dev fallback if database is offline
    const mock = devRequestsStore.find((r) => r.rawToken === token || r.publicTokenHash === tokenHash);
    if (!mock) {
      res.status(404).json({ error: 'not_found', message: 'Review request link not found.' });
      return;
    }

    const aiResult = await generateReviewDrafts({
      companyName: 'SME Experts',
      services: [
        {
          name: 'Business Advisory & Consultation',
          description: 'Strategic planning, financial modeling, and growth advisory.',
          reviewContext: 'Provided comprehensive business growth and advisory consultation.'
        }
      ],
      employeeName: mock.createdByName || null,
      clientNotes: clientNotes?.trim() || null
    });

    if (mock.status === 'created' || mock.status === 'opened') {
      mock.status = 'drafting_started';
    }

    res.json({
      suggestions: aiResult.suggestions,
      provider: aiResult.provider
    });
  }
});
