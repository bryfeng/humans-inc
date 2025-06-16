'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Suspense } from 'react';
import { login } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-foreground text-background hover:opacity-90 font-medium py-3 px-4 rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Logging In...' : 'Log In'}
    </button>
  );
}

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="text-sm text-red-800">{error}</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            humans.inc
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Sign in to your account
          </p>
        </div>

        <Suspense fallback={null}>
          <ErrorMessage />
        </Suspense>

        <form action={login} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <SubmitButton />
        </form>

        <div className="text-center">
          <p className="text-sm text-foreground/60">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-foreground hover:opacity-80 transition-opacity"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
