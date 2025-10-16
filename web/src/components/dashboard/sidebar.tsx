"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardLinks } from "@/lib/dashboard-links";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border/40 bg-background/80 p-6 backdrop-blur md:flex">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {dashboardLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="font-medium">{link.label}</div>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
