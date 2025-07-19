'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Suspense } from 'react';
import { login } from '@/features/auth/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-foreground text-background focus:ring-foreground/20 w-full rounded-lg px-4 py-3 font-medium transition-opacity hover:opacity-90 focus:ring-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
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

export function LoginForm() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link
          href="/"
          className="text-2xl font-bold transition-opacity hover:opacity-80"
        >
          humans.inc
        </Link>
        <h2 className="mt-6 text-3xl font-bold">Welcome back</h2>
        <p className="text-foreground/60 mt-2 text-sm">
          Sign in to your account
        </p>
      </div>

      <Suspense fallback={null}>
        <ErrorMessage />
      </Suspense>

      <form action={login} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:ring-foreground/20 focus:border-foreground/40 w-full rounded-lg border px-3 py-3 transition-colors focus:ring-2 focus:outline-hidden"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="border-foreground/20 bg-background text-foreground placeholder-foreground/40 focus:ring-foreground/20 focus:border-foreground/40 w-full rounded-lg border px-3 py-3 transition-colors focus:ring-2 focus:outline-hidden"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <SubmitButton />
      </form>

      <div className="text-center">
        <p className="text-foreground/60 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
