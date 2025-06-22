import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-utils'
import { DashboardLayoutClient } from '@/components/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}