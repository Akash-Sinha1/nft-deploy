"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import SkeletonShimmer from "@/components/common/SkeletonShimmer";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => <SkeletonShimmer type="dashboard" />,
});

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function Page({ params }: PageProps) {
  // Await dynamic route params using React 19's `use` hook in Client Components
  const { address } = use(params);
  
  return <DashboardClient address={address} />;
}
