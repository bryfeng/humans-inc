'use client';

// Placeholder for Dashboard Tour component
// This will be implemented in a future iteration

interface DashboardTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function DashboardTour({
  isActive,
  onComplete,
  onSkip,
}: DashboardTourProps) {
  if (!isActive) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Tour implementation will go here */}
      <div className="pointer-events-auto absolute top-4 right-4">
        <div className="bg-background border-foreground/20 max-w-sm rounded-lg border p-4 shadow-lg">
          <h3 className="mb-2 font-semibold">Dashboard Tour</h3>
          <p className="text-foreground/70 mb-3 text-sm">
            Tour implementation coming soon. For now, we'll mark this as
            complete.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="border-foreground/20 hover:bg-foreground/5 rounded border px-3 py-1 text-sm transition-colors"
            >
              Skip
            </button>
            <button
              onClick={onComplete}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-sm transition-colors"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
