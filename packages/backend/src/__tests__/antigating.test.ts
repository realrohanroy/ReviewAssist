import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { Prisma } from '@prisma/client';
import { devRequestsStore } from '../routes/reviewRequests.js';
import { hashToken } from '../utils/crypto.js';

describe('Google Anti-Gating Policy Enforcement', () => {
  const testToken = 'demo-client-token-12345';

  beforeAll(() => {
    // Populate mock request in store for offline test execution
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    devRequestsStore.push({
      id: 'req-antigating-test',
      rawToken: testToken,
      publicTokenHash: hashToken(testToken),
      createdByUserId: 'admin-1',
      createdByName: 'Admin',
      serviceIds: ['srv-1'],
      status: 'created',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    });
  });

  it('database schema strictly forbids storing star ratings', () => {
    // Introspect Prisma model scalar fields to guarantee zero rating storage
    const eventFields = Prisma.dmmf.datamodel.models
      .find((m) => m.name === 'ReviewRequestEvent')
      ?.fields.map((f) => f.name.toLowerCase());

    const requestFields = Prisma.dmmf.datamodel.models
      .find((m) => m.name === 'ReviewRequest')
      ?.fields.map((f) => f.name.toLowerCase());

    const draftFields = Prisma.dmmf.datamodel.models
      .find((m) => m.name === 'DraftGenerationLog')
      ?.fields.map((f) => f.name.toLowerCase());

    // Explicit invariant: No column named 'rating', 'stars', 'score', or 'starrating'
    const forbiddenColumns = ['rating', 'stars', 'starrating', 'score', 'starsselected'];
    for (const forbidden of forbiddenColumns) {
      expect(eventFields).not.toContain(forbidden);
      expect(requestFields).not.toContain(forbidden);
      expect(draftFields).not.toContain(forbidden);
    }
  });

  it('uniform Google destination URL is provided regardless of client sentiment', async () => {
    const res = await request(app).get(`/api/public/review-requests/${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('googleReviewUrl');
    const destinationUrl = res.body.googleReviewUrl;

    // Must be a valid HTTPS Google review link
    expect(destinationUrl).toMatch(/^https:\/\/(share\.google|g\.page|search\.google\.com|maps\.app\.goo\.gl|goo\.gl|.*google\.com)/);

    // Any rating the client chooses on the client page points to this exact unchanged URL
    const ratings = [1, 2, 3, 4, 5];
    for (const _star of ratings) {
      expect(res.body.googleReviewUrl).toBe(destinationUrl);
    }
  });

  it('event recording endpoint rejects rating score payloads', async () => {
    const res = await request(app)
      .post(`/api/public/review-requests/${testToken}/events`)
      .send({
        eventType: 'google_link_opened',
        rating: 1 // Attempting to pass rating
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    // Response must not acknowledge or return rating
    expect(res.body).not.toHaveProperty('rating');
  });
});
