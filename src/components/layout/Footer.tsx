"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 relative overflow-hidden mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-extrabold text-white text-sm">
                B
              </div>
              <span className="font-bold text-slate-900 text-base">Base Launchpad</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              The premier no-code launchpad for creators on the Base blockchain. Deploy NFT collections, establish public mint pages, and manage token supplies instantly.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/deploy" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-150 font-medium">
                  Launch NFT
                </Link>
              </li>
              <li>
                <Link href="/explorer" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-150 font-medium">
                  Explore Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Blockchain & Status */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase">Networks Supported</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700 text-sm font-medium">Base Mainnet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-700 text-sm font-medium">Base Sepolia Testnet</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Base Launchpad. All rights reserved. Built for Base Creators.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-slate-400 hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
