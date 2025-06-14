import { Metadata } from 'next'
import { LoginForm } from '@/components/LoginForm'
import { LoginLogo } from '@/components/LoginLogo'

export const metadata: Metadata = {
  title: 'Login | DHQ Accommodation Hub',
  description: 'Login to DHQ Accommodation Management System',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <LoginLogo />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}