'use client';

import Image from 'next/image';
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut, User, ChevronDown } from "lucide-react"
import { useAuth } from '@/hooks/useAuth'
import useSWR from "swr"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  const { user, signOut, loading } = useAuth();
  
  const { data: profile, error } = useSWR<UserProfile>(
    user?.id ? `/api/profiles/${user.id}` : null,
    fetcher
  );

  if (error) {
    console.error('Error fetching profile:', error);
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const displayName = user?.profile?.fullName || profile?.fullName || user?.username || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.profile?.role || profile?.role || 'User';
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
            <Image 
              src="/lovable-uploads/6dea8f38-4e85-41a5-95cc-343631f1cde0.png" 
              alt="DHQ Logo" 
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground">DHQ Accommodation Platform</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {loading ? (
            <div className="h-10 w-10 animate-pulse bg-muted rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 px-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={undefined} alt={displayName} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">{displayName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    {userEmail && (
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    )}
                    <p className="text-xs leading-none text-muted-foreground capitalize">Role: {userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}