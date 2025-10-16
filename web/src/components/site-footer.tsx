export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/40">
      <div className="container flex flex-col gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} MailShield. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@mailshield.dev"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </a>
          <a
            href="/docs/quickstart"
            className="transition-colors hover:text-foreground"
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
