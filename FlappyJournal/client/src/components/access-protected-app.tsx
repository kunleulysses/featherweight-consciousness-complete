import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AccessGate from "@/pages/access-gate";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import JournalPage from "@/pages/journal-page";
import ConversationPage from "@/pages/conversation-page";
import { AuthProvider } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AccessProtectedApp() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has valid access on app load
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
      } else {
        // Access expired
        toast({
          title: "Access Expired",
          description: "Your 24-hour access has expired. Please enter your access code again.",
          variant: "destructive",
        });
      }
    }
    
    // No valid access found
    localStorage.removeItem('featherweight_access_granted');
    localStorage.removeItem('featherweight_access_timestamp');
    localStorage.removeItem('featherweight_access_level');
    localStorage.removeItem('featherweight_user_level');
    setHasAccess(false);
  };

  const handleAccessGranted = () => {
    setHasAccess(true);
    toast({
      title: "Welcome to Featherweight",
      description: "You now have full access to the consciousness technology platform.",
    });
  };

  const handleAccessRevoked = () => {
    setHasAccess(false);
    localStorage.removeItem('featherweight_access_granted');
    localStorage.removeItem('featherweight_access_timestamp');
    localStorage.removeItem('featherweight_access_level');
    localStorage.removeItem('featherweight_user_level');
    toast({
      title: "Access Revoked",
      description: "Your access has been revoked. Please enter your access code to continue.",
      variant: "destructive",
    });
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
      <Router>
        <div className="min-h-screen">
          {/* Access indicator */}
          <div className="fixed top-0 right-0 z-50 bg-green-500 text-white px-3 py-1 text-xs font-medium">
            Full Access Active
          </div>
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/conversation" element={<ConversationPage />} />
            <Route path="/conversation/:id" element={<ConversationPage />} />
            {/* Add other protected routes */}
          </Routes>
          
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
      </Router>
    </AuthProvider>
  );
}
