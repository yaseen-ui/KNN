import { Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

/**
 * Sends a standardized success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): void => {
  const response: ApiResponse<null> = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

/**
 * Validates that required fields are present in request body
 */
export const validateRequired = (
  body: Record<string, unknown>,
  fields: string[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`Field '${field}' is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates token value format
 */
export const isValidTokenValue = (value: string): boolean => {
  // Token should be non-empty string
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates k parameter for top-k search
 */
export const isValidK = (k: unknown): boolean => {
  if (typeof k !== 'number') return false;
  return Number.isInteger(k) && k > 0 && k <= 1000; // max 1000
};

/**
 * Validates similarity threshold (0-1)
 */
export const isValidThreshold = (threshold: unknown): boolean => {
  if (typeof threshold !== 'number') return false;
  return threshold >= 0 && threshold <= 1;
};

/**
 * Wraps async route handlers to catch errors
 */
export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response
    ) => Promise<void>
  ) =>
  (req: Request, res: Response, next: Function) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
