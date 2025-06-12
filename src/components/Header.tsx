
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-emerald-50">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-yellow-400" />
          </div>
          <h1 className="text-lg font-semibold text-emerald-800">DHQ Accommodation Platform</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
