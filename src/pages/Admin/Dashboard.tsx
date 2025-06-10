// import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
import {
  Building2,
  Users,
  Receipt,
  Wallet,
  LogOut,
  Plus,
  Home,
  UserPlus,
  FileText,
  BarChart
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { Navigation } from '@/components/admin/Navigation';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/api/api';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalFlats: number;
  totalOwners: number;
  pendingBills: number;
  totalArrears: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get<DashboardStats>('/admin/dashboard/summary');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Flats',
      value: stats?.totalFlats ?? 0,
      icon: Building2,
      color: 'text-blue-500',
      onClick: () => navigate('/admin/flats')
    },
    {
      title: 'Total Owners',
      value: stats?.totalOwners ?? 0,
      icon: Users,
      color: 'text-green-500',
      onClick: () => navigate('/admin/owners')
    },
    {
      title: 'Pending Bills',
      value: stats?.pendingBills ?? 0,
      icon: Receipt,
      color: 'text-orange-500',
      onClick: () => navigate('/admin/bills')
    },
    {
      title: 'Total Arrears',
      value: `₹${stats?.totalArrears ?? 0}`,
      icon: Wallet,
      color: 'text-purple-500',
      onClick: () => navigate('/admin/arrears')
    }
  ];

  const quickActions = [
    {
      label: 'Add Flat',
      icon: Plus,
      path: '/admin/flats/new'
    },
    {
      label: 'Manage Flats',
      icon: Home,
      path: '/admin/flats'
    },
    {
      label: 'Assign Owners',
      icon: UserPlus,
      path: '/admin/owners/assign'
    },
    {
      label: 'Generate Bills',
      icon: FileText,
      path: '/admin/bills/generate'
    },
    {
      label: 'View Reports',
      icon: BarChart,
      path: '/admin/reports'
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat) => (
              <Card 
                key={stat.title}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={stat.onClick}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
              </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
            </CardContent>
          </Card>
            ))}
        </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
              <CardContent className="grid gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">New Owner Registered</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Bill Generated</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Payment Received</p>
                          <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Monthly Bills Due</p>
                      <p className="text-xs text-gray-500">In 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Maintenance Due</p>
                      <p className="text-xs text-gray-500">In 5 days</p>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
