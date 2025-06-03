
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Send,
  Calendar,
  Bell,
  User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';

// Mock data - in real app this would come from API
const mockData = {
  summary: {
    totalFlats: 150,
    paidThisMonth: 125000,
    pendingDues: 45000,
    totalArrears: 85000
  },
  monthlyCollection: [
    { month: 'Jan', collected: 120000, due: 150000 },
    { month: 'Feb', collected: 135000, due: 150000 },
    { month: 'Mar', collected: 125000, due: 150000 },
    { month: 'Apr', collected: 140000, due: 150000 },
    { month: 'May', collected: 125000, due: 150000 },
    { month: 'Jun', collected: 130000, due: 150000 }
  ],
  duesByApartment: [
    { name: 'Block A', value: 25000, color: '#8884d8' },
    { name: 'Block B', value: 15000, color: '#82ca9d' },
    { name: 'Block C', value: 5000, color: '#ffc658' }
  ],
  defaulters: [
    { flatNo: 'A-301', ownerName: 'John Smith', arrears: 15000, monthsOverdue: 3 },
    { flatNo: 'B-205', ownerName: 'Sarah Wilson', arrears: 12000, monthsOverdue: 2 },
    { flatNo: 'C-102', ownerName: 'Mike Johnson', arrears: 8500, monthsOverdue: 2 },
    { flatNo: 'A-405', ownerName: 'Lisa Brown', arrears: 7200, monthsOverdue: 1 },
    { flatNo: 'B-303', ownerName: 'David Lee', arrears: 6800, monthsOverdue: 1 }
  ]
};

const Dashboard = () => {
  const [notifications] = useState([
    { id: 1, message: "G3 hasn't paid in 3 months", type: "warning" },
    { id: 2, message: "Monthly billing cycle starts in 5 days", type: "info" },
    { id: 3, message: "New maintenance request from A-201", type: "alert" }
  ]);

  const handleSendReminder = (flatNo: string, ownerName: string) => {
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${ownerName} (${flatNo}) via SMS and email.`,
    });
  };

  const handleCardClick = (cardType: string) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${cardType} detailed view...`,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AdminSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Sky Infraa Apartment Management</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Profile */}
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleCardClick('Total Flats')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Flats</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.summary.totalFlats}</div>
                <p className="text-xs text-muted-foreground">Active apartments</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleCardClick('Paid This Month')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{mockData.summary.paidThisMonth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Maintenance collected</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleCardClick('Pending Dues')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ₹{mockData.summary.pendingDues.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Current month due</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleCardClick('Total Arrears')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Arrears</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{mockData.summary.totalArrears.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Outstanding amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Collection vs Due</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.monthlyCollection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${Number(value).toLocaleString()}`, 
                        name === 'collected' ? 'Collected' : 'Due'
                      ]}
                    />
                    <Bar dataKey="collected" fill="#8884d8" name="collected" />
                    <Bar dataKey="due" fill="#82ca9d" name="due" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Dues by Apartment Block</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockData.duesByApartment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockData.duesByApartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Outstanding']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Defaulters Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Defaulters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.defaulters.map((defaulter, index) => (
                    <div 
                      key={defaulter.flatNo}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{defaulter.flatNo}</p>
                          <p className="text-sm text-gray-600">{defaulter.ownerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">₹{defaulter.arrears.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{defaulter.monthsOverdue} months</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendReminder(defaulter.flatNo, defaulter.ownerName)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Remind
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar & Notifications */}
            <div className="space-y-6">
              {/* Quick Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Monthly Billing
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Due Status Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Add Payment
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <p className="text-sm">{notification.message}</p>
                        <Badge 
                          variant={notification.type === 'warning' ? 'destructive' : 'secondary'}
                          className="mt-1"
                        >
                          {notification.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
