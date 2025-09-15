import React from 'react';
import { Sparkles, Chrome, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

export default function Login() {
  const { user, logout } = useAuth();

  const openOAuth = () => {
    window.open(
      `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/auth/google`,
      'oauth',
      'width=600,height=700'
    );
  };

  const manualPaste = () => {
    const token = prompt('Paste the JWT token JSON value (or token string) here:');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.token) {
          window.postMessage({ type: 'XENO_AUTH', token: parsed.token }, window.location.origin);
        } else {
          window.postMessage({ type: 'XENO_AUTH', token: token }, window.location.origin);
        }
      } catch {
        window.postMessage({ type: 'XENO_AUTH', token }, window.location.origin);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome to Xeno CRM</h1>
          <p className="text-muted-foreground">Sign in to access your customer management platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 animate-fade-in">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to your account</h2>
              <p className="text-sm text-muted-foreground">
                Use your Google account to securely access the platform
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="gradient"
                size="lg"
                icon={Chrome}
                onClick={openOAuth}
                className="w-full"
              >
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                icon={Key}
                onClick={manualPaste}
                className="w-full"
              >
                Paste Authentication Token
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={logout}
                  className="w-full"
                >
                  Sign out
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                If the authentication popup doesn't auto-close, copy the token JSON shown by the backend and use "Paste Authentication Token".
              </p>
              <p>
                For a smoother experience, ensure popup blockers are disabled for this site.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2024 Xeno CRM. Secure customer relationship management platform.</p>
        </div>
      </div>
    </div>
  );
}