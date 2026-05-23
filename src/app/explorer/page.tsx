"use client";

import React from "react";
import dynamic from "next/dynamic";
import SkeletonShimmer from "@/components/common/SkeletonShimmer";

const ExplorerPageClient = dynamic(() => import("./ExplorerPageClient"), {
  ssr: false,
  loading: () => <SkeletonShimmer type="explorer" count={8} />,
});

export default function ExplorerPage() {
  return <ExplorerPageClient />;
}
