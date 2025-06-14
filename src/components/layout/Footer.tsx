const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4 text-center">
        <p className="text-sm text-foreground/80">
          &copy; {new Date().getFullYear()} humans.inc. All rights reserved.
        </p>
        <p className="text-xs mt-1 text-foreground/60">Powered by humans.</p>
      </div>
    </footer>
  );
};

export default Footer;
