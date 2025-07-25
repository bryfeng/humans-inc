'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect, useState } from 'react';
import type { TextBlockContent } from '../types';

interface RichTextEditorProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
  placeholder?: string;
  autofocus?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  autofocus = false,
  className = '',
  onFocus,
  onBlur,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [outline, setOutline] = useState<TextBlockContent['outline']>([]);

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = useCallback((wordCount: number): number => {
    return Math.ceil(wordCount / 200);
  }, []);

  // Generate outline from heading nodes
  const generateOutline = useCallback(
    (editor: ReturnType<typeof useEditor>) => {
      const headings: TextBlockContent['outline'] = [];
      if (!editor) return headings;

      const doc = editor.state.doc;

      doc.descendants((node, pos) => {
        if (
          node.type.name === 'heading' &&
          node.attrs &&
          typeof node.attrs.level === 'number'
        ) {
          const id = `heading-${pos}`;
          headings.push({
            id,
            level: node.attrs.level,
            text: node.textContent,
            anchor: `#${id}`,
          });
        }
      });

      return headings;
    },
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        blockquote: {
          HTMLAttributes: {
            class:
              'border-l-4 border-primary/30 pl-4 italic text-foreground/80',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted rounded-lg p-4 font-mono text-sm',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 space-y-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'leading-relaxed',
          },
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'cursor-text before:content-[attr(data-placeholder)] before:absolute before:left-0 before:text-foreground/40 before:pointer-events-none',
      }),
      CharacterCount,
      Focus.configure({
        className:
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
        mode: 'all',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors',
        },
      }),
    ],
    content: content.richContent || content.text || '',
    immediatelyRender: false, // Fix SSR hydration issue
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${
          isFocused
            ? 'prose-headings:text-foreground prose-p:text-foreground'
            : 'prose-headings:text-foreground/90 prose-p:text-foreground/80'
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const wordCount = editor.storage.characterCount.words();
      const readingTime = calculateReadingTime(wordCount);
      const newOutline = generateOutline(editor);

      setOutline(newOutline);

      onChange({
        ...content,
        text,
        richContent: html,
        formatting: 'rich' as const,
        wordCount,
        readingTime,
        outline: newOutline,
      });
    },
    onFocus: () => {
      setIsFocused(true);
      onFocus?.();
    },
    onBlur: () => {
      setIsFocused(false);
      onBlur?.();
    },
  });

  useEffect(() => {
    if (editor && autofocus) {
      editor.commands.focus();
    }
  }, [editor, autofocus]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + B for bold
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        editor.chain().focus().toggleBold().run();
      }
      // Cmd/Ctrl + I for italic
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault();
        editor.chain().focus().toggleItalic().run();
      }
      // Cmd/Ctrl + K for link
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!editor) {
    return (
      <div className={`bg-muted h-32 animate-pulse rounded-lg ${className}`} />
    );
  }

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();
  const readingTime = calculateReadingTime(wordCount);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div
        className={`bg-background border-border flex items-center gap-2 rounded-lg border p-2 transition-all duration-200 ${
          isFocused ? 'border-primary/30 shadow-sm' : 'border-border'
        }`}
      >
        <ToolbarButton
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (⌘B)"
        >
          <BoldIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (⌘I)"
        >
          <ItalicIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <CodeIcon />
        </ToolbarButton>

        <div className="bg-border h-6 w-px" />

        <ToolbarButton
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <div className="bg-border h-6 w-px" />

        <ToolbarButton
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <ListIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <NumberedListIcon />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <QuoteIcon />
        </ToolbarButton>

        <div className="bg-border h-6 w-px" />

        <ToolbarButton
          isActive={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          title="Link (⌘K)"
        >
          <LinkIcon />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        className={`bg-background border-border min-h-[200px] rounded-lg border p-6 transition-all duration-200 ${
          isFocused ? 'border-primary/30 shadow-sm' : 'border-border'
        }`}
      >
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none focus:outline-none"
        />
      </div>

      {/* Stats and Outline */}
      <div className="text-foreground/60 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          {readingTime > 0 && <span>{readingTime} min read</span>}
        </div>

        {outline && outline.length > 0 && (
          <div className="text-xs">
            {outline.length} heading{outline.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({
  isActive,
  onClick,
  children,
  title,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-md p-2 text-xs font-semibold transition-all duration-150 ${
        isActive
          ? 'bg-primary text-background shadow-sm'
          : 'text-foreground/70 hover:text-foreground hover:bg-muted/50 bg-transparent'
      }`}
    >
      {children}
    </button>
  );
}

// Simple SVG Icons
function BoldIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6 4V2H4v2H2v2h2v10H2v2h2v2h2v-2h8.5c1.38 0 2.5-1.12 2.5-2.5v-3c0-.55-.18-1.05-.46-1.46C16.82 10.55 17 10.05 17 9.5V7.5C17 6.12 15.88 5 14.5 5H6V4zm2 3h6.5c.28 0 .5.22.5.5v2c0 .28-.22.5-.5.5H8V7zm0 6h8.5c.28 0 .5.22.5.5v3c0 .28-.22.5-.5.5H8v-4z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8 2h8v2h-2.4l-3.2 12H8v2h8v-2h-2.4l3.2-12H19V2h-8v2h2.4L10.2 16H12v2H4v-2h2.4L9.6 4H8V2z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.5 8L4 10.5L6.5 13L5 14.5L1 10.5L5 6.5L6.5 8ZM13.5 8L16 10.5L13.5 13L15 14.5L19 10.5L15 6.5L13.5 8Z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 6a2 2 0 100-4 2 2 0 000 4zM6 8H2v2h4V8zM6 12H2v2h4v-2zM6 16H2v2h4v-2zM18 6H8v2h10V6zM18 10H8v2h10v-2zM18 14H8v2h10v-2z" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 3v2h1v1H3v2h2V6h1V4H5V3H3zM3 8v1h1v1H3v2h3V9H5V8h1V7H3v1zM18 6H8v2h10V6zM18 10H8v2h10v-2zM18 14H8v2h10v-2z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 6v8h4V6H3zm6 0v8h4V6H9zm-4 2h1v2H5V8zm6 0h1v2h-1V8z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a3 3 0 000 6h3a3 3 0 000-6h-3zM9 9a3 3 0 000 6h3a3 3 0 000-6H9z" />
      <path d="M9 12a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  );
}
