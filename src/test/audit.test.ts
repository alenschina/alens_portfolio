import { describe, it, expect, vi } from 'vitest'
import { AuditAction, createAuditLog, getClientIP, getClientUserAgent, logSuccess, logFailure } from '@/lib/audit'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}))

const { prisma } = await import('@/lib/prisma')
const mockCreate = vi.mocked(prisma.auditLog.create)

describe('Audit Utils', () => {
  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })

      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.1',
        },
      })

      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('should return unknown for missing headers', () => {
      const request = new Request('http://localhost')

      expect(getClientIP(request)).toBe('unknown')
    })
  })

  describe('getClientUserAgent', () => {
    it('should extract user agent', () => {
      const request = new Request('http://localhost', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      expect(getClientUserAgent(request)).toBe(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      )
    })

    it('should return unknown for missing user agent', () => {
      const request = new Request('http://localhost')

      expect(getClientUserAgent(request)).toBe('unknown')
    })
  })

  describe('createAuditLog', () => {
    it('should create audit log entry', async () => {
      mockCreate.mockResolvedValue({ id: '1' })

      await createAuditLog({
        action: AuditAction.IMAGE_CREATE,
        userId: 'user-123',
        resourceType: 'image',
        resourceId: 'img-123',
        details: { title: 'Test Image' },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Agent',
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          action: AuditAction.IMAGE_CREATE,
          userId: 'user-123',
          resourceType: 'image',
          resourceId: 'img-123',
          details: JSON.stringify({ title: 'Test Image' }),
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          timestamp: expect.any(Date),
        },
      })
    })

    it('should handle missing details', async () => {
      mockCreate.mockResolvedValue({ id: '1' })

      await createAuditLog({
        action: AuditAction.USER_LOGIN,
        userId: 'user-123',
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          action: AuditAction.USER_LOGIN,
          userId: 'user-123',
          resourceType: null,
          resourceId: null,
          details: null,
          ipAddress: null,
          userAgent: null,
          timestamp: expect.any(Date),
        },
      })
    })
  })

  describe('logSuccess', () => {
    it('should log successful operation', async () => {
      mockCreate.mockResolvedValue({ id: '1' })

      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Test Agent',
        },
      })

      await logSuccess(
        request,
        AuditAction.CATEGORY_CREATE,
        'user-123',
        'category',
        'cat-123',
        { name: 'Test Category' }
      )

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          action: AuditAction.CATEGORY_CREATE,
          userId: 'user-123',
          resourceType: 'category',
          resourceId: 'cat-123',
          details: JSON.stringify({ name: 'Test Category' }),
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          timestamp: expect.any(Date),
        },
      })
    })
  })

  describe('logFailure', () => {
    it('should log failed operation with error details', async () => {
      mockCreate.mockResolvedValue({ id: '1' })

      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Test Agent',
        },
      })

      const error = new Error('Test error')

      await logFailure(
        request,
        AuditAction.IMAGE_DELETE,
        'user-123',
        error,
        'image',
        'img-123',
        { reason: 'Validation failed' }
      )

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          action: AuditAction.IMAGE_DELETE,
          userId: 'user-123',
          resourceType: 'image',
          resourceId: 'img-123',
          details: JSON.stringify({
            reason: 'Validation failed',
            error: 'Test error',
            stack: expect.any(String),
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          timestamp: expect.any(Date),
        },
      })
    })
  })
})
