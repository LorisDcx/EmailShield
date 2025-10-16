import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">
          MailShield
        </span>
        <span className="text-lg font-semibold">Dashboard</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/docs/quickstart">Docs</Link>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
