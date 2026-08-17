'use client';
import { supabase } from '@/lib/supabaseClient';

export default function LoginButton() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email',
        // This ensures they are redirected back to your home page
        redirectTo: window.location.origin, 
      },
    });
    if (error) console.error("Login Error:", error.message);
  };

  return (
    <button 
      onClick={handleLogin}
      className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded shadow-lg"
    >
      Sign in with College Email (Outlook)
    </button>
  );
}