
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Admin/Dashboard";
import Apartments from "./pages/Admin/Apartments";
import Flats from "./pages/Admin/Flats";
import Owners from "./pages/Admin/Owners";
import Maintenance from "./pages/Admin/Maintenance";
import Expenses from "./pages/Admin/Expenses";
import Arrears from "./pages/Admin/Arrears";
import Settings from "./pages/Admin/Settings";
import OwnerDashboard from "./pages/Owner/Dashboard";
import OwnerBills from "./pages/Owner/Bills";
import OwnerPayNow from "./pages/Owner/PayNow";
import OwnerArrears from "./pages/Owner/Arrears";
import OwnerSettings from "./pages/Owner/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/apartments" element={<Apartments />} />
          <Route path="/admin/apartments/:apartmentId/flats" element={<Flats />} />
          <Route path="/admin/owners" element={<Owners />} />
          <Route path="/admin/maintenance" element={<Maintenance />} />
          <Route path="/admin/expenses" element={<Expenses />} />
          <Route path="/admin/arrears" element={<Arrears />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/bills" element={<OwnerBills />} />
          <Route path="/owner/pay-now" element={<OwnerPayNow />} />
          <Route path="/owner/arrears" element={<OwnerArrears />} />
          <Route path="/owner/settings" element={<OwnerSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
