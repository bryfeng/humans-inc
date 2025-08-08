'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
// Sample block views for demo - simplified to avoid boundary violations
import { markWelcomeAsSeen } from '../actions/onboarding-actions';
import { useOnboarding } from './OnboardingProvider';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBioCreation: () => void;
  userId: string;
}

// Simple demo components to avoid boundary violations
function DemoBioBlock() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="bg-foreground/10 flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h3 className="text-xl font-bold">Your Name</h3>
          <p className="text-foreground/70">Your unique tagline here</p>
        </div>
      </div>
      <p className="text-foreground/80">
        A few sentences about yourself, your work, and what you're passionate
        about.
      </p>
      <div className="flex gap-2">
        <span className="bg-foreground/10 rounded-full px-3 py-1 text-sm">
          Website
        </span>
        <span className="bg-foreground/10 rounded-full px-3 py-1 text-sm">
          Twitter
        </span>
        <span className="bg-foreground/10 rounded-full px-3 py-1 text-sm">
          Email
        </span>
      </div>
    </div>
  );
}

function DemoTextBlock() {
  return (
    <div className="space-y-2">
      <p className="text-foreground/80">
        Welcome to my space! Here I share my thoughts, projects, and the things
        that inspire me.
      </p>
    </div>
  );
}

function DemoLinksBlock() {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Links</h4>
      <div className="space-y-2">
        <div className="border-foreground/20 rounded-lg border p-3">
          <h5 className="font-medium">My Latest Project</h5>
          <p className="text-foreground/70 text-sm">
            Something I've been working on recently
          </p>
        </div>
        <div className="border-foreground/20 rounded-lg border p-3">
          <h5 className="font-medium">Favorite Article</h5>
          <p className="text-foreground/70 text-sm">
            A piece that changed my perspective
          </p>
        </div>
      </div>
    </div>
  );
}

export function WelcomeModal({
  isOpen,
  onClose,
  onStartBioCreation,
  userId,
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { refreshOnboardingState } = useOnboarding();

  // Profile setup form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const steps = [
    {
      title: 'Welcome to Your Digital Space',
      content:
        'Create a curated page that tells your story through organized content blocks.',
      showDemo: false,
      isProfileStep: false,
    },
    {
      title: 'Set Up Your Profile',
      content:
        "First, let's set up your username and display name so you can start creating content.",
      showDemo: false,
      isProfileStep: true,
    },
    {
      title: 'Ready to Start?',
      content:
        "Great! Now let's create your first block - a bio block that introduces you to visitors.",
      showDemo: true,
      isProfileStep: false,
    },
  ];

  const handleNext = async () => {
    if (steps[currentStep].isProfileStep) {
      // Handle profile submission
      await handleProfileSubmit();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProfileSubmit = async () => {
    if (!username.trim() || !displayName.trim()) {
      setProfileError('Please fill in both username and display name.');
      return;
    }

    setIsSubmittingProfile(true);
    setProfileError('');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfileError('Authentication required.');
        return;
      }

      // Validate username format
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
        setProfileError(
          'Username can only contain lowercase letters, numbers, and underscores.'
        );
        return;
      }

      if (cleanUsername.length < 3 || cleanUsername.length > 50) {
        setProfileError('Username must be between 3 and 50 characters.');
        return;
      }

      const reservedUsernames = [
        'login',
        'signup',
        'api',
        'admin',
        'dashboard',
        'profile',
        'settings',
        'legal',
        'help',
        'contact',
      ];
      if (reservedUsernames.includes(cleanUsername)) {
        setProfileError('This username is reserved and cannot be used.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: cleanUsername,
          display_name: displayName.trim(),
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') {
          setProfileError('This username is already taken.');
        } else {
          setProfileError(`Database error: ${error.message}`);
        }
        return;
      }

      // Profile created successfully, move to next step
      setCurrentStep(currentStep + 1);
      // Force refresh the page to load the new profile data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Profile creation error:', error);
      setProfileError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleGetStarted = async () => {
    // Mark welcome as seen
    await markWelcomeAsSeen(userId);
    await refreshOnboardingState();

    onClose();
    onStartBioCreation();
  };

  const handleSkip = async () => {
    await markWelcomeAsSeen(userId);
    await refreshOnboardingState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border-foreground/10 relative mx-4 max-h-[90vh] w-full max-w-6xl overflow-auto rounded-xl border shadow-xl"
      >
        <div className="grid min-h-[600px] lg:grid-cols-2">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-between p-8">
            <div>
              {/* Progress Dots */}
              <div className="mb-8 flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-foreground/20'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="mb-4 text-3xl font-bold">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-foreground/80 mb-8 text-lg">
                    {steps[currentStep].content}
                  </p>

                  {steps[currentStep].isProfileStep && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="username"
                            className="mb-2 block text-sm font-medium"
                          >
                            Username
                          </label>
                          <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your-username"
                            className="border-foreground/20 bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                          />
                          <p className="text-foreground/60 mt-1 text-xs">
                            This will be your URL: {username || 'yourname'}
                            .humans.inc
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="displayName"
                            className="mb-2 block text-sm font-medium"
                          >
                            Display Name
                          </label>
                          <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your Name"
                            className="border-foreground/20 bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                          />
                          <p className="text-foreground/60 mt-1 text-xs">
                            This is how your name will appear to visitors
                          </p>
                        </div>
                      </div>

                      {profileError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {profileError}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Skip tour
              </button>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="border-foreground/20 hover:bg-foreground/5 rounded-lg border px-4 py-2 transition-colors"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isSubmittingProfile}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingProfile
                    ? 'Creating...'
                    : steps[currentStep].isProfileStep
                      ? 'Create Profile'
                      : currentStep === steps.length - 1
                        ? "Let's Create!"
                        : 'Next'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-foreground/5 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="bg-background border-foreground/10 overflow-hidden rounded-xl border shadow-lg">
                {/* Browser Header */}
                <div className="bg-foreground/5 border-foreground/10 border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <div className="text-foreground/60 ml-4 font-mono text-sm">
                      {username || 'yourname'}.humans.inc
                    </div>
                  </div>
                </div>

                {/* Page Preview */}
                <div className="max-h-[400px] space-y-6 overflow-y-auto p-6">
                  <AnimatePresence>
                    {steps[currentStep].showDemo && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <DemoBioBlock />
                        <DemoTextBlock />
                        <DemoLinksBlock />
                      </motion.div>
                    )}
                    {!steps[currentStep].showDemo && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 text-center"
                      >
                        <div className="mb-4 text-6xl">🚀</div>
                        <h3 className="mb-2 text-xl font-semibold">
                          Your Story Awaits
                        </h3>
                        <p className="text-foreground/60">
                          Ready to create something beautiful?
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-foreground/10 hover:bg-foreground/20 absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        >
          <span className="text-lg">×</span>
        </button>
      </motion.div>
    </div>
  );
}
