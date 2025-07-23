'use client';

import type { UserProfile } from '@/types/user';

interface CreateSectionProps {
  userId: string;
  profile: UserProfile | null;
  currentBlockCount: number;
}

export function CreateSection({
  userId,
  profile,
  currentBlockCount,
}: CreateSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Create Content</h1>
        <p className="text-foreground/60">
          Add new blocks to your profile with our enhanced content builder
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">
            {currentBlockCount}
          </div>
          <div className="text-foreground/60 text-sm">Total Blocks</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">4</div>
          <div className="text-foreground/60 text-sm">Block Types</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-foreground/40 text-2xl font-bold">∞</div>
          <div className="text-foreground/60 text-sm">Possibilities</div>
        </div>
      </div>

      {/* Block Type Overview */}
      <div className="bg-foreground/5 rounded-lg p-6">
        <h3 className="mb-4 text-lg font-semibold">Available Block Types</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BlockTypeCard
            icon="👋"
            title="Bio Block"
            description="Introduce yourself with display name, tagline, and avatar"
            features={[
              'Profile picture',
              'Display name',
              'Tagline',
              'Social links',
            ]}
          />

          <BlockTypeCard
            icon="📝"
            title="Text Block"
            description="Share thoughts, articles, or any written content"
            features={[
              'Rich text editing',
              'Markdown support',
              'Custom formatting',
              'Long-form content',
            ]}
          />

          <BlockTypeCard
            icon="🔗"
            title="Links Block"
            description="Curate a collection of important links"
            features={[
              'Link collection',
              'Custom descriptions',
              'Organized layout',
              'Quick sharing',
            ]}
          />

          <BlockTypeCard
            icon="📚"
            title="Content List"
            description="Showcase curated content like books, articles, or media"
            features={[
              'Curated items',
              'Annotations',
              'Type categorization',
              'Personal recommendations',
            ]}
          />
        </div>
      </div>

      {/* Enhanced Block Creator */}
      <div className="bg-background border-foreground/10 rounded-lg border p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-primary text-sm font-semibold">+</span>
          </div>
          <h2 className="text-xl font-semibold">Create New Block</h2>
          <div className="ml-auto opacity-70">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
          </div>
        </div>

        {profile && profile.username ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">🚀</div>
            <h4 className="mb-2 font-semibold">Block Creator Integration</h4>
            <p className="text-foreground/60 mb-4 text-sm">
              The enhanced block creator will be integrated here. For now,
              please use the original dashboard interface for creating blocks.
            </p>
            <div className="bg-primary/10 text-primary rounded-md p-3 text-sm">
              Navigate back to the original dashboard to create new blocks
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">🚀</div>
            <h4 className="mb-2 font-semibold">Complete Your Profile First</h4>
            <p className="text-foreground/60 mb-4 text-sm">
              Set up your username and basic profile information before creating
              content blocks.
            </p>
            <div className="bg-foreground/5 text-foreground/60 rounded-md p-3 text-sm">
              Complete your profile setup above to unlock content creation
            </div>
          </div>
        )}
      </div>

      {/* Tips & Best Practices */}
      <div className="bg-background border-foreground/10 rounded-lg border p-6">
        <h3 className="mb-4 font-semibold">Content Creation Tips</h3>
        <div className="space-y-3">
          <TipItem
            icon="✨"
            text="Start with a Bio block to introduce yourself to visitors"
          />
          <TipItem
            icon="📖"
            text="Use Text blocks for sharing your thoughts and expertise"
          />
          <TipItem
            icon="🎯"
            text="Organize content logically - most important information first"
          />
          <TipItem
            icon="🔄"
            text="You can always reorder blocks by dragging them in the main dashboard"
          />
          <TipItem
            icon="👀"
            text="Preview your public profile regularly to see how visitors will see your content"
          />
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
        <h3 className="mb-4 font-semibold text-purple-900 dark:text-purple-200">
          Enhanced Creation Features Coming Soon
        </h3>
        <div className="space-y-3">
          <FeatureItem icon="🎨" text="Visual block templates and themes" />
          <FeatureItem icon="📁" text="Save-as-draft functionality" />
          <FeatureItem
            icon="🖼️"
            text="Rich media blocks (images, videos, embeds)"
          />
          <FeatureItem icon="📊" text="Analytics and performance insights" />
          <FeatureItem
            icon="🎪"
            text="Advanced layout options and customization"
          />
        </div>
      </div>
    </div>
  );
}

function BlockTypeCard({
  icon,
  title,
  description,
  features,
}: {
  icon: string;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="bg-background border-foreground/10 rounded-lg border p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="text-2xl" role="img">
          {icon}
        </span>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-foreground/60 text-sm">{description}</p>
        </div>
      </div>
      <ul className="space-y-1">
        {features.map((feature, index) => (
          <li
            key={index}
            className="text-foreground/50 flex items-center gap-2 text-xs"
          >
            <div className="bg-primary h-1 w-1 rounded-full"></div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg" role="img">
        {icon}
      </span>
      <span className="text-foreground/70 text-sm">{text}</span>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg" role="img">
        {icon}
      </span>
      <span className="text-sm text-purple-700 dark:text-purple-300">
        {text}
      </span>
    </div>
  );
}
