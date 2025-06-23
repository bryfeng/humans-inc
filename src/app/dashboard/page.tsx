import { logout } from '@/features/auth/lib/actions';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="container mx-auto h-full max-w-lg px-6 py-12">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-foreground/80 mt-2 text-lg">
            Update your username and display name.
          </p>
        </div>

        <div className="border-foreground/10 bg-foreground/5 w-full rounded-lg border p-6">
          <ProfileForm profile={profile} />
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="bg-foreground/10 text-foreground/80 w-full rounded-md px-4 py-2 text-sm transition-opacity hover:opacity-90"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
