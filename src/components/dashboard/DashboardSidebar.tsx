'use client';

import { useState } from 'react';

export type DashboardSection = 'preview' | 'inbox' | 'drafts' | 'create';

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: string;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'preview',
    label: 'Page Preview',
    icon: '👁️',
    description: 'Preview your public page',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: '💬',
    description: 'Messages from visitors',
  },
  {
    id: 'drafts',
    label: 'Drafts',
    icon: '📝',
    description: 'Unpublished content',
  },
  {
    id: 'create',
    label: 'Create',
    icon: '✨',
    description: 'Add new content blocks',
  },
];

export function DashboardSidebar({
  activeSection,
  onSectionChange,
}: DashboardSidebarProps) {
  return (
    <div className="bg-background border-foreground/10 flex h-full w-72 flex-col border-r">
      {/* Sidebar Header */}
      <div className="border-foreground/10 border-b p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
          <h2 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
            Dashboard
          </h2>
          <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
        </div>
        <p className="text-foreground/60 mt-1 text-sm">
          Manage your content and profile
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className="text-lg" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{item.label}</div>
                <div
                  className={`text-xs ${
                    activeSection === item.id
                      ? 'text-primary/70'
                      : 'text-foreground/50'
                  }`}
                >
                  {item.description}
                </div>
              </div>
              <div
                className={`h-2 w-2 rounded-full transition-opacity ${
                  activeSection === item.id
                    ? 'bg-primary opacity-100'
                    : 'bg-foreground/20 opacity-0 group-hover:opacity-100'
                }`}
              ></div>
            </button>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-foreground/10 border-t p-4">
        <div className="text-foreground/50 text-center text-xs">
          <div className="mb-1">humans.inc</div>
          <div>Dashboard v2.0</div>
        </div>
      </div>
    </div>
  );
}
