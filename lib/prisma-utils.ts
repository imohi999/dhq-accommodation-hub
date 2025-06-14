import { Prisma } from '@prisma/client';

/**
 * Helper function to parse JSON fields from Prisma queries
 * Since we're using PostgreSQL with native JSON support, this is mostly for type safety
 */
export function parseJsonField<T>(data: any): T {
  if (!data) return {} as T;
  
  // If it's already an object (PostgreSQL JSON), return as-is
  if (typeof data === 'object') {
    return data as T;
  }
  
  // If it's a string (shouldn't happen with PostgreSQL JSON type), parse it
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch {
      return {} as T;
    }
  }
  
  return {} as T;
}

/**
 * Helper to create JSON filter queries
 */
export function createJsonFilter(field: string, key: string, value: any) {
  // PostgreSQL JSON operators
  return Prisma.sql`${Prisma.raw(field)}->>'${Prisma.raw(key)}' = ${value}`;
}

/**
 * Helper to safely stringify data for JSON fields
 */
export function toJsonField(data: any): Prisma.JsonValue {
  return data as Prisma.JsonValue;
}

/**
 * Pagination helper
 */
export function paginate(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit
  };
}

/**
 * Search filter helper
 */
export function searchFilter(searchTerm: string, fields: string[]) {
  if (!searchTerm) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    }))
  };
}

/**
 * Handle Prisma errors with user-friendly messages
 */
export function handlePrismaError(error: any): { message: string; status: number } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { message: 'A record with this unique value already exists', status: 409 };
      case 'P2003':
        return { message: 'Foreign key constraint failed', status: 400 };
      case 'P2025':
        return { message: 'Record not found', status: 404 };
      default:
        return { message: 'Database operation failed', status: 500 };
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    return { message: 'Invalid data provided', status: 400 };
  }
  
  return { message: 'An unexpected error occurred', status: 500 };
}