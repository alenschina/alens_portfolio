import { describe, it, expect, vi } from 'vitest'
import { AuditAction, createAuditLog, getClientIP, getClientUserAgent, logSuccess, logFailure } from '@/lib/audit'

// Mock console.log to verify audit logging
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('Audit Utils', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
  })

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
    it('should log audit entry to console', async () => {
      await createAuditLog({
        action: AuditAction.IMAGE_CREATE,
        userId: 'user-123',
        resourceType: 'image',
        resourceId: 'img-123',
        details: { title: 'Test Image' },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Agent',
      })

      expect(mockConsoleLog).toHaveBeenCalledWith('[Audit]', expect.objectContaining({
        action: AuditAction.IMAGE_CREATE,
        userId: 'user-123',
        resourceType: 'image',
        resourceId: 'img-123',
      }))
    })

    it('should handle missing details', async () => {
      await createAuditLog({
        action: AuditAction.USER_LOGIN,
        userId: 'user-123',
      })

      expect(mockConsoleLog).toHaveBeenCalledWith('[Audit]', expect.objectContaining({
        action: AuditAction.USER_LOGIN,
        userId: 'user-123',
        resourceType: undefined,
        resourceId: undefined,
        details: undefined,
      }))
    })
  })

  describe('logSuccess', () => {
    it('should log successful operation', async () => {
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

      expect(mockConsoleLog).toHaveBeenCalledWith('[Audit]', expect.objectContaining({
        action: AuditAction.CATEGORY_CREATE,
        userId: 'user-123',
        resourceType: 'category',
        resourceId: 'cat-123',
      }))
    })
  })

  describe('logFailure', () => {
    it('should log failed operation with error details', async () => {
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

      expect(mockConsoleLog).toHaveBeenCalledWith('[Audit]', expect.objectContaining({
        action: AuditAction.IMAGE_DELETE,
        userId: 'user-123',
        resourceType: 'image',
        resourceId: 'img-123',
      }))
    })
  })
})
