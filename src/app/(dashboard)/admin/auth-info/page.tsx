'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Shield, Activity, Globe } from 'lucide-react';

interface AuthSession {
  id: string;
  sessionToken: string;
  userId: string;
  ipAddress: string;
  userAgent?: string;
  expires: string;
  createdAt: string;
}

interface AuthLog {
  id: string;
  action: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuthInfoPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAuthData();
    }
  }, [user]);

  const fetchAuthData = async () => {
    try {
      setLoading(true);
      
      // Fetch user sessions
      const sessionsResponse = await fetch('/api/auth/user-sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }

      // Fetch recent auth logs
      const logsResponse = await fetch('/api/auth/user-logs');
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setAuthLogs(logsData.logs || []);
      }
    } catch (error) {
      console.error('Error fetching auth data:', error);
      toast.error('Failed to fetch authentication data');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Session terminated successfully');
        fetchAuthData();
      } else {
        toast.error('Failed to terminate session');
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Authentication Information
        </h1>
        <p className="text-muted-foreground">View your account security details and active sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>Your authentication information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Username</dt>
                <dd className="text-lg font-semibold">{user?.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-lg">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd>
                  <Badge variant="default" className="capitalize">
                    {user?.profile?.role || 'user'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                <dd className="font-mono text-sm">{user?.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent authentication events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : authLogs.length === 0 ? (
              <p className="text-center text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {authLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">{log.ipAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground">No active sessions</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono">{session.ipAddress}</TableCell>
                      <TableCell>
                        {session.userAgent ? (
                          <span className="text-sm truncate max-w-[200px] block">
                            {session.userAgent}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unknown device</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(session.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(session.expires), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                        >
                          Terminate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}