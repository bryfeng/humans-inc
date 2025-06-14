export default function Home() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to humans.inc</h1>
        <p className="text-xl text-foreground/80 mb-8">
          Your unified online presence, beautifully crafted.
        </p>
        <div className="space-y-4">
          <p className="text-lg">
            This is your new digital home. Let's build something amazing
            together.
          </p>
        </div>
      </div>

      {/* Test content for scrolling */}
      <div className="space-y-8 max-w-3xl mx-auto">
        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-4">About Us</h2>
          <p className="text-lg leading-relaxed">
            We're building the future of digital presence, one human at a time.
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            To create beautiful, functional digital experiences that truly
            represent who you are.
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="text-lg leading-relaxed">
            Ready to build your digital presence? Let's get started on your
            journey.
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-lg leading-relaxed">
            Have questions? We're here to help you every step of the way.
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-semibold mb-4">Community</h2>
          <p className="text-lg leading-relaxed">
            Join our growing community of creators, builders, and dreamers.
          </p>
        </section>
      </div>
    </div>
  );
}
