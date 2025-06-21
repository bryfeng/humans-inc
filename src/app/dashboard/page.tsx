import { logout } from '@/features/auth/lib/actions';

export default function DashboardPage() {
  return (
    <div className="container mx-auto flex h-full max-w-lg flex-col items-center justify-center px-6 py-12">
      <div className="w-full text-center">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-foreground/80 mt-4 text-lg">
          This is a protected page. You can only see this if you are logged in.
        </p>
        <form action={logout} className="mt-8">
          <button
            type="submit"
            className="bg-foreground text-background w-full rounded-md px-4 py-2 transition-opacity hover:opacity-90"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
