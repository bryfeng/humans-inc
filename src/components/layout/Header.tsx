import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/lib/auth-actions';
import { cache } from 'react';

// Cache the profile fetch to avoid multiple database calls
const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', userId)
    .single();
  return data;
});

const Header = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile data if user is logged in - use cached version
  let profile = null;
  if (user) {
    profile = await getCachedProfile(user.id);
  }

  const displayName =
    profile?.display_name || profile?.username || user?.email?.split('@')[0];

  return (
    <header className="border-foreground/5 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-foreground hover:text-primary text-2xl font-bold tracking-tight transition-colors duration-200"
        >
          humans.inc
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            // Logged in state - more sophisticated design
            <div className="hidden items-center space-x-6 sm:flex">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border">
                  <span className="text-primary text-xs font-medium uppercase">
                    {displayName?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-accent text-sm font-medium">
                  {displayName}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <form action={logout} className="inline">
                  <button
                    type="submit"
                    className="text-foreground/60 hover:text-foreground/80 hover:bg-muted/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </form>
              </div>

              {/* Theme toggle for desktop logged-in users */}
              <ThemeToggle />
            </div>
          ) : (
            // Logged out state - elegant and inviting
            <div className="hidden items-center space-x-4 sm:flex">
              <Link
                href="/login"
                className="text-foreground/70 hover:text-foreground hover:bg-muted/40 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-background hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              >
                Get Started
              </Link>

              {/* Theme toggle for desktop logged-out users */}
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* Mobile menu button - we'll enhance this later */}
        <div className="flex items-center space-x-2 sm:hidden">
          {user && (
            <div className="bg-primary/10 border-primary/20 flex h-7 w-7 items-center justify-center rounded-full border">
              <span className="text-primary text-xs font-medium uppercase">
                {displayName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
