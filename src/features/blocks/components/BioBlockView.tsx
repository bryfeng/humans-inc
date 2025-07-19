import Image from 'next/image';
import Link from 'next/link';
import type { BioBlockContent } from '../types';

interface BioBlockViewProps {
  content: BioBlockContent;
  title?: string;
}

export function BioBlockView({ content, title }: BioBlockViewProps) {
  const { display_name, tagline, bio, avatar_url, links = [] } = content;

  return (
    <div className="space-y-6">
      {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}

      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-4 text-center sm:flex-row sm:space-y-0 sm:space-x-6 sm:text-left">
        {/* Avatar */}
        <div className="shrink-0">
          {avatar_url ? (
            <Image
              src={avatar_url}
              alt={display_name || 'Profile picture'}
              width={120}
              height={120}
              className="border-foreground/10 h-24 w-24 rounded-full border-2 object-cover sm:h-32 sm:w-32"
              priority
            />
          ) : (
            <div className="bg-foreground/10 border-foreground/10 flex h-24 w-24 items-center justify-center rounded-full border-2 sm:h-32 sm:w-32">
              <span className="text-foreground/50 text-2xl">
                {display_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        {/* Name and Tagline */}
        <div className="flex-1 space-y-2">
          {display_name && (
            <h1 className="text-foreground text-3xl font-bold">
              {display_name}
            </h1>
          )}
          {tagline && (
            <p className="text-foreground/80 text-lg font-medium">{tagline}</p>
          )}
        </div>
      </div>

      {/* Bio Text */}
      {bio && (
        <div className="prose prose-foreground max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {bio}
          </p>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-foreground text-lg font-semibold">Links</h3>
          <div className="flex flex-wrap gap-3">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-foreground/20 bg-background hover:bg-foreground/5 text-foreground hover:border-foreground/40 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                {link.label}
                <svg
                  className="ml-2 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
