/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import './globals.css';
import InspectProtection from '@/components/InspectProtection';
import { resolveUserRole } from '@/lib/accessControl';
import { ShieldCheck, Sparkles, Building2, Lock, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes Inactivity Timeout

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const idleTimerRef = useRef(null);

  const ALLOWED_DOMAINS = ['vdt.edu.in', 'vsit.edu.in', 'vit.edu.in', 'vpt.edu.in', 'vcp.edu.in', 'vdt.org'];

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      validateUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
      clearIdleTimer();
    };
  }, []);

  // --- IDLE INACTIVITY SESSION TIMEOUT & AUTO-LOGOUT ---
  useEffect(() => {
    if (session || userRole) {
      resetIdleTimer();
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
      
      const handleUserActivity = () => {
        resetIdleTimer();
      };

      events.forEach(event => window.addEventListener(event, handleUserActivity));

      return () => {
        events.forEach(event => window.removeEventListener(event, handleUserActivity));
        clearIdleTimer();
      };
    }
  }, [session, userRole]);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const resetIdleTimer = () => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      handleIdleLogout();
    }, IDLE_TIMEOUT_MS);
  };

  const handleIdleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log("Signout note:", e);
    }
    // Clean all session data & cookies
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
      window.localStorage.removeItem('userRole');
      window.localStorage.removeItem('userEmail');
      // Wipe any lingering cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    setSession(null);
    setUserRole(null);
    setUserEmail('');
    alert("⚠️ Security Alert: Your session has expired due to 15 minutes of inactivity. Please sign in again with Microsoft Outlook.");
    window.location.reload();
  };

  const checkAuth = async () => {
    // Check session-only storage
    const savedRole = typeof window !== 'undefined' ? window.sessionStorage.getItem('userRole') : null;
    const savedEmail = typeof window !== 'undefined' ? window.sessionStorage.getItem('userEmail') : null;
    
    if (savedRole && savedEmail) {
      setUserRole(savedRole);
      setUserEmail(savedEmail);
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    validateUserSession(session);
  };

  const validateUserSession = async (session) => {
    setLoading(true);
    setAuthError('');

    if (session?.user) {
      const email = (session.user.email || '').trim().toLowerCase();
      const emailDomain = email.split('@')[1] || '';
      
      const isAllowedDomain = ALLOWED_DOMAINS.includes(emailDomain) || ALLOWED_DOMAINS.some(d => email.endsWith(d));

      if (isAllowedDomain) {
        const role = resolveUserRole(email);
        setSession(session);
        setUserRole(role);
        setUserEmail(email);
        
        // Save in session-only storage (no persistent login cookies)
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('userRole', role);
          window.sessionStorage.setItem('userEmail', email);
        }
      } else {
        const errMsg = `Access Denied: ${email} is not an authorized Vidyalankar institute account. Please use your official Outlook credentials (@vsit.edu.in, @vit.edu.in, @vdt.edu.in).`;
        setAuthError(errMsg);
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          window.sessionStorage.clear();
        }
        setSession(null);
        setUserRole(null);
        setUserEmail('');
      }
    } else {
      if (typeof window !== 'undefined') {
        const savedRole = window.sessionStorage.getItem('userRole');
        if (!savedRole) {
          setSession(null);
          setUserRole(null);
          setUserEmail('');
        }
      }
    }
    setLoading(false);
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'azure', 
        options: { 
          scopes: 'email openid profile User.Read', 
          redirectTo: typeof window !== 'undefined' ? window.location.origin : '' 
        } 
      });
      if (error) throw error;
    } catch (e) {
      console.error("Microsoft OAuth error:", e);
      setAuthError(e.message || "Failed to initiate Microsoft Authentication. Please ensure Azure OAuth is configured.");
      setLoading(false);
    }
  };

  // --- SECURE MICROSOFT AUTHENTICATION ONLY SCREEN ---
  if (!loading && !session && !userRole) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Vidyalankar Dnyanpeeth Trust | Microsoft Authentication</title>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#f97316" />
        </head>
        <body className="min-h-screen bg-stone-900 flex items-center justify-center p-4 relative overflow-hidden font-sans text-stone-100">
          <InspectProtection />
          
          {/* Ambient Glowing Background Lights */}
          <div className="absolute top-[-20%] left-[-10%] w-140 h-140 bg-orange-600/30 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-160 h-160 bg-blue-600/20 rounded-full blur-[160px] pointer-events-none"></div>
          <div className="absolute top-[30%] right-[20%] w-96 h-96 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>

          <div className="w-full max-w-lg bg-stone-900/85 backdrop-blur-2xl border border-orange-500/30 rounded-[36px] shadow-2xl p-8 sm:p-10 relative z-10 animate-fade-in-up">
            
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-4 rounded-3xl border border-orange-400/30 shadow-inner flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/30 text-white shrink-0">
                  <Building2 size={24} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-widest block">VDT Central Portal</span>
                  <span className="text-[10px] text-stone-400 font-semibold">Vidyalankar Dnyanpeeth Trust</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-orange-400 tracking-tight uppercase flex items-center justify-center gap-2">
                Venue Booking <Sparkles size={20} className="text-amber-400 animate-spin" />
              </h1>
              <p className="text-orange-200/80 text-[11px] font-bold tracking-[0.2em] uppercase mt-1">Multi-Tier Automated Approval System</p>
            </div>

            {/* Error Message if any */}
            {authError && (
              <div className="mb-5 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-start gap-2.5 leading-relaxed animate-shake">
                <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Microsoft Azure OAuth Only Sign In */}
            <div className="space-y-5">
              <button 
                type="button" 
                onClick={handleMicrosoftLogin} 
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 border border-blue-400/30 group"
              >
                <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Sign in with Microsoft Outlook</span>
              </button>

              {/* Security & Access Policy Badge */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 text-[11px] text-stone-400 space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 font-black text-stone-200 uppercase tracking-wider text-[10px]">
                  <Lock size={12} className="text-orange-400 shrink-0"/> Mandatory Security & Access Policies:
                </div>
                <p>&bull; <strong>Strict Microsoft SSO:</strong> Login is restricted exclusively to authenticated Vidyalankar institute Microsoft accounts.</p>
                <p>&bull; <strong>Session Isolation:</strong> No persistent login cookies are stored. Sessions expire automatically on tab close or after <strong>15 minutes of idle time</strong>.</p>
                <p>&bull; <strong>Authorized Role Mapping:</strong></p>
                <div className="pl-3 text-[10px] space-y-1 font-mono text-stone-300">
                  <div className="text-emerald-400">&bull; Admin: sujal.bhosle1@vsit.edu.in, asif.rampurawala@vsit.edu.in</div>
                  <div className="text-blue-400">&bull; Moderator: sujal.bhosle@vsit.edu.in, media.admin@vsit.edu.in</div>
                  <div className="text-amber-400">&bull; Faculty: All other @vsit.edu.in, @vit.edu.in, @vdt.edu.in logins</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 text-center">
              <p className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">
                &copy; {new Date().getFullYear()} Vidyalankar Dnyanpeeth Trust. All Rights Reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // --- MAIN APPLICATION LAYOUT ---
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vidyalankar Dnyanpeeth Trust | Venue Booking Portal</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className="bg-amber-50/40 text-stone-900 font-sans min-h-screen">
        <InspectProtection />
        {loading && (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-100 flex flex-col items-center justify-center gap-4 text-orange-400">
            <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-200">Verifying Microsoft Authentication...</p>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}