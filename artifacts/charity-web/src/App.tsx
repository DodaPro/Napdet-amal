import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Transparency from "@/pages/transparency";
import Community from "@/pages/community";
import CaseDetails from "@/pages/case-details";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCases from "@/pages/admin/cases";
import NewCase from "@/pages/admin/new-case";
import AdminDonations from "@/pages/admin/donations";
import AdminUsers from "@/pages/admin/users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
      
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cases" component={AdminCases} />
      <Route path="/admin/cases/new" component={NewCase} />
      <Route path="/admin/donations" component={AdminDonations} />
      <Route path="/admin/users" component={AdminUsers} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
