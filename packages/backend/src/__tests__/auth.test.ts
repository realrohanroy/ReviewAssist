import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../utils/jwt.js';
import request from 'supertest';
import { app } from '../app.js';

describe('Authentication & RBAC Lifecycle', () => {
  it('hashes and securely verifies passwords with bcrypt', async () => {
    const rawPassword = 'SecurePassword!123';
    const hash = await bcrypt.hash(rawPassword, 10);

    expect(hash).not.toBe(rawPassword);
    expect(await bcrypt.compare(rawPassword, hash)).toBe(true);
    expect(await bcrypt.compare('WrongPassword', hash)).toBe(false);
  });

  it('generates and decodes JWT with valid claims', () => {
    const user = {
      userId: 'test-user-id',
      email: 'admin@smeexperts.com',
      role: 'admin' as const,
      name: 'System Admin'
    };

    const token = signToken(user);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(user.userId);
    expect(decoded?.email).toBe(user.email);
    expect(decoded?.role).toBe(user.role);
  });

  it('rejects tampered or malformed JWT tokens', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsig';
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('enforces 401 Unauthorized when accessing protected routes without session', async () => {
    const res = await request(app).get('/api/review-requests');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('enforces 403 Forbidden when employee accesses admin routes', async () => {
    const employeeToken = signToken({
      userId: 'emp-user-1',
      email: 'employee@smeexperts.com',
      role: 'employee',
      name: 'Test Employee'
    });

    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Administrator privileges required/);
  });

  it('permits administrator to access admin routes', async () => {
    const adminToken = signToken({
      userId: 'admin-user-1',
      email: 'admin@smeexperts.com',
      role: 'admin',
      name: 'System Admin'
    });

    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('companyName');
  });
});
