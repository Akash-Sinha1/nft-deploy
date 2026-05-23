"use client";

import React from "react";

interface SkeletonShimmerProps {
  type?: "card" | "explorer" | "deploy" | "mint" | "dashboard";
  count?: number;
}

export default function SkeletonShimmer({ type = "card", count = 4 }: SkeletonShimmerProps) {
  // 1. Grid of Shimmer Cards (Landing page / Explorer)
  if (type === "card" || type === "explorer") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-8 relative z-10">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[380px] border border-slate-100 bg-white p-5 space-y-4"
          >
            {/* Banner block */}
            <div className="shimmer-block w-full h-28 rounded-xl" />
            
            {/* Logo block */}
            <div className="shimmer-block w-14 h-14 rounded-xl -mt-10 border-2 border-white shadow-sm" />
            
            {/* Title & info */}
            <div className="space-y-2 flex-1">
              <div className="shimmer-block h-5 w-2/3" />
              <div className="shimmer-block h-3.5 w-1/3" />
              <div className="shimmer-block h-3 w-full" />
              <div className="shimmer-block h-3 w-4/5" />
            </div>
            
            {/* Progress bar block */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <div className="shimmer-block h-3 w-1/4" />
                <div className="shimmer-block h-3 w-10" />
              </div>
              <div className="shimmer-block h-2 w-full rounded-full" />
            </div>
            
            {/* Actions block */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="shimmer-block h-8 rounded-xl" />
              <div className="shimmer-block h-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Deploy Wizard Shimmer
  if (type === "deploy") {
    return (
      <div className="min-h-screen grid-bg py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header shimmer */}
          <div className="space-y-3 mb-10 text-center">
            <div className="shimmer-block h-4 w-40 mx-auto rounded-full" />
            <div className="shimmer-block h-9 w-80 mx-auto" />
            <div className="shimmer-block h-4 w-60 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Steps bar shimmer */}
            <div className="md:col-span-1 space-y-4">
              <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-100 space-y-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="shimmer-block h-7 w-7 rounded-full flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="shimmer-block h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right main form card shimmer */}
            <div className="md:col-span-3">
              <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-100 space-y-6">
                <div className="shimmer-block h-6 w-1/3" />
                <hr className="border-slate-100" />
                
                {/* Simulated inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="shimmer-block h-3.5 w-1/5" />
                    <div className="shimmer-block h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="shimmer-block h-3.5 w-1/6" />
                    <div className="shimmer-block h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="shimmer-block h-3.5 w-1/4" />
                    <div className="shimmer-block h-20 w-full rounded-xl" />
                  </div>
                </div>

                {/* Simulated buttons */}
                <div className="flex justify-between pt-6">
                  <div className="shimmer-block h-10 w-24 rounded-xl" />
                  <div className="shimmer-block h-10 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Dynamic Public Mint Page Shimmer
  if (type === "mint") {
    return (
      <div className="min-h-screen grid-bg pb-20 relative z-10">
        {/* Banner shimmer */}
        <div className="shimmer-block w-full h-64 sm:h-80" />
        
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Logo & Collection Descriptors */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                {/* Logo */}
                <div className="shimmer-block h-32 w-32 rounded-2xl border-4 border-white shadow-lg flex-shrink-0" />
                {/* Title info */}
                <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                  <div className="flex justify-center sm:justify-start gap-2">
                    <div className="shimmer-block h-5 w-24" />
                    <div className="shimmer-block h-5 w-20" />
                  </div>
                  <div className="shimmer-block h-8 w-2/3 mx-auto sm:mx-0" />
                  <div className="shimmer-block h-4 w-1/3 mx-auto sm:mx-0" />
                </div>
              </div>

              {/* Mock description box */}
              <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-100 space-y-4 shadow-sm">
                <div className="shimmer-block h-6 w-1/4" />
                <div className="space-y-2">
                  <div className="shimmer-block h-3.5 w-full" />
                  <div className="shimmer-block h-3.5 w-11/12" />
                  <div className="shimmer-block h-3.5 w-4/5" />
                </div>
              </div>
            </div>

            {/* Right Column: Checkout/Mint Panel Shimmer */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-2xl bg-white/95 border border-slate-100 shadow-xl space-y-6">
                <div className="space-y-2">
                  <div className="shimmer-block h-3 w-1/3" />
                  <div className="shimmer-block h-7 w-1/2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="shimmer-block h-3.5 w-1/4" />
                    <div className="shimmer-block h-3.5 w-1/5" />
                  </div>
                  <div className="shimmer-block h-2 w-full rounded-full" />
                </div>

                <div className="space-y-2.5">
                  <div className="shimmer-block h-3.5 w-1/3" />
                  <div className="shimmer-block h-12 w-full rounded-xl" />
                </div>

                <hr className="border-slate-100" />
                
                <div className="space-y-2">
                  <div className="shimmer-block h-10 w-full rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="shimmer-block h-9 rounded-xl" />
                    <div className="shimmer-block h-9 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 4. Creator Dashboard Shimmer
  if (type === "dashboard") {
    return (
      <div className="min-h-screen grid-bg py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          
          {/* Back link */}
          <div className="shimmer-block h-7 w-40 rounded-xl" />

          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="shimmer-block w-16 h-16 rounded-2xl flex-shrink-0" />
              <div className="space-y-2">
                <div className="shimmer-block h-7 w-48" />
                <div className="shimmer-block h-4 w-32" />
              </div>
            </div>
            <div className="shimmer-block h-9 w-36 rounded-full" />
          </div>

          {/* Metric cards shimmer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-sm">
                <div className="shimmer-block h-3 w-1/3" />
                <div className="shimmer-block h-8 w-1/2" />
                <div className="shimmer-block h-2 w-full rounded-full" />
              </div>
            ))}
          </div>

          {/* Core sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar menu shimmer */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-100 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shimmer-block h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>

            {/* Parameter setting dashboard card shimmer */}
            <div className="lg:col-span-2">
              <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-100 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <div className="shimmer-block h-6 w-1/3" />
                  <div className="shimmer-block h-3.5 w-1/2" />
                </div>
                <hr className="border-slate-100" />
                
                <div className="space-y-4">
                  <div className="shimmer-block h-10 w-full rounded-xl" />
                  <div className="shimmer-block h-24 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
