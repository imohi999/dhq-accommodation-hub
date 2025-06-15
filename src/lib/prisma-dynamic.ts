import { PrismaClient } from '@prisma/client'

type TenantConfig = {
  databaseUrl: string
  tenantId: string
}

// Cache for tenant-specific Prisma clients
const clientCache = new Map<string, PrismaClient>()

/**
 * Creates or retrieves a Prisma Client for a specific tenant
 * Useful for multi-tenant applications with separate databases
 */
export function createPrismaClient(config: TenantConfig): PrismaClient {
  // Check if client already exists in cache
  if (clientCache.has(config.tenantId)) {
    return clientCache.get(config.tenantId)!
  }

  // Create new client with tenant-specific configuration
  const client = new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Store in cache
  clientCache.set(config.tenantId, client)

  return client
}

/**
 * Disconnects a specific tenant's Prisma Client
 */
export async function disconnectPrismaClient(tenantId: string): Promise<void> {
  const client = clientCache.get(tenantId)
  if (client) {
    await client.$disconnect()
    clientCache.delete(tenantId)
  }
}

/**
 * Disconnects all cached Prisma Clients
 */
export async function disconnectAllClients(): Promise<void> {
  const disconnectPromises = Array.from(clientCache.values()).map(client => 
    client.$disconnect()
  )
  await Promise.all(disconnectPromises)
  clientCache.clear()
}

// Cleanup on application shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await disconnectAllClients()
  })
}