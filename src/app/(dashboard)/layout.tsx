import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardLayoutClient } from '@/components/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}