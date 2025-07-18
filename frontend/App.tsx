import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import CompanyConfig from "./components/financial/CompanyConfig";
import ReceiptGenerator from "./components/financial/ReceiptGenerator";
import TravelReportGenerator from "./components/financial/TravelReportGenerator";
import BillingGenerator from "./components/financial/BillingGenerator";
import ReconciliationPage from "./components/financial/ReconciliationPage";
import PurchaseRequisitionPage from "./components/purchasing/PurchaseRequisitionPage";
import ContactsPage from "./components/agenda/ContactsPage";
import ClientsPage from "./components/agenda/ClientsPage";
import ProfilePage from "./components/profile/ProfilePage";
import VacationPage from "./components/vacation/VacationPage";
import FlightSchedulingPage from "./components/operations/FlightSchedulingPage";
import FlightPlanningPage from "./components/operations/FlightPlanningPage";
import LogbookHomePage from "./components/operations/LogbookHomePage";
import LogbookPage from "./components/operations/LogbookPage";
import CrewReportPage from "./components/operations/CrewReportPage";
import CrewManagementPage from "./components/operations/CrewManagementPage";
import TasksPage from "./components/tasks/TasksPage";
import NotepadPage from "./components/notes/NotepadPage";
import MaintenancePage from "./components/maintenance/MaintenancePage";
import ReportsPage from "./components/reports/ReportsPage";
import CommunicationsPage from "./components/communications/CommunicationsPage";
import NotificationsSettingsPage from "./components/settings/NotificationsSettingsPage";
import UserManagementPage from "./components/settings/UserManagementPage";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/financial/company-config" element={<Layout><CompanyConfig /></Layout>} />
          <Route path="/financial/receipts" element={<Layout><ReceiptGenerator /></Layout>} />
          <Route path="/financial/travel-reports" element={<Layout><TravelReportGenerator /></Layout>} />
          <Route path="/financial/billing" element={<Layout><BillingGenerator /></Layout>} />
          <Route path="/financial/reconciliation" element={<Layout><ReconciliationPage /></Layout>} />
          <Route path="/financial/purchasing" element={<Layout><PurchaseRequisitionPage /></Layout>} />
          <Route path="/agenda/contacts" element={<Layout><ContactsPage /></Layout>} />
          <Route path="/agenda/clients" element={<Layout><ClientsPage /></Layout>} />
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/vacation" element={<Layout><VacationPage /></Layout>} />
          <Route path="/tasks" element={<Layout><TasksPage /></Layout>} />
          <Route path="/notes" element={<Layout><NotepadPage /></Layout>} />
          <Route path="/maintenance" element={<Layout><MaintenancePage /></Layout>} />
          <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
          <Route path="/communications" element={<Layout><CommunicationsPage /></Layout>} />
          <Route path="/settings/notifications" element={<Layout><NotificationsSettingsPage /></Layout>} />
          <Route path="/settings/users" element={<Layout><UserManagementPage /></Layout>} />
          <Route path="/operations/scheduling" element={<Layout><FlightSchedulingPage /></Layout>} />
          <Route path="/operations/flight-plan" element={<Layout><FlightPlanningPage /></Layout>} />
          <Route path="/operations/logbook" element={<Layout><LogbookHomePage /></Layout>} />
          <Route path="/operations/logbook/:aircraftId" element={<Layout><LogbookPage /></Layout>} />
          <Route path="/operations/crew-report" element={<Layout><CrewReportPage /></Layout>} />
          <Route path="/operations/crew-management" element={<Layout><CrewManagementPage /></Layout>} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
