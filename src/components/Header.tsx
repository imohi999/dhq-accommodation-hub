
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import useSWR from "swr"

interface UserProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  role: string;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch');
  }
  return res.json();
});

export function Header() {
  const { signOut, user } = useAuth();
  
  const { data: profile, error } = useSWR<UserProfile>(
    user?.id ? `/api/profiles/${user.id}` : null,
    fetcher
  );

  if (error) {
    console.error('Error fetching profile:', error);
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = profile?.fullName || profile?.username || 'User';

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="/lovable-uploads/6dea8f38-4e85-41a5-95cc-343631f1cde0.png" 
              alt="DHQ Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground">DHQ Accommodation Platform</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{displayName}</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
