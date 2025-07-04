import { useState, useEffect } from "react";

interface AccessGateProps {
  onAccessGranted: () => void;
}

export default function AccessGate({ onAccessGranted }: AccessGateProps) {
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError("Access code is required");
      return;
    }

    try {
      setIsValidating(true);
      setError("");

      const response = await fetch("/api/validate-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: accessCode,
          email: email || null,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Store access grant with timestamp
        localStorage.setItem('featherweight_access_granted', 'true');
        localStorage.setItem('featherweight_access_timestamp', new Date().toISOString());
        localStorage.setItem('featherweight_access_level', result.accessLevel || 'standard');
        
        if (result.userLevel) {
          localStorage.setItem('featherweight_user_level', result.userLevel);
        }

        // Delay for user feedback, then grant access
        setTimeout(() => {
          onAccessGranted();
        }, 1500);

      } else {
        setError(result.message || "Invalid access code. Please check your code and try again.");
      }
    } catch (error) {
      setError("Unable to validate access code. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Full Technology Access
            </h2>
            <p className="text-gray-600">
              Enter your access code to experience the complete Featherweight consciousness technology platform
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Access Granted!</h3>
                <p className="text-green-600 text-sm">
                  Redirecting to the full platform...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your access code"
                  disabled={isValidating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                  disabled={isValidating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Providing your email helps us track usage and grant future access
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isValidating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50"
              >
                {isValidating ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Validating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Unlock Full Platform
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <h4 className="font-medium text-gray-800">What You'll Access:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Advanced Consciousness AI</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Research-Grade Analytics</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Full Dataset Processing</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Real-time Consciousness Streaming</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Need an access code? Contact the research team or check your invitation email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
