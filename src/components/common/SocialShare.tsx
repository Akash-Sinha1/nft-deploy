"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Twitter, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  collectionName: string;
  contractAddress: string;
  network: "base" | "base-sepolia";
  symbol: string;
  inline?: boolean;
}

export function SocialShare({
  collectionName,
  contractAddress,
  network,
  symbol,
  inline = false,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  // Resolve paths
  const hostname = typeof window !== "undefined" ? window.location.origin : "https://basedeployer.xyz";
  const mintUrl = `${hostname}/collection/${contractAddress}`;
  
  const scanUrl = network === "base" 
    ? `https://basescan.org/address/${contractAddress}`
    : `https://sepolia.basescan.org/address/${contractAddress}`;
    
  const openseaUrl = network === "base"
    ? `https://opensea.io/assets/base/${contractAddress}`
    : `https://testnets.opensea.io/assets/base-sepolia/${contractAddress}`;

  // Formulate Tweet
  const tweetText = `I just deployed my NFT collection "${collectionName}" (${symbol}) on Base in under 30 seconds with zero code! 🔵🚀\n\nMint it now: ${mintUrl}\n\nDeploys powered by @BaseNFTDeployer`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mintUrl);
      setCopied(true);
      toast.success("Mint link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", inline ? "" : "w-full justify-center")}>
      {/* Twitter / X button */}
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-white text-black hover:bg-neutral-200 transition-all duration-200 shadow-md hover:scale-[1.02]"
      >
        <Twitter className="w-4 h-4 fill-current" />
        <span>Share on X</span>
      </a>

      {/* Copy Link Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-200"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy Mint Link</span>
          </>
        )}
      </button>

      {/* BaseScan button */}
      <a
        href={scanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-blue-950/40 text-blue-400 border border-blue-900/60 hover:bg-blue-950/80 transition-all duration-200"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Basescan</span>
      </a>

      {/* OpenSea button */}
      <a
        href={openseaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-sky-950/40 text-sky-400 border border-sky-900/60 hover:bg-sky-950/80 transition-all duration-200"
      >
        <ExternalLink className="w-4 h-4" />
        <span>OpenSea</span>
      </a>
    </div>
  );
}
