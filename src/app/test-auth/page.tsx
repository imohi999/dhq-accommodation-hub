'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuth() {
  const { data: session, status } = useSession()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('An error occurred during login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Auth Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong> {JSON.stringify(session, null, 2)}</p>
          </div>
          
          {!session ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          ) : (
            <Button onClick={() => signOut()} className="w-full">
              Sign Out
            </Button>
          )}
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm">Debug Info:</p>
            <p className="text-xs">Check console for auth errors</p>
            <p className="text-xs">Default: admin / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}