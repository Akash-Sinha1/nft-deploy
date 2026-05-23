import React from "react";
import SkeletonShimmer from "@/components/common/SkeletonShimmer";

export default function Loading() {
  return (
    <div className="min-h-screen relative grid-bg py-12">
      {/* Dynamic glow overlays to match application layouts */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-accent-purple/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Mocking a premium page heading structure */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="shimmer-block h-4 w-32 rounded-full mx-auto sm:mx-0" />
          <div className="shimmer-block h-8 w-64 mx-auto sm:mx-0" />
          <div className="shimmer-block h-4 w-96 mx-auto sm:mx-0" />
        </div>
        
        {/* Standard loading card grids */}
        <SkeletonShimmer type="card" count={8} />
      </div>
    </div>
  );
}
