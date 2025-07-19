import Link from 'next/link';
import { BioBlockView } from '@/features/blocks/components/BioBlockView';
import { TextBlockView } from '@/features/blocks/components/TextBlockView';
import { LinksBlockView } from '@/features/blocks/components/LinksBlockView';
import type {
  BioBlockContent,
  TextBlockContent,
  LinksBlockContent,
} from '@/features/blocks/types';

export default function Home() {
  // Sample data for Bryan Feng's bio preview
  const sampleBioContent: BioBlockContent = {
    display_name: 'Bryan Feng',
    tagline: 'Human, Alchemist',
    bio: 'Passionate about creating meaningful digital experiences. Currently building tools that help people share their stories and connect with others.',
    avatar_url: undefined,
    links: [
      { label: 'GitHub', url: 'https://github.com/bryfeng' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/bryanfeng' },
      { label: 'Email', url: 'mailto:bryan@example.com' },
    ],
  };

  const sampleTextContent: TextBlockContent = {
    text: "Welcome to my corner of the internet! Here you'll find my latest projects, thoughts on technology, and ways to connect with me.",
    formatting: 'plain',
  };

  const sampleLinksContent: LinksBlockContent = {
    items: [
      {
        title: 'My Latest Project: Humans Inc',
        url: 'https://github.com/bryfeng/humans-inc',
        description:
          'A platform for writers and creators to build beautiful bio pages',
      },
      {
        title: 'Blog: Building in Public',
        url: 'https://blog.example.com',
        description: 'Thoughts on product development and entrepreneurship',
      },
      {
        title: 'Portfolio Website',
        url: 'https://bryanfeng.com',
        description: 'My complete portfolio and past work',
      },
    ],
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Two Column Layout */}
      <section className="relative px-6 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="animate-fade-in">
                <h1 className="mb-8 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Your story,
                  <span className="text-primary block">beautifully told</span>
                </h1>
                <p className="text-accent/90 mb-8 text-lg leading-relaxed text-pretty sm:text-xl dark:text-white">
                  Create a curated digital space that reflects your voice,
                  thoughts, and creative work. For writers who want more than a
                  social media profile.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/signup"
                    className="bg-primary text-background hover:bg-primary/90 min-w-[200px] rounded-xl px-8 py-4 text-center text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    Start Writing
                  </Link>
                  <Link
                    href="/login"
                    className="text-foreground/80 hover:text-foreground hover:bg-muted/40 min-w-[200px] rounded-xl px-8 py-4 text-center text-lg font-medium transition-all duration-200 dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Feature highlights - simplified for left column */}
              <div className="mt-12 grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <span className="text-lg">✍️</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Curated Content</h3>
                    <p className="text-accent/80 text-sm dark:text-white/80">
                      Share your writing and thoughts in organized blocks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <span className="text-lg">🎨</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Beautiful Design</h3>
                    <p className="text-accent/80 text-sm dark:text-white/80">
                      Clean, reader-friendly layouts that make your content
                      shine
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <span className="text-lg">🔗</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">One Link</h3>
                    <p className="text-accent/80 text-sm dark:text-white/80">
                      Replace multiple bio links with one comprehensive page
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Bio Preview */}
            <div className="w-full max-w-md lg:max-w-lg lg:justify-self-end">
              <div className="bg-background border-foreground/10 overflow-hidden rounded-2xl border shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                {/* Browser-like header */}
                <div className="bg-muted/50 border-foreground/10 border-b px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="bg-foreground/20 h-3 w-3 rounded-full"></div>
                    <div className="bg-foreground/15 h-3 w-3 rounded-full"></div>
                    <div className="bg-foreground/25 h-3 w-3 rounded-full"></div>
                    <div className="text-foreground/60 ml-4 font-mono text-sm dark:text-gray-400">
                      humans.inc/bryanfeng
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="max-h-[600px] space-y-8 overflow-y-auto p-6">
                  <BioBlockView content={sampleBioContent} />
                  <TextBlockView content={sampleTextContent} />
                  <LinksBlockView content={sampleLinksContent} />
                </div>
              </div>

              {/* Preview Label */}
              <div className="mt-4 text-center">
                <span className="text-accent/60 bg-muted/50 rounded-full px-3 py-1 text-sm dark:bg-gray-800 dark:text-gray-400">
                  Live Preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/5 absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="bg-secondary/5 absolute right-1/4 bottom-0 h-64 w-64 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted/30 px-6 py-24 dark:bg-black/95">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-8 text-3xl font-bold text-balance sm:text-4xl">
            Ready to create your space?
          </h2>
          <p className="text-accent/90 mb-12 text-lg text-pretty dark:text-white">
            Join writers and creators who've chosen humans.inc as their digital
            home.
          </p>

          <Link
            href="/signup"
            className="bg-primary text-background hover:bg-primary/90 inline-block rounded-xl px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
