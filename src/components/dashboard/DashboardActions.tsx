'use client';

import { logout } from '@/lib/auth-actions';

export function DashboardActions() {
  return (
    <div className="bg-background border-foreground/10 rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>

      <div className="space-y-3">
        <form action={logout} className="w-full">
          <button
            type="submit"
            className="bg-foreground/10 text-foreground/80 hover:bg-foreground/20 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </form>

        {/* Placeholder for future actions */}
        <button
          disabled
          className="bg-foreground/5 text-foreground/40 w-full cursor-not-allowed rounded-md px-4 py-2 text-sm font-medium"
          title="Coming soon"
        >
          Settings (Coming Soon)
        </button>

        <button
          disabled
          className="bg-foreground/5 text-foreground/40 w-full cursor-not-allowed rounded-md px-4 py-2 text-sm font-medium"
          title="Coming soon"
        >
          Help & Support (Coming Soon)
        </button>
      </div>
    </div>
  );
}
