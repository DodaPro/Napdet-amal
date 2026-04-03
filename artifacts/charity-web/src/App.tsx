import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Transparency from "@/pages/transparency";
import Community from "@/pages/community";
import CaseDetails from "@/pages/case-details";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCases from "@/pages/admin/cases";
import NewCase from "@/pages/admin/new-case";
import AdminDonations from "@/pages/admin/donations";
import AdminUsers from "@/pages/admin/users";
import AdminNotifications from "@/pages/admin/notifications";
import AdminStaff from "@/pages/admin/staff";
import NewsPage from "@/pages/news";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/transparency" component={Transparency} />
      <Route path="/community" component={Community} />
      <Route path="/cases/:id" component={CaseDetails} />
      <Route path="/news" component={NewsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/admin">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/cases">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminCases />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/cases/new">
        {() => (
          <ProtectedRoute requireAdmin>
            <NewCase />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/donations">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminDonations />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/notifications">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminNotifications />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/staff">
        {() => (
          <ProtectedRoute requireAdmin>
            <AdminStaff />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
