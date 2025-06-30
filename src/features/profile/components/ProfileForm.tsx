'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import {
  updateProfile,
  type ProfileFormState,
} from '../actions/update-profile';
import { checkUsernameAvailability } from '../actions/check-username';
import type { UserProfile } from '@/types';

const initialState: ProfileFormState = {
  success: false,
  message: '',
  errors: undefined,
};

function SubmitButton({
  isUsernameAvailable,
}: {
  isUsernameAvailable: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || !isUsernameAvailable}
      className="bg-foreground text-background focus:ring-foreground/20 w-full rounded-lg px-4 py-3 font-medium transition-opacity hover:opacity-90 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Updating...' : 'Update Profile'}
    </button>
  );
}

export function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (username === profile?.username || username.length < 3) {
      setIsAvailable(true);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      const result = await checkUsernameAvailability(username);
      setIsAvailable(result.isAvailable);
      setIsLoading(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [username, profile?.username]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="text-foreground/80 block text-sm font-medium"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-background border-foreground/20 placeholder-foreground/40 focus:ring-foreground/50 focus:border-foreground/50 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
          required
        />
        <div className="mt-2 text-sm">
          {isLoading && <p className="text-foreground/60">Checking...</p>}
          {!isLoading && !isAvailable && (
            <p className="text-red-600">Username is already taken.</p>
          )}
          {state?.errors?.username && (
            <p className="text-red-600">{state.errors.username.join(', ')}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="display_name"
          className="text-foreground/80 block text-sm font-medium"
        >
          Display Name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile?.display_name ?? ''}
          className="bg-background border-foreground/20 placeholder-foreground/40 focus:ring-foreground/50 focus:border-foreground/50 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
        />
        {state?.errors?.display_name && (
          <p className="mt-2 text-sm text-red-600">
            {state.errors.display_name.join(', ')}
          </p>
        )}
      </div>

      <SubmitButton isUsernameAvailable={isAvailable} />

      {state?.message && (
        <p
          className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
