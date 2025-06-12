
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building, UserPlus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { seedDummyData } from "@/lib/seedData";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPersonnel: 0,
    totalUnits: 0,
    newThisWeek: 0,
    pendingAllocations: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    console.log("Fetching dashboard stats...");
    try {
      // Fetch queue count
      const { data: queueData, error: queueError } = await supabase
        .from("queue")
        .select("*");

      if (queueError) {
        console.error("Error fetching queue data:", queueError);
      }

      // Fetch units count
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*");

      if (unitsError) {
        console.error("Error fetching units data:", unitsError);
      }

      // Calculate stats
      const totalPersonnel = queueData?.length || 0;
      const totalUnits = unitsData?.length || 0;
      
      // Calculate new this week (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newThisWeek = queueData?.filter(item => 
        new Date(item.created_at) > oneWeekAgo
      ).length || 0;

      setStats({
        totalPersonnel,
        totalUnits,
        newThisWeek,
        pendingAllocations: totalPersonnel // For now, assume all are pending
      });

      console.log("Dashboard stats:", { totalPersonnel, totalUnits, newThisWeek });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    console.log("Seeding dummy data...");
    const success = await seedDummyData();
    if (success) {
      toast({
        title: "Success",
        description: "Dummy data has been added to the database",
      });
      fetchStats(); // Refresh stats after seeding
    } else {
      toast({
        title: "Error",
        description: "Failed to seed dummy data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">Dashboard</h1>
          <p className="text-muted-foreground">
            Military Personnel Accommodation Management System
          </p>
        </div>
        <Button onClick={handleSeedData} variant="outline">
          Add Dummy Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">
              In accommodation queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              Registered units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Added in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Allocations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAllocations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting accommodation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest personnel additions to the queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Personnel queue updated</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New unit registered</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Allocation pending review</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Personnel
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Register New Unit
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Process Allocations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
