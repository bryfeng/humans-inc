'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from './OnboardingProvider';
import { markOnboardingAsCompleted } from '../actions/onboarding-actions';
import type { OnboardingMilestone } from '../types';

interface OnboardingProgressProps {
  onStartWelcome: () => void;
  onStartBioCreation: () => void;
  userId: string;
}

export function OnboardingProgress({
  onStartWelcome,
  onStartBioCreation,
  userId,
}: OnboardingProgressProps) {
  const { onboardingState, isLoading, refreshOnboardingState } =
    useOnboarding();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Debug log to see what's happening
  console.log('OnboardingProgress debug:', {
    onboardingState,
    has_published_first_block: onboardingState.has_published_first_block,
    completion_percentage: onboardingState.completion_percentage,
  });

  if (isLoading || onboardingState.completion_percentage === 100) {
    return null;
  }

  const handleFinishOnboarding = async () => {
    setIsCompleting(true);
    try {
      await markOnboardingAsCompleted(userId);
      // Refresh the onboarding state to trigger UI updates
      await refreshOnboardingState();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const milestones: OnboardingMilestone[] = [
    {
      id: 'welcome',
      title: 'Learn about blocks',
      description: 'Understand how content blocks work',
      completed: onboardingState.has_seen_welcome,
      icon: '👋',
      action: onStartWelcome,
    },
    {
      id: 'bio',
      title: 'Set up profile & create bio',
      description: 'Add your profile and create your first block',
      completed: onboardingState.has_created_bio,
      icon: '✍️',
      action: onStartBioCreation,
    },
    {
      id: 'finish',
      title: "You're all set!",
      description: 'Start exploring and creating content',
      completed: onboardingState.has_published_first_block,
      icon: '🚀',
    },
  ];

  const nextMilestone = milestones.find((m) => !m.completed);
  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="from-primary/10 to-secondary/10 border-primary/20 rounded-xl border bg-gradient-to-r p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold">Getting Started</h3>
              <p className="text-foreground/70 text-sm">
                {completedCount} of {milestones.length} steps completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-primary text-2xl font-bold">
                {onboardingState.completion_percentage}%
              </div>
              <div className="text-foreground/60 text-xs">Complete</div>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-foreground/10 hover:bg-foreground/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            >
              <motion.span
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm"
              >
                ▼
              </motion.span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-foreground/10 mt-4 h-2 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${onboardingState.completion_percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="from-primary to-secondary h-full bg-gradient-to-r"
          />
        </div>

        {/* Milestones */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2"
            >
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                    milestone.completed
                      ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'bg-foreground/5 border-foreground/10 border'
                  }`}
                >
                  <div className="text-lg">{milestone.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-medium ${milestone.completed ? 'text-green-700 dark:text-green-300' : ''}`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.completed && (
                        <span className="text-sm text-green-600">✓</span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        milestone.completed
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground/60'
                      }`}
                    >
                      {milestone.description}
                    </p>
                  </div>

                  {!milestone.completed && milestone === nextMilestone && (
                    <>
                      {milestone.action && (
                        <button
                          onClick={milestone.action}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1 text-sm transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {milestone.id === 'finish' && (
                        <button
                          onClick={handleFinishOnboarding}
                          disabled={isCompleting}
                          className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                        >
                          {isCompleting ? 'Finishing...' : 'Finish'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Action */}
        {!isCollapsed && nextMilestone && nextMilestone.action && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-primary/10 border-primary/20 mt-4 rounded-lg border p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-primary font-medium">Next Step</h4>
                <p className="text-primary/80 text-sm">{nextMilestone.title}</p>
              </div>
              <button
                onClick={nextMilestone.action}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
