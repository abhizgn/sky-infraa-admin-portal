import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth/AuthContext';
import { AdminLogin } from './pages/Admin/Login';
import { OwnerLogin } from './pages/Owner/Login';
import { OwnerRegister } from './pages/Owner/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Import your components
import AdminDashboard from './pages/Admin/Dashboard';
import  OwnerDashboard  from './pages/Owner/Dashboard';
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import Index from "./pages/Index";
import Apartments from './pages/Admin/Apartments';
import {Flats} from './pages/Admin/Flats';
import OwnerManagement from "./pages/Admin/OwnerManagement";
// import Owners from './pages/Admin/Owners';
// import Maintenance from "./pages/Admin/Maintenance";
// import Expenses from "./pages/Admin/Expenses";
import Arrears from "./pages/Admin/Arrears";
import Settings from "./pages/Admin/Settings";
import OwnerBills from "./pages/Owner/Bills";
import OwnerPayNow from "./pages/Owner/PayNow";
import OwnerArrears from "./pages/Owner/Arrears";
import OwnerSettings from "./pages/Owner/Settings";
import NotFound from "./pages/NotFound";
import AdminBills from "./pages/Admin/AdminBills";
import OwnerAssignment from "./pages/Admin/OwnerAssignment";
import CommonExpenses from "./pages/Admin/CommonExpense";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
          <Router>
        <Routes>
              {/* Public Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/owner/login" element={<OwnerLogin />} />
              <Route path="/owner/register" element={<OwnerRegister />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Owner Routes */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute requiredRole="owner">
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to admin login */}
              <Route path="/" element={<Navigate to="/admin/login" replace />} />

              <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/apartments"
            element={
              <ProtectedRoute requiredRole="admin">
                <Apartments />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/flats" element={<Flats />} />
          <Route path="/admin/apartments/:apartmentId/flats" element={<Flats />} />
          <Route
            path="/admin/owners"
            element={
              <ProtectedRoute requiredRole="admin">
                <OwnerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminBills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expenses"
            element={
              <ProtectedRoute requiredRole="admin">
                <CommonExpenses />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/arrears" element={<Arrears />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/bills" element={<OwnerBills />} />
          <Route path="/owner/pay-now" element={<OwnerPayNow />} />
          <Route path="/owner/arrears" element={<OwnerArrears />} />
          <Route path="/owner/settings" element={<OwnerSettings />} />
          <Route
            path="/admin/owner-assignment"
            element={
              <ProtectedRoute requiredRole="admin">
                <OwnerAssignment />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Router>
    </TooltipProvider>
  </QueryClientProvider>
    </AuthProvider>
);
}

export default App;
