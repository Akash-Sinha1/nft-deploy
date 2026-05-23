"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Compass, 
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative grid-bg flex flex-col justify-center py-20 sm:py-32">
      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-40 right-1/4 w-[350px] h-[350px] bg-accent-purple/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight max-w-4xl mx-auto"
        >
          Launch Your NFT Collection on <span className="text-primary">Base</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
        >
          From artwork to onchain collection in under a minute.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="/deploy"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 hover:scale-[1.01] transition-all duration-200"
          >
            <Rocket className="w-5 h-5" />
            <span>Launch NFT Collection</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/explorer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
          >
            <Compass className="w-5 h-5" />
            <span>Explore Deploys</span>
          </Link>
        </motion.div>

        {/* Brand Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 max-w-3xl mx-auto border-t border-slate-100 pt-8"
        >
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>100% Onchain</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>0% Platform Fees</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Standard Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>IPFS Pinned</span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
