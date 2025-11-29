"use client";

import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="min-h-screen p-4 pt-20 lg:ml-64 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
