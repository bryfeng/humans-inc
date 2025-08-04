'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { OnboardingState } from '../types';
import { DEFAULT_ONBOARDING_STATE } from '../types';
import { getOnboardingState } from '../actions/onboarding-actions';

interface OnboardingContextType {
  onboardingState: OnboardingState;
  setOnboardingState: (state: OnboardingState) => void;
  refreshOnboardingState: () => Promise<void>;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

interface OnboardingProviderProps {
  children: ReactNode;
  userId: string;
}

export function OnboardingProvider({
  children,
  userId,
}: OnboardingProviderProps) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(
    DEFAULT_ONBOARDING_STATE
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshOnboardingState = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const state = await getOnboardingState(userId);
      setOnboardingState(state || DEFAULT_ONBOARDING_STATE);
    } catch (error) {
      console.error('Error refreshing onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshOnboardingState();
  }, [userId, refreshOnboardingState]);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingState,
        setOnboardingState,
        refreshOnboardingState,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
