import Link from 'next/link';
import type { ContentListBlockContent } from '../types';

interface ContentListBlockViewProps {
  content: ContentListBlockContent;
  title?: string;
}

function getContentTypeIcon(type?: string) {
  switch (type) {
    case 'article':
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'book':
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    case 'video':
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    case 'podcast':
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
  }
}

function getContentTypeColor(type?: string) {
  switch (type) {
    case 'article':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
    case 'book':
      return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
    case 'video':
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
    case 'podcast':
      return 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950 dark:border-purple-800';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
  }
}

function getContentTypeLabel(type?: string) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Link';
}

export function ContentListBlockView({
  content,
  title,
}: ContentListBlockViewProps) {
  const { items = [] } = content;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}

      <div className="space-y-4">
        {items.map((item, index) => {
          const content = (
            <div className="border-foreground/10 bg-background hover:bg-foreground/5 hover:border-foreground/20 rounded-lg border p-4 transition-all duration-200">
              <div className="space-y-3">
                {/* Header with type badge and title */}
                <div className="flex items-start gap-3">
                  {/* Content Type Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getContentTypeColor(item.type)}`}
                  >
                    {getContentTypeIcon(item.type)}
                    {getContentTypeLabel(item.type)}
                  </div>

                  {/* External link icon for items with URLs */}
                  {item.url && (
                    <svg
                      className="text-foreground/40 group-hover:text-foreground/60 mt-0.5 h-4 w-4 shrink-0"
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
                  )}
                </div>

                {/* Title */}
                <h3 className="text-foreground group-hover:text-foreground/80 text-lg leading-snug font-semibold">
                  {item.title}
                </h3>

                {/* User Annotation */}
                {item.annotation && (
                  <div className="bg-foreground/5 border-foreground/20 border-l-4 py-2 pl-4">
                    <p className="text-foreground/80 text-sm leading-relaxed italic">
                      "{item.annotation}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );

          return item.url ? (
            <Link
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              {content}
            </Link>
          ) : (
            <div key={index} className="block">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
