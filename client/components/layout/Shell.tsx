"use client";

import { StoreProvider } from "@/lib/store";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { CompareBar } from "./CompareBar";
import { ToastViewport } from "@/components/ToastViewport";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileNav />
      <CompareBar />
      <ToastViewport />
    </StoreProvider>
  );
}
