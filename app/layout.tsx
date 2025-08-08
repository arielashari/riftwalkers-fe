'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/toaster";
import {TokenUtil} from "@/utils/token";
import {useEffect} from "react";
import {StoreProvider, usePlayerStore} from "@/store";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
      <StoreProvider>
          <html lang="en">
          <body className={inter.className}>
          <main>{children}</main>
          <Toaster />
          </body>
          </html>
      </StoreProvider>
  );
}
