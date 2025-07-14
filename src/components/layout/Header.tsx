import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/lib/auth-actions';

const Header = async () => {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile data if user is logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200 tracking-tight"
        >
          humans.inc
        </Link>
        
        <div className="flex items-center space-x-6">
          {user ? (
            // Logged in state - more sophisticated design
            <div className="hidden sm:flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary uppercase">
                    {displayName?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-accent">
                  {displayName}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-muted/50"
                >
                  Dashboard
                </Link>
                <form action={logout} className="inline">
                  <button
                    type="submit"
                    className="text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-muted/30"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Logged out state - elegant and inviting
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-muted/40"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-primary text-background hover:bg-primary/90 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          )}
          
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile menu button - we'll enhance this later */}
        <div className="sm:hidden flex items-center space-x-2">
          {user && (
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary uppercase">
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
