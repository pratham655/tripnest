import React, { useState } from "react";
import { User, Mail, Lock, ShieldAlert, CheckCircle, Navigation } from "lucide-react";
import { UserProfile } from "../types";

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const bodyObj = isLogin ? { email } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setSuccess(isLogin ? "Welcome back to TripNest!" : "Account created successfully!");
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError("");
    setLoading(true);
    setSuccess("Connected with Google Secure Workspace!");
    
    // Quick timeout to mock single-sign-on
    setTimeout(() => {
      onLoginSuccess({
        id: "demo-user",
        name: "Pratham",
        email: "prathams.galaxies@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        bio: "Wanderlust enthusiast & tech developer. Ready to explore the world!",
        homeLocation: "Mumbai, India",
        createdAt: new Date().toISOString()
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div id="auth-screen-container" className="min-h-screen bg-earth-bg flex items-center justify-center p-4 selection:bg-earth-accent/20 selection:text-earth-slate">
      <div id="auth-card" className="w-full max-w-md bg-white rounded-2xl border border-earth-border overflow-hidden transition-all duration-300 shadow-sm">
        {/* Card Header Banner */}
        <div className="bg-earth-accent p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-6 -mb-6" />
          
          <div className="inline-flex p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-3 border border-white/20">
            <Navigation className="h-7 w-7 text-earth-bg" />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight italic">TripNest</h1>
          <p className="text-earth-bg/90 text-sm mt-1">Your AI-Powered Travel Planning Buddy</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-earth-border">
          <button
            id="login-tab-btn"
            type="button"
            className={`flex-1 py-4 text-sm font-semibold transition-all ${
              isLogin 
                ? "text-earth-accent border-b-2 border-earth-accent bg-earth-bg/40" 
                : "text-earth-accent/60 hover:text-earth-slate"
            }`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login Passwordless
          </button>
          <button
            id="signup-tab-btn"
            type="button"
            className={`flex-1 py-4 text-sm font-semibold transition-all ${
              !isLogin 
                ? "text-earth-accent border-b-2 border-earth-accent bg-earth-bg/40" 
                : "text-earth-accent/60 hover:text-earth-slate"
            }`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Area */}
        <form id="auth-form" onSubmit={handleAuth} className="p-8 space-y-5">
          {error && (
            <div id="auth-error-banner" className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs leading-relaxed animate-shake">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div id="auth-success-banner" className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-slate block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5.5 w-5.5 text-earth-accent/60" />
                <input
                  id="signup-name-input"
                  type="text"
                  required
                  placeholder="e.g. Pratham Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/20 text-sm font-sans transition-all text-earth-slate placeholder:text-earth-accent/40 bg-earth-bg/30 font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-earth-slate block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5.5 w-5.5 text-earth-accent/60" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/20 text-sm font-sans transition-all text-earth-slate placeholder:text-earth-accent/40 bg-earth-bg/30 font-medium"
              />
            </div>
            {isLogin && email === "" && (
              <p className="text-[10px] text-earth-accent/60 italic">Tip: Type <span className="font-semibold text-earth-accent">prathams.galaxies@gmail.com</span> for instant demo workspace entry!</p>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-slate block">Password</label>
              <div className="relative font-mono">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5.5 w-5.5 text-earth-accent/60" />
                <input
                  id="signup-pw-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-earth-border focus:border-earth-accent focus:outline-none focus:ring-2 focus:ring-earth-accent/20 text-sm font-sans transition-all text-earth-slate placeholder:text-earth-accent/40 bg-earth-bg/30 font-medium"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-earth-accent hover:bg-earth-accent-hover text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Authenticating..." : isLogin ? "Login Now" : "Create Account"}
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-earth-border"></div>
            <span className="flex-shrink mx-3 text-earth-accent/50 text-xs">Or continue with</span>
            <div className="flex-grow border-t border-earth-border"></div>
          </div>

          {/* Google Auth Option */}
          <button
            id="google-auth-btn"
            type="button"
            disabled={loading}
            onClick={handleGoogleAuth}
            className="w-full bg-white hover:bg-earth-bg text-earth-slate py-3 rounded-xl text-sm font-semibold border border-earth-border transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2.5"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.12-3.12C17.46 1.74 14.93 1 12 1 7.35 1 3.4 3.65 1.52 7.5L5.1 10.3C5.97 7.25 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.85c2.16-2 3.72-4.94 3.72-8.56z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 13.7c-.24-.7-.38-1.46-.38-2.2s.14-1.5.38-2.2L1.52 6.5C.55 8.44 0 10.61 0 12s.55 3.56 1.52 5.5l3.58-2.8z"
              />
              <path
                fill="#34A853"
                d="M12 18.96c-3.22 0-6.03-2.21-6.9-5.26l-3.58 2.8c1.88 3.85 5.83 6.5 10.48 6.5 2.93 0 5.61-1 7.55-2.73l-3.69-2.85c-1.07.72-2.45 1.14-3.86 1.14z"
              />
            </svg>
            Google Single Sign-On
          </button>
        </form>
      </div>
    </div>
  );
}
