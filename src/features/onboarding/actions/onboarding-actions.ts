'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { OnboardingState } from '../types';

export async function getOnboardingState(
  userId: string
): Promise<OnboardingState | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_state')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching onboarding state:', error);
    return null;
  }

  return data?.onboarding_state || null;
}

export async function updateOnboardingState(
  userId: string,
  updates: Partial<OnboardingState>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // First get current state
  const currentState = await getOnboardingState(userId);

  // Merge with updates
  const newState = { ...currentState, ...updates };

  // Calculate completion percentage
  const totalSteps = 5; // welcome, bio, tour, publish, completed
  const completedSteps = [
    newState.has_seen_welcome,
    newState.has_created_bio,
    newState.has_seen_dashboard_tour,
    newState.has_published_first_block,
  ].filter(Boolean).length;

  newState.completion_percentage = Math.round(
    (completedSteps / totalSteps) * 100
  );

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_state: newState,
      ...(newState.completion_percentage === 100
        ? { onboarding_completed_at: new Date().toISOString() }
        : {}),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating onboarding state:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function markWelcomeAsSeen(userId: string) {
  return updateOnboardingState(userId, {
    has_seen_welcome: true,
    last_step_completed: 'welcome',
  });
}

export async function markBioAsCreated(userId: string) {
  return updateOnboardingState(userId, {
    has_created_bio: true,
    last_step_completed: 'bio_creation',
  });
}

export async function markTourAsSeen(userId: string) {
  return updateOnboardingState(userId, {
    has_seen_dashboard_tour: true,
    last_step_completed: 'dashboard_tour',
  });
}

export async function markFirstBlockPublished(userId: string) {
  return updateOnboardingState(userId, {
    has_published_first_block: true,
    last_step_completed: 'first_publish',
  });
}

export async function dismissTour(userId: string) {
  return updateOnboardingState(userId, {
    tour_dismissed: true,
  });
}

export async function resetOnboarding(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_state: {},
      onboarding_completed_at: null,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error resetting onboarding:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
