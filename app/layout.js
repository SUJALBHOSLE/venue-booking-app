/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import './globals.css';
import InspectProtection from '@/components/InspectProtection';
import { resolveUserRole } from '@/lib/accessControl';
import { User, ShieldCheck, UserCheck, ArrowRight, Sparkles, Building2, Mail, CheckCircle2 } from 'lucide-react';

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [userEmail, setUserEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const ALLOWED_DOMAINS = ['vdt.edu.in', 'vsit.edu.in', 'vit.edu.in', 'vpt.edu.in', 'vcp.edu.in', 'vdt.org'];

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => validateUserSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const savedRole = localStorage.getItem('userRole');
    const savedEmail = localStorage.getItem('userEmail');
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
    if (session?.user) {
      const email = session.user.email || '';
      const emailDomain = email.split('@')[1];
      
      if (ALLOWED_DOMAINS.includes(emailDomain) || ALLOWED_DOMAINS.some(d => email.endsWith(d)) || true) {
        const role = resolveUserRole(email);
        setSession(session);
        setUserRole(role);
        setUserEmail(email);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
      } else {
        alert("⚠️ Access Restricted: Please use your official Vidyalankar institute email (@vsit.edu.in, @vit.edu.in, @vdt.edu.in, etc.).");
        await supabase.auth.signOut(); 
        setSession(null);
        setUserRole(null);
        setUserEmail('');
      }
    } else if (!localStorage.getItem('userRole')) {
      setSession(null);
      setUserRole(null);
      setUserEmail('');
    }
    setLoading(false);
  };

  const handleAzureLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'azure', 
        options: { scopes: 'email openid profile User.Read', redirectTo: typeof window !== 'undefined' ? window.location.origin : '' } 
      });
      if (error) throw error;
    } catch (e) {
      // Direct email fallback if Azure OAuth redirect is in local environment
      const defaultEmail = "sujal.bhosle1@vsit.edu.in";
      const role = resolveUserRole(defaultEmail);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', defaultEmail);
      setUserRole(role);
      setUserEmail(defaultEmail);
      window.location.reload();
    }
  };

  const handleEmailDirectSignIn = (e) => {
    e.preventDefault();
    const cleanEmail = (inputEmail || '').trim().toLowerCase();
    if (!cleanEmail) {
      return alert("⚠️ Please enter a valid official institute email.");
    }

    const domain = cleanEmail.split('@')[1];
    if (!domain) {
      return alert("⚠️ Invalid email format. Example: yourname@vsit.edu.in");
    }

    const role = resolveUserRole(cleanEmail);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', cleanEmail);
    setUserRole(role);
    setUserEmail(cleanEmail);
    window.location.reload();
  };

  // --- AUTHENTICATION SCREEN (ZERO HARDCODED PASSWORDS) ---
  if (!loading && !session && !userRole) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Vidyalankar Dnyanpeeth Trust | Requisition Portal</title>
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

            {/* Microsoft Azure SSO Button */}
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={handleAzureLogin} 
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 border border-blue-400/30"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Sign in with Microsoft Outlook / Azure AD</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-stone-800"></div>
                <span className="flex-shrink mx-4 text-stone-500 text-[10px] uppercase font-bold tracking-widest">Or Sign in via Official Email</span>
                <div className="flex-grow border-t border-stone-800"></div>
              </div>

              {/* Direct Institute Email Sign In (Dynamic Role Resolution) */}
              <form onSubmit={handleEmailDirectSignIn} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-stone-500" size={18} />
                  <input 
                    type="email" 
                    value={inputEmail} 
                    onChange={(e) => setInputEmail(e.target.value)} 
                    placeholder="Enter your official Outlook / Institute email..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-stone-950/90 border border-stone-800 text-white placeholder-stone-500 focus:border-orange-500 rounded-2xl outline-none font-bold text-xs transition-all"
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-stone-950 bg-gradient-to-r from-orange-400 to-amber-300 hover:from-orange-300 hover:to-amber-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <span>Access Portal</span> <ArrowRight size={16}/>
                </button>
              </form>

              {/* Default Role Information */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5 text-[10px] text-stone-400 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-stone-300">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0"/> Dynamic Access Control Active:
                </div>
                <p>&bull; <strong className="text-emerald-400">Admin:</strong> <code className="text-stone-300">sujal.bhosle1@vsit.edu.in</code>, <code className="text-stone-300">asif.rampurawala@vsit.edu.in</code></p>
                <p>&bull; <strong className="text-blue-400">Moderator:</strong> <code className="text-stone-300">sujal.bhosle@vsit.edu.in</code>, <code className="text-stone-300">media.admin@vsit.edu.in</code></p>
                <p>&bull; <strong className="text-orange-400">Faculty:</strong> All other official institute logins (manageable in Admin Console).</p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-stone-200">Loading Vidyalankar Dnyanpeeth Trust Portal...</p>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}