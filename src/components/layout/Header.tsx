import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-semibold hover:opacity-80 transition-opacity"
        >
          humans.inc
        </Link>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-foreground text-background hover:opacity-90 px-3 py-1.5 rounded-md transition-opacity"
            >
              Sign Up
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
