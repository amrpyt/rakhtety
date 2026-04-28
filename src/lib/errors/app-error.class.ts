import { ErrorCodes } from '@/types/error-codes.enum'

export interface AppErrorOptions {
  code: ErrorCodes
  message: string
  statusCode: number
  context?: Record<string, unknown>
  stack?: string
}

export class AppError extends Error {
  public readonly code: ErrorCodes
  public readonly statusCode: number
  public readonly context: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(options: AppErrorOptions) {
    super(options.message)
    this.name = 'AppError'
    this.code = options.code
    this.statusCode = options.statusCode
    this.context = options.context || {}
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    }
  }

  static fromError(error: unknown, fallbackCode: ErrorCodes): AppError {
    if (error instanceof AppError) return error
    return new AppError({
      code: fallbackCode,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
    })
  }
}

export class AuthError extends AppError {
  constructor(code: ErrorCodes, message: string, context?: Record<string, unknown>) {
    super({ code, message, statusCode: 401, context })
    this.name = 'AuthError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({ code: ErrorCodes.VALIDATION_FAILED, message, statusCode: 400, context })
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super({
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      message: `${resource} not found${identifier ? `: ${identifier}` : ''}`,
      statusCode: 404,
      context: { resource, identifier },
    })
    this.name = 'NotFoundError'
  }
}