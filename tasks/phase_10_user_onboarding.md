# Phase 10: User Onboarding Flow

> **Note**: Follow [code_guidelines.md](./code_guidelines.md) for all implementation work.

This phase focuses on creating a comprehensive onboarding experience to address user feedback about unclear concepts and difficulty understanding bio blocks. The goal is to guide new users from signup to their first successful content creation, providing context and education about the platform's core concepts.

## Problem Statement

User testing revealed that new users face several key challenges:

- No guidance on what "blocks" are conceptually
- Confusion about bio blocks and their purpose
- Uncertainty about first actions to take
- Lack of understanding of overall platform value

## Design Philosophy

- **Progressive Disclosure**: Introduce concepts one at a time, building understanding step by step
- **Learning by Doing**: Guide users through actual creation rather than just explanation
- **Immediate Success**: Get users to their first published content quickly for motivation
- **Contextual Help**: Provide guidance when and where it's needed most
- **Optional but Accessible**: Allow skipping while maintaining easy access to help

## Tickets

### 10.1 Database Schema for Onboarding State

- **Description**: Extend the profiles table to track user onboarding progress and preferences, enabling personalized guidance and avoiding repetitive tutorials.

- **Schema Changes**:

  ```sql
  -- Add onboarding tracking fields to profiles table
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_state JSONB DEFAULT '{}';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

  -- Create index for efficient onboarding queries
  CREATE INDEX IF NOT EXISTS profiles_onboarding_state_idx ON public.profiles USING GIN (onboarding_state);
  ```

- **Onboarding State Structure**:

  ```typescript
  interface OnboardingState {
    has_seen_welcome: boolean;
    has_created_bio: boolean;
    has_seen_dashboard_tour: boolean;
    has_published_first_block: boolean;
    tour_dismissed: boolean;
    last_step_completed: string;
    completion_percentage: number;
  }
  ```

- **Tasks**:

  - [ DONE ] Add onboarding_state JSONB field to profiles table
  - [ DONE ] Add onboarding_completed_at timestamp field to profiles table
  - [ ] Create GIN index on onboarding_state for efficient queries
  - [ ] Update RLS policies to allow users to update their own onboarding state
  - [ ] Create TypeScript interfaces for onboarding state management

- **Status**: Not Started

- **Acceptance Criteria**:
  - The profiles table includes onboarding tracking fields
  - Users can update their own onboarding progress
  - Efficient querying is supported through proper indexing
  - TypeScript types provide proper type safety for onboarding state

### 10.2 Welcome Modal & Concept Introduction

- **Description**: Create an engaging welcome modal that introduces new users to the core concept of "blocks" and shows them the value proposition of the platform through interactive examples.

- **Component Structure**:

  ```
  src/features/onboarding/
  ├── components/
  │   ├── WelcomeModal.tsx
  │   ├── BlockConceptDemo.tsx
  │   └── index.ts
  ├── actions/
  │   └── onboarding-actions.ts
  └── types/
      └── index.ts
  ```

- **Key Features**:

  - Interactive block type demonstration
  - Visual examples of how blocks combine to create pages
  - Clear value proposition explanation
  - Smooth transition to bio creation wizard
  - Dismissible but re-accessible from dashboard

- **Tasks**:

  - [ ] Create onboarding feature directory structure
  - [ ] Build WelcomeModal component with engaging design
  - [ ] Create BlockConceptDemo interactive showcase
  - [ ] Implement visual examples of block combinations
  - [ ] Add server actions for tracking welcome modal interaction
  - [ ] Integrate modal trigger logic into dashboard page
  - [ ] Add "Show Welcome Again" option in dashboard settings

- **Status**: Not Started

- **Acceptance Criteria**:
  - Modal appears automatically for new users on first dashboard visit
  - Interactive demo clearly explains what blocks are and how they work
  - Users understand the value proposition before proceeding
  - Modal can be dismissed and re-accessed later
  - Completion is tracked in onboarding state

### 10.3 Bio Block Creation Wizard

- **Description**: Replace the immediate full editor experience with a guided, step-by-step wizard that walks users through creating their first bio block with helpful prompts, examples, and immediate feedback.

- **Wizard Flow**:

  1. **Introduction**: "Let's create your bio block - your digital introduction"
  2. **Display Name**: Input with helpful examples and character guidance
  3. **Tagline**: Input with suggested formats and inspiration
  4. **Bio Text**: Textarea with prompts and example content
  5. **Avatar Upload**: Optional image upload with preview
  6. **Links**: Add 1-3 important social/professional links
  7. **Preview**: Show live preview of completed bio block
  8. **Publish**: One-click publish with celebration

- **Component Structure**:

  ```
  src/features/onboarding/components/
  ├── BioWizard/
  │   ├── BioWizard.tsx (main wizard container)
  │   ├── steps/
  │   │   ├── WelcomeStep.tsx
  │   │   ├── DisplayNameStep.tsx
  │   │   ├── TaglineStep.tsx
  │   │   ├── BioTextStep.tsx
  │   │   ├── AvatarStep.tsx
  │   │   ├── LinksStep.tsx
  │   │   ├── PreviewStep.tsx
  │   │   └── PublishStep.tsx
  │   ├── WizardNavigation.tsx
  │   ├── ProgressIndicator.tsx
  │   └── index.ts
  ```

- **Tasks**:

  - [ ] Create BioWizard main component with step management
  - [ ] Build individual step components with validation
  - [ ] Implement progress indicator and navigation
  - [ ] Add helpful prompts, examples, and guidance text
  - [ ] Create live preview functionality
  - [ ] Add form validation and error handling
  - [ ] Implement one-click publish from wizard
  - [ ] Add celebration/success state after publish
  - [ ] Integrate wizard trigger from welcome modal

- **Status**: Not Started

- **Acceptance Criteria**:
  - New users are guided through bio creation step-by-step
  - Each step provides helpful examples and clear instructions
  - Users can navigate back and forth between steps
  - Live preview shows their bio block as they build it
  - Successful completion results in a published bio block
  - Progress is tracked and wizard can be resumed if interrupted

### 10.4 Interactive Dashboard Tour

- **Description**: Create a contextual tour system that highlights key dashboard sections and explains their purpose, with smart highlighting and dismissible tooltips that appear based on user progress.

- **Tour System Features**:

  - Context-aware tooltips that appear at relevant times
  - Highlighting of important UI elements
  - Progressive revelation based on user's block creation progress
  - Non-intrusive design that doesn't block functionality
  - Skip option with ability to restart tour later

- **Tour Steps**:

  1. **Dashboard Overview**: "Welcome to your dashboard - your content control center"
  2. **Preview Section**: "See how your page looks to visitors"
  3. **Write Section**: "Create and manage your content blocks"
  4. **Manage Section**: "Organize and publish your blocks"
  5. **Profile Header**: "Track your progress and page stats"

- **Component Structure**:

  ```
  src/features/onboarding/components/
  ├── DashboardTour/
  │   ├── DashboardTour.tsx
  │   ├── TourStep.tsx
  │   ├── TourTooltip.tsx
  │   ├── TourHighlight.tsx
  │   ├── TourProgress.tsx
  │   └── index.ts
  ```

- **Tasks**:

  - [ ] Research and choose tour library (react-joyride vs custom implementation)
  - [ ] Create DashboardTour component with step management
  - [ ] Build TourTooltip component with consistent styling
  - [ ] Implement element highlighting system
  - [ ] Create tour step definitions and content
  - [ ] Add context-aware triggering logic
  - [ ] Implement skip/resume functionality
  - [ ] Add tour restart option in dashboard settings
  - [ ] Integrate tour trigger after bio wizard completion

- **Status**: Not Started

- **Acceptance Criteria**:
  - Tour automatically starts after successful bio creation
  - Each tooltip clearly explains the purpose of dashboard sections
  - Users can skip tour at any time but restart it later
  - Tour progress is tracked and saved
  - Highlighting clearly draws attention to relevant UI elements
  - Tour doesn't interfere with normal dashboard functionality

### 10.5 Onboarding Progress Tracker

- **Description**: Create a subtle but motivating progress tracking system that shows users their onboarding completion status and suggests next actions based on their current progress.

- **Progress Tracking Features**:

  - Visual progress indicator (progress bar or checklist)
  - Smart next action suggestions
  - Achievement celebration for milestones
  - Easy access to remaining onboarding steps
  - Non-intrusive placement in dashboard

- **Progress Milestones**:

  - ✅ Profile setup complete
  - ✅ First bio block created
  - ✅ Bio block published
  - ✅ Dashboard tour completed
  - ✅ Second block created (text/links/content)
  - ✅ Profile page visited
  - ✅ Onboarding fully complete

- **Component Structure**:

  ```
  src/features/onboarding/components/
  ├── OnboardingProgress/
  │   ├── OnboardingProgress.tsx
  │   ├── ProgressBar.tsx
  │   ├── MilestoneChecklist.tsx
  │   ├── NextActionSuggestion.tsx
  │   ├── AchievementCelebration.tsx
  │   └── index.ts
  ```

- **Tasks**:

  - [ ] Create OnboardingProgress component with collapsible design
  - [ ] Build ProgressBar component with smooth animations
  - [ ] Implement MilestoneChecklist with completion states
  - [ ] Create NextActionSuggestion with contextual recommendations
  - [ ] Add AchievementCelebration for milestone completion
  - [ ] Implement progress calculation logic
  - [ ] Add integration points throughout dashboard
  - [ ] Create settings to hide/show progress tracker

- **Status**: Not Started

- **Acceptance Criteria**:
  - Progress tracker appears prominently but non-intrusively
  - Progress percentage accurately reflects completion state
  - Next action suggestions are contextually relevant
  - Milestone celebrations provide positive reinforcement
  - Users can dismiss or minimize the progress tracker
  - Progress is persistent across sessions

### 10.6 Smart Recommendations Engine

- **Description**: Create an intelligent system that suggests next actions based on user's current blocks and progress, helping users discover new content types and platform features organically.

- **Recommendation Logic**:

  - New users: Focus on bio completion and first additional block
  - Bio-only users: Suggest text block for sharing thoughts
  - Text writers: Suggest links block for resource sharing
  - Active creators: Suggest content list for curation
  - Advanced users: Suggest collections for organization

- **Component Structure**:

  ```
  src/features/onboarding/components/
  ├── SmartRecommendations/
  │   ├── SmartRecommendations.tsx
  │   ├── RecommendationCard.tsx
  │   ├── BlockTypeSuggestion.tsx
  │   └── index.ts
  ```

- **Tasks**:

  - [ ] Create recommendation algorithm based on user state
  - [ ] Build SmartRecommendations component
  - [ ] Create RecommendationCard with clear CTAs
  - [ ] Implement recommendation dismissal and feedback
  - [ ] Add integration to dashboard sections
  - [ ] Create A/B testing framework for recommendations
  - [ ] Track recommendation effectiveness

- **Status**: Not Started

- **Acceptance Criteria**:
  - Recommendations are contextually relevant to user's current state
  - Suggestions help users discover new block types naturally
  - Recommendations can be dismissed without penalty
  - System learns from user actions and preferences
  - Recommendations drive measurable engagement improvement

### 10.7 Dashboard Integration & State Management

- **Description**: Integrate all onboarding components into the existing dashboard system with proper state management, ensuring smooth user experience and minimal disruption to existing functionality.

- **Integration Points**:

  - Dashboard page component for onboarding triggers
  - Profile header for progress display
  - Sidebar for onboarding access
  - Block creation flows for progress tracking
  - Settings page for onboarding preferences

- **State Management**:

  - Onboarding context provider
  - Server actions for progress tracking
  - Local storage for temporary state
  - Database synchronization for persistence

- **Tasks**:

  - [ ] Create OnboardingProvider context component
  - [ ] Update dashboard page with onboarding logic
  - [ ] Integrate progress tracker into profile header
  - [ ] Add onboarding controls to settings page
  - [ ] Update block creation flows with progress tracking
  - [ ] Implement server actions for onboarding state management
  - [ ] Add error handling and fallback states
  - [ ] Create onboarding preferences management

- **Status**: Not Started

- **Acceptance Criteria**:
  - All onboarding components work seamlessly with existing dashboard
  - Onboarding state is properly managed across components
  - Users can control onboarding preferences
  - Error states are handled gracefully
  - Performance impact is minimal
  - Existing dashboard functionality is not disrupted

### 10.8 Analytics & Optimization Framework

- **Description**: Implement analytics tracking for onboarding flow to measure effectiveness and identify optimization opportunities.

- **Tracking Events**:

  - Welcome modal views and interactions
  - Bio wizard step completion rates
  - Dashboard tour progression
  - Recommendation engagement
  - Onboarding completion rates
  - Time to first published block

- **Tasks**:

  - [ ] Define onboarding analytics events
  - [ ] Implement event tracking throughout onboarding flow
  - [ ] Create onboarding analytics dashboard
  - [ ] Set up A/B testing framework for onboarding variants
  - [ ] Create onboarding effectiveness reports

- **Status**: Not Started

- **Acceptance Criteria**:
  - All key onboarding interactions are tracked
  - Analytics provide actionable insights for optimization
  - A/B testing framework enables rapid iteration
  - Performance metrics show clear improvement in user engagement

## Phase 10 Summary

**Status**: 🚧 **NOT STARTED**

This comprehensive onboarding system will address the core user feedback about platform confusion and bio block unfamiliarity. The progressive approach will guide users from initial confusion to successful content creation while building understanding of the platform's value proposition.

**Key Benefits**:

- ✅ Clear introduction to block concepts
- ✅ Guided first bio creation experience
- ✅ Contextual dashboard education
- ✅ Progress tracking and motivation
- ✅ Smart recommendations for engagement
- ✅ Measurable improvement in user success rates

**Dependencies**:

- Existing dashboard and block creation infrastructure
- Profile management system
- Block editor components

**Success Metrics**:

- Increase in users completing first bio block
- Reduction in dashboard abandonment rate
- Increase in users creating multiple block types
- Improvement in user activation and retention rates
