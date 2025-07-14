import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance tracking-tight mb-8">
              Your story,
              <span className="text-primary block">beautifully told</span>
            </h1>
            <p className="text-xl sm:text-2xl text-accent/90 max-w-2xl mx-auto mb-12 text-pretty leading-relaxed">
              Create a curated digital space that reflects your voice, thoughts, and creative work. 
              For writers who want more than a social media profile.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="bg-primary text-background px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] min-w-[200px]"
              >
                Start Writing
              </Link>
              <Link
                href="/login"
                className="text-foreground/80 hover:text-foreground px-8 py-4 rounded-xl font-medium text-lg hover:bg-muted/40 transition-all duration-200 min-w-[200px]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Everything you need to share your work
            </h2>
            <p className="text-lg text-accent/80 max-w-2xl mx-auto text-pretty">
              Simple, elegant tools designed specifically for writers and creators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-background/60 border border-foreground/5 hover:border-foreground/10 transition-colors duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Curated Content</h3>
              <p className="text-accent/80 text-pretty">
                Share your writing, recommendations, and thoughts in beautiful, organized blocks.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-background/60 border border-foreground/5 hover:border-foreground/10 transition-colors duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Beautiful Design</h3>
              <p className="text-accent/80 text-pretty">
                Clean, reader-friendly layouts that make your content shine.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-background/60 border border-foreground/5 hover:border-foreground/10 transition-colors duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">One Link</h3>
              <p className="text-accent/80 text-pretty">
                Replace multiple bio links with one beautiful, comprehensive page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-balance">
            Ready to create your space?
          </h2>
          <p className="text-xl text-accent/90 mb-12 text-pretty">
            Join writers and creators who've chosen humans.inc as their digital home.
          </p>
          
          <Link
            href="/signup"
            className="bg-primary text-background px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] inline-block"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
