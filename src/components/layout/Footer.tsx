const Footer = () => {
  return (
    <footer className="bg-background/95 supports-backdrop-filter:bg-background/60 border-t backdrop-blur-sm dark:bg-black/95 dark:supports-backdrop-filter:bg-black/90">
      <div className="container mx-auto px-6 py-4 text-center">
        <p className="text-foreground/80 text-sm dark:text-white">
          &copy; {new Date().getFullYear()} humans.inc. All rights reserved.
        </p>
        <p className="text-foreground/60 mt-1 text-xs dark:text-white/80">
          Powered by humans.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
