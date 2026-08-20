/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import './globals.css';
import InspectProtection from '@/components/InspectProtection';
import { resolveUserRole, getUserProfile, saveUserProfile } from '@/lib/accessControl';
import { ShieldCheck, Sparkles, Building2, Lock, AlertCircle, ArrowRight, User, Phone, Briefcase, GraduationCap } from 'lucide-react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [needsProfileOnboarding, setNeedsProfileOnboarding] = useState(false);
  
  // Profile Onboarding Form State
  const [profileName, setProfileName] = useState('');
  const [profileContact, setProfileContact] = useState('');
  const [profileInstitute, setProfileInstitute] = useState('VSIT');
  const [profileDepartment, setProfileDepartment] = useState('Information Technology');
  const [profileEmployeeId, setProfileEmployeeId] = useState('');

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

  useEffect(() => {
    if (session || userRole) {
      resetIdleTimer();
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
      const handleUserActivity = () => resetIdleTimer();

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
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
      window.localStorage.removeItem('userRole');
      window.localStorage.removeItem('userEmail');
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    setSession(null);
    setUserRole(null);
    setUserEmail('');
    alert("⚠️ Security Notice: Session closed after 15 minutes of inactivity.");
    window.location.reload();
  };

  const checkAuth = async () => {
    const savedRole = typeof window !== 'undefined' ? window.sessionStorage.getItem('userRole') : null;
    const savedEmail = typeof window !== 'undefined' ? window.sessionStorage.getItem('userEmail') : null;
    
    if (savedRole && savedEmail) {
      setUserRole(savedRole);
      setUserEmail(savedEmail);
      
      const existingProfile = getUserProfile(savedEmail);
      if (!existingProfile || !existingProfile.isCompleted) {
        setNeedsProfileOnboarding(true);
      }
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
      const isAllowed = ALLOWED_DOMAINS.includes(emailDomain) || ALLOWED_DOMAINS.some(d => email.endsWith(d));

      if (isAllowed) {
        const role = resolveUserRole(email);
        setSession(session);
        setUserRole(role);
        setUserEmail(email);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('userRole', role);
          window.sessionStorage.setItem('userEmail', email);
        }

        const existingProfile = getUserProfile(email);
        if (!existingProfile || !existingProfile.isCompleted) {
          setProfileName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0]);
          setNeedsProfileOnboarding(true);
        }
      } else {
        setAuthError(`Access Denied: ${email} is not an authorized institute email address.`);
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') window.sessionStorage.clear();
        setSession(null);
        setUserRole(null);
        setUserEmail('');
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
      setAuthError(e.message || "Failed to initiate Microsoft Authentication.");
      setLoading(false);
    }
  };

  const handleSaveProfileOnboarding = (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileContact.trim()) {
      return alert("⚠️ Please fill in all required profile details.");
    }

    const saved = saveUserProfile(userEmail, {
      name: profileName.trim(),
      contact: profileContact.trim(),
      institute: profileInstitute,
      department: profileDepartment,
      employeeId: profileEmployeeId.trim() || 'VDT-FACULTY',
      role: userRole || 'faculty'
    });

    if (saved) {
      setNeedsProfileOnboarding(false);
      alert("✅ Profile successfully registered! Details are now locked.");
    }
  };

  // --- FUTURISTIC VR/AR SPATIAL LOGIN SCREEN ---
  if (!loading && !session && !userRole) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Vidyalankar Dnyanpeeth Trust | Spatial Portal</title>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#f97316" />
        </head>
        <body className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans text-stone-100 selection:bg-orange-500 selection:text-white">
          <InspectProtection />
          
          {/* Spatial VR/AR Neon Perspective Glows */}
          <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] bg-gradient-to-br from-orange-600/30 via-amber-500/20 to-transparent rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-[-25%] right-[-15%] w-[650px] h-[650px] bg-gradient-to-tl from-indigo-600/30 via-purple-600/20 to-transparent rounded-full blur-[160px] pointer-events-none"></div>
          <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>

          {/* Spatial Glass Container */}
          <div className="w-full max-w-[480px] bg-[#12131c]/80 backdrop-blur-3xl border border-white/10 rounded-[38px] shadow-[0_20px_70px_rgba(0,0,0,0.7)] p-8 sm:p-12 relative z-10 animate-fade-in-up">
            
            {/* Holographic Header Pill */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 animate-ping"></div>
                <span className="text-[11px] font-black tracking-[0.2em] text-orange-400 uppercase">
                  Vidyalankar Dnyanpeeth Trust
                </span>
              </div>
            </div>

            {/* Portal Headline & Clean Description */}
            <div className="text-center space-y-3 mb-10">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight bg-gradient-to-r from-white via-stone-100 to-stone-400 bg-clip-text text-transparent">
                Step Into The Future
              </h1>
              <p className="text-stone-400 text-xs sm:text-[13px] font-medium leading-relaxed max-w-sm mx-auto">
                Centralized campus portal for automated venue scheduling, multi-tier clearances, and live streaming broadcasts across all trust institutes.
              </p>
            </div>

            {/* Error Message if any */}
            {authError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Microsoft Azure OAuth Entry Point */}
            <div className="space-y-6">
              <button 
                type="button" 
                onClick={handleMicrosoftLogin} 
                className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 transition-all duration-300 shadow-[0_10px_30px_rgba(37,99,235,0.35)] border border-blue-400/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
              >
                <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Sign in with Microsoft Outlook</span>
              </button>

              <div className="pt-4 border-t border-white/5 text-center">
                <p className="text-[11px] text-stone-500 font-semibold tracking-wider uppercase">
                  &copy; {new Date().getFullYear()} Vidyalankar Dnyanpeeth Trust
                </p>
              </div>
            </div>

          </div>
        </body>
      </html>
    );
  }

  // --- MAIN APPLICATION LAYOUT & FIRST-TIME PROFILE ONBOARDING MODAL ---
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
          <div className="fixed inset-0 bg-[#090a0f]/90 backdrop-blur-md z-100 flex flex-col items-center justify-center gap-4 text-orange-400">
            <div className="h-12 w-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-200">Connecting Vidyalankar Portal...</p>
          </div>
        )}

        {/* First-Time User Profile Setup Modal */}
        {needsProfileOnboarding && (
          <div className="fixed inset-0 z-100 bg-[#090a0f]/85 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#12131c] border border-white/10 rounded-[36px] shadow-2xl p-8 sm:p-10 space-y-6 animate-fade-in-up text-white">
              
              <div className="border-b border-white/10 pb-4">
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-orange-500/30 inline-block mb-2">
                  First-Time Account Setup
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Complete Your Profile
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Please provide your contact and department details to finalize your account records. Once submitted, these details are locked and can only be altered by an Admin.
                </p>
              </div>

              <form onSubmit={handleSaveProfileOnboarding} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-orange-400"/> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                    placeholder="e.g. Dr. Faculty Name" 
                    className="w-full bg-[#1b1d2a] border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-400"/> Contact Mobile
                    </label>
                    <input 
                      type="tel" 
                      value={profileContact} 
                      onChange={(e) => setProfileContact(e.target.value)} 
                      placeholder="+91 98765 43210" 
                      className="w-full bg-[#1b1d2a] border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-blue-400"/> Institute
                    </label>
                    <select 
                      value={profileInstitute} 
                      onChange={(e) => setProfileInstitute(e.target.value)} 
                      className="w-full bg-[#1b1d2a] border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500"
                    >
                      {['VSIT', 'VIT', 'VDT', 'VPT', 'VSB', 'VCP', 'VIIE'].map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-purple-400"/> Department
                    </label>
                    <input 
                      type="text" 
                      value={profileDepartment} 
                      onChange={(e) => setProfileDepartment(e.target.value)} 
                      placeholder="e.g. Information Technology" 
                      className="w-full bg-[#1b1d2a] border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                      Employee / Faculty ID
                    </label>
                    <input 
                      type="text" 
                      value={profileEmployeeId} 
                      onChange={(e) => setProfileEmployeeId(e.target.value)} 
                      placeholder="e.g. EMP-2026-042" 
                      className="w-full bg-[#1b1d2a] border border-white/10 p-3.5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <span>Save & Confirm Verified Profile</span> <ArrowRight size={16}/>
                </button>
              </form>

            </div>
          </div>
        )}

        {children}
      </body>
    </html>
  );
}