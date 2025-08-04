// Onboarding state structure
export interface OnboardingState {
  has_seen_welcome: boolean;
  has_created_bio: boolean;
  has_seen_dashboard_tour: boolean;
  has_published_first_block: boolean;
  tour_dismissed: boolean;
  last_step_completed: string;
  completion_percentage: number;
}

// Default onboarding state for new users
export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  has_seen_welcome: false,
  has_created_bio: false,
  has_seen_dashboard_tour: false,
  has_published_first_block: false,
  tour_dismissed: false,
  last_step_completed: '',
  completion_percentage: 0,
};

// Onboarding steps enum for type safety
export enum OnboardingStep {
  WELCOME = 'welcome',
  BIO_CREATION = 'bio_creation',
  DASHBOARD_TOUR = 'dashboard_tour',
  FIRST_PUBLISH = 'first_publish',
  COMPLETED = 'completed',
}

// Progress milestones
export interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
  action?: () => void;
}

// Recommendation types
export interface OnboardingRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  blockType?: string;
  priority: number;
}

// Tour step definition
export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showNext?: boolean;
  showPrev?: boolean;
  showSkip?: boolean;
}
