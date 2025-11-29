"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  BarChart3,
  Calendar,
  LogOut,
  Menu,
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

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      <nav className="space-y-1 p-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
      <div className="p-4 space-y-3 border-t lg:border-t-0">
        {session?.user && (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground truncate">
              {session.user.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Avrupa Genclik Hizmeti
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/agh-logo.jpg"
            alt="AGH Logo"
            width={120}
            height={38}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>
      </header>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-3">
              <Image
                src="/agh-logo.jpg"
                alt="AGH Logo"
                width={120}
                height={38}
                className="h-10 w-auto"
                priority
              />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-65px)]">
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card lg:block">
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
        <div className="flex flex-col h-[calc(100%-5rem)]">
          <NavContent />
        </div>
      </aside>
    </>
  );
}
