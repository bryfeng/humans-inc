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
    .maybeSingle(); // Use maybeSingle() to handle 0 or 1 rows

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

  // Create default state if none exists
  const defaultState = {
    has_seen_welcome: false,
    has_created_bio: false,
    has_seen_dashboard_tour: false,
    has_published_first_block: false,
    completion_percentage: 0,
    last_step_completed: null,
    tour_dismissed: false,
  };

  // Merge with current state and updates
  const newState = { ...defaultState, ...currentState, ...updates };

  console.log('updateOnboardingState:', {
    userId,
    currentState,
    updates,
    newState,
    completion_percentage: newState.completion_percentage,
  });

  // Calculate completion percentage
  const totalSteps = 4; // welcome, bio, tour, publish
  const completedSteps = [
    newState.has_seen_welcome,
    newState.has_created_bio,
    newState.has_seen_dashboard_tour,
    newState.has_published_first_block,
  ].filter(Boolean).length;

  newState.completion_percentage = Math.round(
    (completedSteps / totalSteps) * 100
  );

  // Use upsert to handle cases where profile doesn't exist yet
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      onboarding_state: newState,
      ...(newState.completion_percentage === 100
        ? { onboarding_completed_at: new Date().toISOString() }
        : {}),
    },
    {
      onConflict: 'id',
    }
  );

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
  console.log('markFirstBlockPublished called for userId:', userId);
  const result = await updateOnboardingState(userId, {
    has_published_first_block: true,
    last_step_completed: 'first_publish',
  });
  console.log('markFirstBlockPublished result:', result);
  return result;
}

export async function dismissTour(userId: string) {
  return updateOnboardingState(userId, {
    tour_dismissed: true,
  });
}

export async function markOnboardingAsCompleted(userId: string) {
  console.log('markOnboardingAsCompleted called for userId:', userId);
  const result = await updateOnboardingState(userId, {
    has_seen_welcome: true,
    has_created_bio: true,
    has_seen_dashboard_tour: true,
    has_published_first_block: true,
    last_step_completed: 'onboarding_complete',
  });
  console.log('markOnboardingAsCompleted result:', result);
  return result;
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
