import { Metadata } from 'next'
import { getSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Home, FileText, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard | DHQ Accommodation Hub',
  description: 'DHQ Accommodation Management Dashboard',
}

async function getDashboardStats() {
  const [queueCount, vacantUnits, occupiedUnits, pendingRequests] = await Promise.all([
    prisma.queue.count(),
    prisma.dhqLivingUnit.count({ where: { status: 'Vacant' } }),
    prisma.dhqLivingUnit.count({ where: { status: 'Occupied' } }),
    prisma.allocationRequest.count({ where: { status: 'pending' } }),
  ])

  return {
    queueCount,
    vacantUnits,
    occupiedUnits,
    pendingRequests,
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.username || session?.email || 'User'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queueCount}</div>
            <p className="text-xs text-muted-foreground">
              Personnel waiting for allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Quarters</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vacantUnits}</div>
            <p className="text-xs text-muted-foreground">
              Available for allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Quarters</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupiedUnits}</div>
            <p className="text-xs text-muted-foreground">
              Currently allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}