"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { FavoritesProvider } from "@/components/favorites-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FavoritesProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </FavoritesProvider>
    </SessionProvider>
  );
}
