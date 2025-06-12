import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import QueueList from "./pages/QueueList";
import Units from "./pages/Units";
import DHQLivingUnits from "./pages/DHQLivingUnits";
import HousingTypes from "./pages/HousingTypes";
import AllocationRequests from "./pages/AllocationRequests";
import PendingApproval from "./pages/PendingApproval";
import ActiveAllocations from "./pages/ActiveAllocations";
import PastAllocations from "./pages/PastAllocations";
import StampSettings from "./pages/StampSettings";
import UserManagement from "./pages/UserManagement";
import RoleProfiles from "./pages/RoleProfiles";
import AuditTrail from "./pages/AuditTrail";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="dap-ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ProtectedRoute>
                <div className="min-h-screen flex w-full">
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Header />
                      <div className="flex flex-1 flex-col gap-4 p-4">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/queue/list" element={<QueueList />} />
                          <Route path="/queue/units" element={<Units />} />
                          <Route path="/accommodation/units" element={<DHQLivingUnits />} />
                          <Route path="/accommodation/housing-types" element={<HousingTypes />} />
                          <Route path="/allocation/requests" element={<AllocationRequests />} />
                          <Route path="/allocation/pending" element={<PendingApproval />} />
                          <Route path="/allocation/active" element={<ActiveAllocations />} />
                          <Route path="/allocation/past" element={<PastAllocations />} />
                          <Route path="/allocation/stamp-settings" element={<StampSettings />} />
                          <Route path="/settings/users" element={<UserManagement />} />
                          <Route path="/settings/roles" element={<RoleProfiles />} />
                          <Route path="/settings/audit" element={<AuditTrail />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </SidebarInset>
                  </SidebarProvider>
                </div>
              </ProtectedRoute>
            </TooltipProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
