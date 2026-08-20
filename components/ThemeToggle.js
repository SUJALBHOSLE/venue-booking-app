'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Dark Mode / Light Mode Toggle Button
 * Positioned in the top right header.
 * Persists user preference in localStorage.
 */
export default function ThemeToggle({ theme, setTheme }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (typeof document !== 'undefined') {
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
      } else {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
      }
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-md hover:scale-105 active:scale-95 text-xs font-bold shrink-0 bg-stone-900/90 border-stone-700 text-stone-200 hover:text-white hover:border-orange-500 hover:shadow-orange-500/20"
    >
      {theme === 'dark' ? (
        <>
          <Sun size={15} className="text-amber-400 animate-spin-slow" />
          <span className="hidden sm:inline text-amber-300">Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={15} className="text-indigo-400" />
          <span className="hidden sm:inline text-indigo-300">Dark Mode</span>
        </>
      )}
    </button>
  );
}
