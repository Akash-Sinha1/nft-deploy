"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import SkeletonShimmer from "@/components/common/SkeletonShimmer";

const MintPageClient = dynamic(() => import("./MintPageClient"), {
  ssr: false,
  loading: () => <SkeletonShimmer type="mint" />,
});

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function CollectionPage({ params }: PageProps) {
  // Await dynamic route params using React 19's `use` hook in Client Components
  const { address } = use(params);
  
  return <MintPageClient address={address} />;
}
