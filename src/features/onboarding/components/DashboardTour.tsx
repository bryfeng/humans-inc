'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface DashboardTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function DashboardTour({
  isActive,
  onComplete,
  onSkip,
}: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'sidebar',
      title: 'Dashboard Navigation',
      description:
        'Use the sidebar to navigate between different sections of your dashboard. Switch between Preview, Write, Manage, and Collections.',
      targetSelector: '[data-tour="sidebar"]',
      position: 'right',
    },
    {
      id: 'profile-header',
      title: 'Your Profile',
      description:
        'This shows your profile information and block count. Click here to edit your profile details.',
      targetSelector: '[data-tour="profile-header"]',
      position: 'bottom',
    },
    {
      id: 'create-section',
      title: 'Create Content',
      description:
        'Start creating new blocks here. Choose from different block types like text, bio, links, and content lists.',
      targetSelector: '[data-tour="create-section"]',
      position: 'top',
    },
    {
      id: 'drafts',
      title: 'Draft Blocks',
      description:
        'Your draft blocks appear here. You can edit, publish, or delete them as needed.',
      targetSelector: '[data-tour="drafts"]',
      position: 'top',
    },
    {
      id: 'preview',
      title: 'Preview Your Page',
      description:
        'See how your published blocks look to visitors. You can reorder blocks and manage their visibility.',
      targetSelector: '[data-tour="preview"]',
      position: 'bottom',
    },
  ];

  const currentStepData = tourSteps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const findTarget = () => {
      const element = document.querySelector(
        currentStepData.targetSelector
      ) as HTMLElement;
      if (element) {
        setTargetElement(element);
        setTargetRect(element.getBoundingClientRect());
      }
    };

    // Find target immediately
    findTarget();

    // Also find target after a short delay (in case elements are still rendering)
    const timer = setTimeout(findTarget, 100);

    // Listen for scroll and resize events to update position
    const updatePosition = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isActive, currentStep, currentStepData, targetElement]);

  if (!isActive || !currentStepData || !targetRect) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getPopoverPosition = () => {
    const padding = 20;
    const popoverWidth = 320;
    const popoverHeight = 180;

    switch (currentStepData.position) {
      case 'top':
        return {
          top: targetRect.top - popoverHeight - padding,
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2,
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2,
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2 - popoverHeight / 2,
          left: targetRect.left - popoverWidth - padding,
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2 - popoverHeight / 2,
          left: targetRect.right + padding,
        };
      default:
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2,
        };
    }
  };

  const popoverPosition = getPopoverPosition();

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
      />

      {/* Spotlight effect around target */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="border-primary absolute rounded-lg border-4 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      {/* Tour popover */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, delay: 0.1 }}
        className="bg-background pointer-events-auto absolute w-80 rounded-lg border p-6 shadow-2xl"
        style={{
          top: Math.max(
            10,
            Math.min(window.innerHeight - 200, popoverPosition.top)
          ),
          left: Math.max(
            10,
            Math.min(window.innerWidth - 330, popoverPosition.left)
          ),
        }}
      >
        {/* Step indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-primary text-sm font-medium">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <button
            onClick={onSkip}
            className="text-foreground/60 hover:text-foreground text-sm transition-colors"
          >
            Skip tour
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">
            {currentStepData.title}
          </h3>
          <p className="text-foreground/80 text-sm leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-foreground/10 mb-6 h-2 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-primary h-full rounded-full"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-foreground/20 hover:bg-foreground/5 rounded border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-foreground/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium transition-colors"
          >
            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Arrow pointing to target */}
        <div
          className={`absolute h-0 w-0 ${
            currentStepData.position === 'top'
              ? 'border-t-background top-full left-1/2 -translate-x-1/2 border-t-8 border-r-8 border-l-8 border-r-transparent border-l-transparent'
              : currentStepData.position === 'bottom'
                ? 'border-b-background bottom-full left-1/2 -translate-x-1/2 border-r-8 border-b-8 border-l-8 border-r-transparent border-l-transparent'
                : currentStepData.position === 'left'
                  ? 'border-l-background top-1/2 left-full -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent'
                  : 'border-r-background top-1/2 right-full -translate-y-1/2 border-t-8 border-r-8 border-b-8 border-t-transparent border-b-transparent'
          }`}
        />
      </motion.div>

      {/* Pulsing animation around target */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="border-primary absolute rounded-lg border-2"
        style={{
          top: targetRect.top - 12,
          left: targetRect.left - 12,
          width: targetRect.width + 24,
          height: targetRect.height + 24,
        }}
      />
    </div>
  );
}
