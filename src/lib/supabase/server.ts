// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // The primary way to get cookies

// Making createClient async to address TS perceiving cookies() as a Promise
export async function createClient() {
  // Await cookies() if TypeScript insists it's a Promise
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          // If cookieStore is the resolved object, .get() should now be valid according to TS
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Use the resolved cookieStore from the outer scope.
            // Check if 'set' method exists on it.
            if ('set' in cookieStore && typeof cookieStore.set === 'function') {
              // If the type guard passes, TypeScript should allow calling set.
              cookieStore.set(name, value, options);
            } else {
              // This branch would be taken if cookieStore is truly Readonly
              // or if 'set' is not a function for some reason.
              // console.warn("Supabase server client: 'set' operation attempted but 'set' method not available on cookie store.");
            }
          } catch (error) {
            // console.warn(`Supabase server client: Failed to set cookie '${name}'. Error: ${error}`);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Use the resolved cookieStore from the outer scope.
            if ('set' in cookieStore && typeof cookieStore.set === 'function') {
              cookieStore.set(name, '', options); // Remove by setting value to empty
            } else {
              // console.warn("Supabase server client: 'remove' operation attempted but 'set' method not available on cookie store.");
            }
          } catch (error) {
            // console.warn(`Supabase server client: Failed to remove cookie '${name}'. Error: ${error}`);
          }
        },
      },
    }
  );
}
