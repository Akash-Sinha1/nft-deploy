"use client";

import React from "react";
import dynamic from "next/dynamic";
import SkeletonShimmer from "@/components/common/SkeletonShimmer";

const DeployPageClient = dynamic(() => import("./DeployPageClient"), {
  ssr: false,
  loading: () => <SkeletonShimmer type="deploy" />,
});

export default function DeployPage() {
  return <DeployPageClient />;
}
