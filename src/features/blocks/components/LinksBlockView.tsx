import Link from 'next/link';
import type { LinksBlockContent } from '../types';

interface LinksBlockViewProps {
  content: LinksBlockContent;
  title?: string;
}

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

export function LinksBlockView({ content, title }: LinksBlockViewProps) {
  const { items = [] } = content;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-foreground text-2xl font-bold dark:text-white">
          {title}
        </h2>
      )}

      <div className="grid gap-4">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 block rounded-lg border p-4 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
          >
            <div className="space-y-2">
              {/* Title and External Link Icon */}
              <div className="flex items-start justify-between">
                <h3 className="text-foreground group-hover:text-foreground/80 line-clamp-2 text-lg font-semibold dark:text-white dark:group-hover:text-gray-200">
                  {item.title}
                </h3>
                <svg
                  className="text-foreground/40 group-hover:text-foreground/60 mt-1 ml-2 h-4 w-4 shrink-0 dark:text-gray-400 dark:group-hover:text-gray-300"
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
              </div>

              {/* URL Domain */}
              <p className="text-foreground/60 group-hover:text-foreground/70 text-sm dark:text-gray-400 dark:group-hover:text-gray-300">
                {getDomainFromUrl(item.url)}
              </p>

              {/* Description */}
              {item.description && (
                <p className="text-foreground/80 line-clamp-3 text-sm leading-relaxed dark:text-gray-300">
                  {item.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
