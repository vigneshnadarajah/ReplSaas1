import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import CSVManager from "@/pages/CSVManager";
import Login from "@/pages/Login";
import { useEffect } from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userId = document.querySelector('meta[name="replit-user-id"]')?.getAttribute('content');
    if (!userId) {
      setLocation('/login');
    }
  }, [setLocation]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <AuthGuard>
          <CSVManager />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter>
        <Router />
        <Toaster />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
