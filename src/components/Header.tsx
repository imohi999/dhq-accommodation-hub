
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
