"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  BarChart3,
  Calendar,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Teilnehmer",
    href: "/teilnehmer",
    icon: Users,
  },
  {
    title: "Zimmer",
    href: "/zimmer",
    icon: BedDouble,
  },
  {
    title: "Statistiken",
    href: "/statistiken",
    icon: BarChart3,
  },
  {
    title: "Veranstaltung",
    href: "/veranstaltung",
    icon: Calendar,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-20 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/agh-logo.jpg"
            alt="AGH Logo"
            width={160}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-xs text-muted-foreground text-center">
          Avrupa Gençlik Hizmeti
        </p>
      </div>
    </aside>
  );
}
