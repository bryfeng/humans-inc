'use client';

import * as React from 'react';

// Beautiful icons with smooth animations
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-12"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:-rotate-12"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const shouldBeDark =
      savedTheme === 'dark' || (savedTheme === null && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  if (!mounted) {
    // Avoid rendering mismatch during hydration
    return (
      <div className="bg-muted/50 border-foreground/10 h-9 w-9 animate-pulse rounded-lg border"></div>
    );
  }

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="group bg-muted/40 hover:bg-muted/60 border-foreground/5 hover:border-foreground/10 relative rounded-xl border p-2.5 shadow-xs transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md active:scale-95"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        <div className="text-foreground/80 hover:text-foreground transition-colors duration-200">
          {isDark ? <SunIcon /> : <MoonIcon />}
        </div>

        {/* Subtle glow effect */}
        <div className="from-primary/20 to-primary/10 absolute inset-0 -z-10 rounded-lg bg-linear-to-r opacity-0 blur-xs transition-opacity duration-300 group-hover:opacity-100"></div>
      </div>
    </button>
  );
}
