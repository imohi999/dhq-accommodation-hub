
import {
  Calendar,
  Home,
  Users,
  Building,
  Settings,
  BarChart3,
  List,
  CheckCircle,
  Clock,
  Archive,
  Stamp,
  Wrench,
  AlertTriangle
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Queue",
    icon: List,
    items: [
      {
        title: "Queue List",
        url: "/queue/list",
      },
      {
        title: "Units",
        url: "/queue/units",
      },
    ],
  },
  {
    title: "Allocations",
    icon: CheckCircle,
    items: [
      {
        title: "Active Allocations",
        url: "/allocations/active",
      },
      {
        title: "Pending Approval",
        url: "/allocations/pending",
      },
      {
        title: "Past Allocations",
        url: "/allocations/past",
      },
      {
        title: "Stamp Settings",
        url: "/allocations/stamp-settings",
      },
    ],
  },
  {
    title: "Strength",
    url: "/strength",
    icon: Users,
  },
  {
    title: "Accommodation",
    url: "/accommodation",
    icon: Building,
  },
  {
    title: "Maintenance",
    icon: Wrench,
    items: [
      {
        title: "Maintenance Tasks",
        url: "/maintenance/tasks",
      },
      {
        title: "Maintenance Requests",
        url: "/maintenance/requests",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/5fdd34e0-92c2-4d90-b14f-74d73614597d.png" 
            alt="DAP Logo" 
            className="h-8 w-8"
          />
          <div>
            <h2 className="text-lg font-semibold">DAP</h2>
            <p className="text-sm text-muted-foreground">DHQ Accommodation Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url}>{subItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          © 2024 DHQ Accommodation Platform
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
