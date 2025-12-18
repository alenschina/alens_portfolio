import { prisma } from '@/lib/prisma'

export enum AuditAction {
  // User actions
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Content actions
  IMAGE_CREATE = 'IMAGE_CREATE',
  IMAGE_UPDATE = 'IMAGE_UPDATE',
  IMAGE_DELETE = 'IMAGE_DELETE',
  IMAGE_VIEW = 'IMAGE_VIEW',

  CATEGORY_CREATE = 'CATEGORY_CREATE',
  CATEGORY_UPDATE = 'CATEGORY_UPDATE',
  CATEGORY_DELETE = 'CATEGORY_DELETE',

  NAVIGATION_CREATE = 'NAVIGATION_CREATE',
  NAVIGATION_UPDATE = 'NAVIGATION_UPDATE',
  NAVIGATION_DELETE = 'NAVIGATION_DELETE',

  // System actions
  FILE_UPLOAD = 'FILE_UPLOAD',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  BACKUP_CREATE = 'BACKUP_CREATE'
}

export interface AuditLogData {
  action: AuditAction
  userId: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break the main operation
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * Get client user agent from request headers
 */
export function getClientUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Middleware to extract request metadata for audit logging
 */
export function extractRequestMetadata(request: Request) {
  return {
    ipAddress: getClientIP(request),
    userAgent: getClientUserAgent(request)
  }
}

/**
 * Log successful operation
 */
export async function logSuccess(
  request: Request,
  action: AuditAction,
  userId: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  const metadata = extractRequestMetadata(request)

  await createAuditLog({
    action,
    userId,
    resourceType,
    resourceId,
    details,
    ...metadata
  })
}

/**
 * Log failed operation
 */
export async function logFailure(
  request: Request,
  action: AuditAction,
  userId: string,
  error: Error,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  const metadata = extractRequestMetadata(request)

  await createAuditLog({
    action,
    userId,
    resourceType,
    resourceId,
    details: {
      ...details,
      error: error.message,
      stack: error.stack
    },
    ...metadata
  })
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string
  action?: AuditAction
  resourceType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (filters.userId) where.userId = filters.userId
  if (filters.action) where.action = filters.action
  if (filters.resourceType) where.resourceType = filters.resourceType

  if (filters.startDate || filters.endDate) {
    where.timestamp = {}
    if (filters.startDate) where.timestamp.gte = filters.startDate
    if (filters.endDate) where.timestamp.lte = filters.endDate
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: filters.limit || 100,
    skip: filters.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  })

  return logs
}
