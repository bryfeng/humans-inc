'use client';

export function InboxSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Inbox</h1>
        <p className="text-foreground/60">
          Messages and communications from visitors
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="mb-4 text-4xl">💬</div>
        <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-200">
          Messaging Coming Soon
        </h3>
        <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
          We're building a beautiful messaging system that will let visitors
          connect with you directly.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
          <span>In Development</span>
        </div>
      </div>

      {/* Mock Inbox Interface */}
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search messages..."
              disabled
              className="border-foreground/10 bg-foreground/5 text-foreground/40 w-full cursor-not-allowed rounded-lg border py-2 pr-4 pl-10"
            />
            <div className="text-foreground/30 absolute top-1/2 left-3 -translate-y-1/2 transform">
              🔍
            </div>
          </div>
          <button
            disabled
            className="border-foreground/10 bg-foreground/5 text-foreground/40 cursor-not-allowed rounded-lg border px-4 py-2"
          >
            Filter
          </button>
        </div>

        {/* Message Threads List */}
        <div className="space-y-3">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className="bg-background border-foreground/10 cursor-not-allowed rounded-lg border p-4 opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className="bg-foreground/10 text-foreground/40 flex h-10 w-10 items-center justify-center rounded-full">
                  {message.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="text-foreground/60 font-medium">
                      {message.sender}
                    </h4>
                    <span className="text-foreground/40 text-xs">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-foreground/50 line-clamp-2 text-sm">
                    {message.preview}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {message.unread && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                    <span className="text-foreground/40 text-xs">
                      {message.unread ? 'Unread' : 'Read'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compose Message Button */}
        <div className="pt-4">
          <button
            disabled
            className="bg-primary/10 text-primary/40 border-primary/20 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border p-4"
          >
            <span className="text-lg">✉️</span>
            <span>Compose New Message (Coming Soon)</span>
          </button>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="bg-foreground/5 rounded-lg p-6">
        <h3 className="mb-4 font-semibold">What's Coming</h3>
        <div className="space-y-3">
          <FeatureItem icon="💬" text="Direct messages from profile visitors" />
          <FeatureItem icon="🔔" text="Real-time notifications" />
          <FeatureItem icon="📁" text="Message organization and folders" />
          <FeatureItem icon="🔍" text="Advanced search and filtering" />
          <FeatureItem icon="📱" text="Mobile-optimized messaging experience" />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg" role="img">
        {icon}
      </span>
      <span className="text-foreground/70 text-sm">{text}</span>
    </div>
  );
}

// Mock data for the interface preview
const mockMessages = [
  {
    id: 1,
    sender: 'Sarah Chen',
    avatar: '👩',
    preview:
      'Hi! I loved your article about sustainable design. Would love to connect and discuss...',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    sender: 'Alex Rivera',
    avatar: '👨',
    preview:
      'Thanks for sharing those resources! The design patterns you mentioned really helped...',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 3,
    sender: 'Jordan Kim',
    avatar: '🧑',
    preview:
      'Your content list on productivity tools is amazing. Do you have any recommendations for...',
    time: '3 days ago',
    unread: false,
  },
  {
    id: 4,
    sender: 'Taylor Swift',
    avatar: '👩',
    preview:
      'I came across your profile through a mutual connection. Would love to collaborate on...',
    time: '1 week ago',
    unread: false,
  },
];
