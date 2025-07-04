import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AccessGate from "@/pages/access-gate";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";

// Access Gate Wrapper Component
function AccessProtectedApp() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    checkExistingAccess();
  }, []);

  const checkExistingAccess = () => {
    const storedAccess = localStorage.getItem('featherweight_access_granted');
    const accessTimestamp = localStorage.getItem('featherweight_access_timestamp');
    
    if (storedAccess === 'true' && accessTimestamp) {
      const accessTime = new Date(accessTimestamp);
      const now = new Date();
      const hoursSinceAccess = (now.getTime() - accessTime.getTime()) / (1000 * 60 * 60);
      
      // Access valid for 24 hours
      if (hoursSinceAccess < 24) {
        setHasAccess(true);
        return;
      }
    }
    
    localStorage.removeItem('featherweight_access_granted');
    localStorage.removeItem('featherweight_access_timestamp');
    localStorage.removeItem('featherweight_access_level');
    localStorage.removeItem('featherweight_user_level');
    setHasAccess(false);
  };

  const handleAccessGranted = () => {
    setHasAccess(true);
    console.log("Welcome to Featherweight - Full access granted!");
  };

  const handleAccessRevoked = () => {
    setHasAccess(false);
    localStorage.removeItem('featherweight_access_granted');
    localStorage.removeItem('featherweight_access_timestamp');
    localStorage.removeItem('featherweight_access_level');
    localStorage.removeItem('featherweight_user_level');
  };

  // Show loading state while checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access gate if no access
  if (!hasAccess) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  // Show full app if access granted
  return (
    <AuthProvider>
      <div className="min-h-screen">
        {/* Access indicator */}
        <div className="fixed top-0 right-0 z-50 bg-green-500 text-white px-3 py-1 text-xs font-medium">
          Full Access Active
        </div>
        
        <Router />
        
        {/* Access management */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleAccessRevoked}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
            title="Revoke access and return to access gate"
          >
            Revoke Access
          </button>
        </div>
      </div>
    </AuthProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessProtectedApp />
    </QueryClientProvider>
  );
}
