import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Analytics data for maintenance dashboard
export async function GET() {
  try {
    // Get all maintenance records from database
    const allMaintenance = await prisma.unitMaintenance.findMany({
      include: {
        unit: true
      }
    });

    // Separate tasks (with cost > 0) from requests (cost = 0)
    const tasks = allMaintenance.filter(item => (item.cost || 0) > 0);
    const requests = allMaintenance.filter(item => (item.cost || 0) === 0);

    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'Completed').length,
      pending: tasks.filter(task => task.status === 'Pending').length,
      overdue: tasks.filter(task => task.status === 'Overdue').length
    };

    // Calculate total maintenance costs
    const totalCosts = tasks.reduce((sum, task) => sum + (task.cost || 0), 0);

    // Group tasks by maintenance type
    const tasksByType = tasks.reduce((acc: any, task) => {
      acc[task.maintenanceType] = (acc[task.maintenanceType] || 0) + 1;
      return acc;
    }, {});

    // Group tasks by priority
    const tasksByPriority = tasks.reduce((acc: any, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    // Calculate request statistics
    const requestStats = {
      total: requests.length,
      pending: requests.filter(req => req.status === 'Pending').length,
      inProgress: requests.filter(req => req.status === 'In Progress').length,
      completed: requests.filter(req => req.status === 'Completed').length
    };

    // Group requests by category (maintenanceType)
    const requestsByCategory = requests.reduce((acc: any, req) => {
      acc[req.maintenanceType] = (acc[req.maintenanceType] || 0) + 1;
      return acc;
    }, {});

    // Group requests by priority
    const requestsByPriority = requests.reduce((acc: any, req) => {
      acc[req.priority] = (acc[req.priority] || 0) + 1;
      return acc;
    }, {});

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTasks = tasks.filter(task => 
      task.maintenanceDate >= thirtyDaysAgo
    );

    const recentRequests = requests.filter(req => 
      req.maintenanceDate >= thirtyDaysAgo
    );

    // Prepare analytics data
    const analytics = {
      overview: {
        totalTasks: taskStats.total,
        totalRequests: requestStats.total,
        totalCosts: totalCosts,
        averageCostPerTask: taskStats.total > 0 ? totalCosts / taskStats.total : 0,
        completionRate: taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0
      },
      taskStatistics: {
        ...taskStats,
        byType: Object.entries(tasksByType).map(([type, count]) => ({
          type,
          count
        })),
        byPriority: Object.entries(tasksByPriority).map(([priority, count]) => ({
          priority,
          count
        }))
      },
      requestStatistics: {
        ...requestStats,
        byCategory: Object.entries(requestsByCategory).map(([category, count]) => ({
          category,
          count
        })),
        byPriority: Object.entries(requestsByPriority).map(([priority, count]) => ({
          priority,
          count
        }))
      },
      recentActivity: {
        tasksLast30Days: recentTasks.length,
        requestsLast30Days: recentRequests.length,
        recentTasks: recentTasks.slice(0, 5).map(task => ({
          id: task.id,
          type: task.maintenanceType,
          unitName: task.unit?.unitName || 'Unknown Unit',
          status: task.status,
          date: task.maintenanceDate.toISOString().split('T')[0]
        })),
        recentRequests: recentRequests.slice(0, 5).map(req => ({
          id: req.id,
          category: req.maintenanceType,
          unitName: req.unit?.unitName || 'Unknown Unit',
          priority: req.priority,
          status: req.status,
          reportedAt: req.maintenanceDate.toISOString().split('T')[0]
        }))
      },
      monthlyTrends: {
        // Simple monthly grouping for the last 6 months
        tasks: getMonthlyData(tasks, 'maintenanceDate'),
        requests: getMonthlyData(requests, 'maintenanceDate')
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching maintenance analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance analytics' },
      { status: 500 }
    );
  }
}

// Helper function to group data by month
function getMonthlyData(data: any[], dateField: string) {
  const monthlyData: { [key: string]: number } = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substr(0, 7); // YYYY-MM format
    monthlyData[monthKey] = 0;
  }

  // Count data for each month
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const monthKey = date.toISOString().substr(0, 7);
    if (monthlyData.hasOwnProperty(monthKey)) {
      monthlyData[monthKey]++;
    }
  });

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }));
}