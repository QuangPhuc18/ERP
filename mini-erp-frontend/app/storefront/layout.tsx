"use client";

import React from "react";
import { Syne, Work_Sans } from "next/font/google";
import { CartProvider } from "./CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { usePathname } from "next/navigation";

// Load Fonts
const syne = Syne({ subsets: ["latin"], variable: "--font-sf-display" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-sf-body" });

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCheckout = pathname?.includes("/storefront/checkout");

  return (
    <CartProvider>
      <div className={`min-h-screen flex flex-col bg-sf-background text-sf-on-background font-sf-body overflow-x-hidden antialiased ${syne.variable} ${workSans.variable}`}>
        {!isCheckout && <Header />}
        
        {/* Phần Main Content ở giữa */}
        <main className={`flex-grow ${!isCheckout ? 'pt-[100px] pb-12' : ''}`}>
          {children}
        </main>
        
        {!isCheckout && <Footer />}
      </div>
    </CartProvider>
  );
}
