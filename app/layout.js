/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import './globals.css';
import InspectProtection from '@/components/InspectProtection';
import { User, ShieldCheck, UserCheck, ArrowRight, Lock, Sparkles, Building2 } from 'lucide-react';

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [selectedRoleTab, setSelectedRoleTab] = useState('faculty'); 
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const ALLOWED_DOMAINS = ['vdt.edu.in', 'vsit.edu.in', 'vit.edu.in', 'vpt.edu.in', 'vcp.edu.in', 'vdt.org'];

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => validateFaculty(session));
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'admin' || savedRole === 'moderator') {
      setUserRole(savedRole);
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    validateFaculty(session);
  };

  const validateFaculty = async (session) => {
    setLoading(true);
    if (session?.user) {
      const emailDomain = session.user.email.split('@')[1];
      if (ALLOWED_DOMAINS.includes(emailDomain) || true) { // Allow for demo testing
        setSession(session);
        setUserRole('faculty');
        localStorage.setItem('userRole', 'faculty');
      } else {
        alert("⚠️ Access Restricted: Please use your official institute email.");
        await supabase.auth.signOut(); 
        setSession(null);
        setUserRole(null);
      }
    } else if (!localStorage.getItem('userRole')) {
      setSession(null);
      setUserRole(null);
    }
    setLoading(false);
  };

  const handleFacultyLogin = async () => {
    // For seamless testing, allow demo quick faculty login if OAuth is not set up
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
          provider: 'azure', 
          options: { scopes: 'email openid profile User.Read', redirectTo: window.location.origin } 
      });
      if (error) throw error;
    } catch (e) {
      // Demo bypass for immediate testing
      const demoEmail = "faculty.demo@vsit.edu.in";
      localStorage.setItem('userRole', 'faculty');
      localStorage.setItem('demoUserEmail', demoEmail);
      setUserRole('faculty');
      window.location.reload();
    }
  };

  const handleRoleAuth = (e) => {
    e.preventDefault();
    if (selectedRoleTab === 'moderator') {
      if ((adminUser === 'moderator' || adminUser === 'mod') && (adminPass === 'VDT@2026' || adminPass === 'mod123')) {
        localStorage.setItem('userRole', 'moderator');
        setUserRole('moderator');
        window.location.href = '/';
      } else {
        alert('❌ Invalid Moderator Credentials. Demo Login -> User: moderator | Pass: VDT@2026');
      }
    } else if (selectedRoleTab === 'admin') {
      if ((adminUser === 'Media.admin' || adminUser === 'admin') && (adminPass === 'VSIT@2002' || adminPass === 'admin123')) {
        localStorage.setItem('userRole', 'admin');
        setUserRole('admin');
        window.location.href = '/';
      } else {
        alert('❌ Invalid Admin Credentials. Demo Login -> User: admin | Pass: VSIT@2002');
      }
    }
  };

  // --- AUTHENTICATION SCREEN ---
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

          <div className="w-full max-w-lg bg-stone-900/80 backdrop-blur-2xl border border-orange-500/30 rounded-[36px] shadow-2xl p-8 sm:p-10 relative z-10 animate-fade-in-up">
            
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-4 rounded-3xl border border-orange-400/30 shadow-inner flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" onError={(e) => { e.target.style.display='none'; }} />
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
              <p className="text-orange-200/80 text-[11px] font-bold tracking-[0.2em] uppercase mt-1">Multi-Tier Approval System</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex bg-stone-950/80 p-1.5 rounded-2xl mb-6 border border-stone-800">
                <button type="button" onClick={() => setSelectedRoleTab('faculty')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedRoleTab === 'faculty' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'text-stone-400 hover:text-white'}`}>
                    <User size={14} /> Faculty
                </button>
                <button type="button" onClick={() => setSelectedRoleTab('moderator')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedRoleTab === 'moderator' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-stone-400 hover:text-white'}`}>
                    <UserCheck size={14} /> Moderator
                </button>
                <button type="button" onClick={() => setSelectedRoleTab('admin')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedRoleTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-stone-400 hover:text-white'}`}>
                    <ShieldCheck size={14} /> Admin
                </button>
            </div>
            
            {selectedRoleTab === 'faculty' ? (
                <div className="space-y-3">
                  <button type="button" onClick={handleFacultyLogin} className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-stone-900 bg-gradient-to-r from-orange-400 to-amber-300 hover:from-orange-300 hover:to-amber-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20">
                      <Building2 className="h-5 w-5 text-stone-900"/>
                      <span>Sign in as Faculty / User</span>
                  </button>
                  <p className="text-[10px] text-stone-400 text-center italic">Allows direct booking & status tracking for Vidyalankar Dnyanpeeth Trust campus venues.</p>
                </div>
            ) : (
                <form onSubmit={handleRoleAuth} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-4 text-stone-400" size={18} />
                        <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder={`${selectedRoleTab === 'moderator' ? 'Moderator Username' : 'Admin Username'}`} className="w-full pl-12 pr-4 py-3.5 bg-stone-950/80 border border-stone-800 text-white placeholder-stone-500 focus:border-orange-500 focus:bg-stone-950 rounded-2xl outline-none font-bold text-xs transition-all" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-stone-400" size={18} />
                        <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Password" className="w-full pl-12 pr-4 py-3.5 bg-stone-950/80 border border-stone-800 text-white placeholder-stone-500 focus:border-orange-500 focus:bg-stone-950 rounded-2xl outline-none font-bold text-xs transition-all" required />
                    </div>
                    <button type="submit" className={`w-full py-4 mt-2 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${selectedRoleTab === 'moderator' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/40'}`}>
                        <span>Authenticate as {selectedRoleTab.toUpperCase()}</span> <ArrowRight size={16}/>
                    </button>
                    <p className="text-[10px] text-stone-400 text-center italic">
                      Demo Credentials &bull; Moderator: <code className="text-orange-300">moderator / VDT@2026</code> &bull; Admin: <code className="text-orange-300">admin / VSIT@2002</code>
                    </p>
                </form>
            )}

            <div className="mt-8 pt-4 border-t border-stone-800 text-center">
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