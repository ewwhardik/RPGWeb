import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/user/prestige/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb({
      user: { update: vi.fn().mockResolvedValue({ id: '1', level: 1, xp: 0, prestigeLevel: 1 }) },
      userStats: { update: vi.fn() },
      activityLog: { create: vi.fn() },
    })),
  },
}));

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

describe('Prestige API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    vi.mocked(requireAuth).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/user/prestige', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects if user level is below 50', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: '1', email: 'test@hero.realm', username: 'TestHero' });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', level: 49 } as never);
    
    const req = new NextRequest('http://localhost/api/user/prestige', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Must be level 50/);
  });

  it('allows prestige at level 50', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: '1', email: 'test@hero.realm', username: 'TestHero' });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', level: 50, prestigeLevel: 0, stats: {} } as never);
    
    const req = new NextRequest('http://localhost/api/user/prestige', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
