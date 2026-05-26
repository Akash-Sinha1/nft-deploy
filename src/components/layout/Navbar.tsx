"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, Rocket, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Explore", href: "/explorer", icon: Compass },
    { name: "Deploy", href: "/deploy", icon: Rocket },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary overflow-hidden shadow-sm shadow-primary/10 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-white text-lg tracking-tighter">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors duration-200">
                Base Launchpad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => router.prefetch(link.href)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 py-2 px-4 rounded-xl border border-transparent",
                    isActive
                      ? "text-primary bg-primary/5 border-primary/10 shadow-sm shadow-primary/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connect */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && <ConnectButton />}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-100 bg-white/95 py-4 px-4 space-y-2 absolute left-0 right-0 top-16 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => router.prefetch(link.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 text-sm font-semibold transition-all duration-200 p-3 rounded-xl border border-transparent",
                  isActive
                    ? "text-primary bg-primary/5 border-primary/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
