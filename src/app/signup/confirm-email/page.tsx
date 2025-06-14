// src/app/signup/confirm-email/page.tsx
import Link from 'next/link';

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <Link
            href="/"
            className="text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            humans.inc
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Check your email</h2>
          <p className="mt-2 text-sm text-foreground/60">
            We&apos;ve sent you a confirmation link
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 border border-foreground/20 rounded-lg bg-background">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-foreground/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-foreground/80 mb-2">
              We&apos;ve sent a confirmation link to your email address.
            </p>
            <p className="text-sm text-foreground/60">
              Please click the link in the email to complete your signup and
              verify your account.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-foreground text-background hover:opacity-90 font-medium py-3 px-4 rounded-lg transition-opacity text-center"
            >
              Return to Homepage
            </Link>
            <Link
              href="/login"
              className="block w-full border border-foreground/20 text-foreground hover:bg-foreground/5 font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="text-xs text-foreground/60">
          <p>
            Didn&apos;t receive the email? Check your spam folder or contact
            support.
          </p>
        </div>
      </div>
    </div>
  );
}
