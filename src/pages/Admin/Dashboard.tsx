import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Bell,
  Send,
  Plus,
  FileText,
  Users,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Mock data for recent transactions
const recentTransactions = [
  { id: 'T001', date: '2024-05-01', description: 'Maintenance Fee', amount: 1500, status: 'Paid' },
  { id: 'T002', date: '2024-05-05', description: 'Water Bill', amount: 300, status: 'Pending' },
  { id: 'T003', date: '2024-05-10', description: 'Electricity Bill', amount: 750, status: 'Paid' },
  { id: 'T004', date: '2024-05-15', description: 'Security Fee', amount: 1000, status: 'Paid' },
];

// Mock data for arrears
const arrearsData = [
  { id: 'A001', owner: 'John Doe', apartment: 'A-101', amount: 2500, dueDate: '2024-05-20' },
  { id: 'A002', owner: 'Jane Smith', apartment: 'B-202', amount: 1800, dueDate: '2024-05-25' },
];

// Mock data for expenses
const expensesData = [
  { id: 'E001', category: 'Maintenance', amount: 5000, date: '2024-05-01' },
  { id: 'E002', category: 'Utilities', amount: 3000, date: '2024-05-05' },
  { id: 'E003', category: 'Repairs', amount: 2000, date: '2024-05-10' },
];

// Mock data for bar chart
const barChartData = [
  { name: 'Jan', income: 40000, expenses: 24000 },
  { name: 'Feb', income: 30000, expenses: 13980 },
  { name: 'Mar', income: 20000, expenses: 9800 },
  { name: 'Apr', income: 27800, expenses: 3908 },
  { name: 'May', income: 18900, expenses: 4800 },
];

// Mock data for pie chart
const pieChartData = [
  { name: 'Maintenance', value: 400 },
  { name: 'Utilities', value: 300 },
  { name: 'Security', value: 300 },
  { name: 'Repairs', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="grid gap-4">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Apartments
              </CardTitle>
              <Building2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-gray-500">
                Active apartment buildings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹120,000</div>
              <p className="text-sm text-gray-500">
                Monthly rental income
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Arrears
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹15,000</div>
              <p className="text-sm text-gray-500">
                Unpaid dues from residents
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-sm text-gray-500">
                Apartments currently occupied
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue and Expenses</CardTitle>
              {/* <CardDescription>Monthly comparison of income vs expenses</CardDescription> */}
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {/* <Legend /> */}
                  <Bar dataKey="income" fill="#82ca9d" name="Income" />
                  <Bar dataKey="expenses" fill="#8884d8" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
              {/* <CardDescription>Proportion of expenses by category</CardDescription> */}
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            {/* <CardDescription>Latest financial activities</CardDescription> */}
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span>{transaction.date}</span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>₹{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.status === 'Paid' ? 'success' : 'secondary'}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Notifications</CardTitle>
              {/* <CardDescription>Broadcast messages to residents</CardDescription> */}
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-500" />
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              {/* <CardDescription>Record a new expense entry</CardDescription> */}
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Plus className="h-6 w-6 text-gray-500" />
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              {/* <CardDescription>Add, edit, or remove user accounts</CardDescription> */}
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Users className="h-6 w-6 text-gray-500" />
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
