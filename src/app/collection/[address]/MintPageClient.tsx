"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSwitchChain, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther, createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { NFT_CONTRACT_ABI } from "@/lib/contract";
import { 
  Plus, 
  Minus, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  Shield,
  CheckCircle,
  X
} from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";
import { formatAddress } from "@/lib/utils";
import { SocialShare } from "@/components/common/SocialShare";
import { toast } from "sonner";

interface CollectionData {
  address: string;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  banner: string;
  creator: string;
  network: "base" | "base-sepolia";
  mintPrice: string;
  maxSupply: number;
  mintedCount: number;
  isSeeded: boolean;
}

export default function MintPageClient({ address }: { address: string }) {
  const router = useRouter();
  const { address: walletAddress, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Indexer/Collection details state
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Blockchain claiming state
  const [minting, setMinting] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");

  // Fetch initial info from DB
  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true);
        const response = await fetch(`/api/collections?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCollection(data[0]);
          } else {
            // If not found in our DB, compile a beautiful generic structure
            setCollection({
              address,
              name: "Base Deployed ERC-721 Drop",
              symbol: "NFT",
              description: "A programmatically deployed ERC-721 Drop NFT contract on the Base blockchain.",
              logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80",
              banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
              creator: "0xUnknownCreatorAddress",
              network: "base-sepolia",
              mintPrice: "0.005",
              maxSupply: 1000,
              mintedCount: 1,
              isSeeded: false
            });
          }
        }
      } catch (err) {
        console.error("Failed to load collection details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollection();
  }, [address]);

  // Read live contract values from the blockchain
  const { data: nextTokenId, refetch: refetchNextTokenId } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "nextTokenId",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const { data: onChainMintPrice } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "mintPrice",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const { data: onChainMaxSupply } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "maxSupply",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const { data: onChainPaused } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "paused",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const targetChainId = collection?.network === "base" ? 8453 : 84532;
  const wrongChain = isConnected && chainId !== targetChainId;

  // Determine current supply minted
  const activeMintedCount = nextTokenId !== undefined
    ? Number(nextTokenId) - 1
    : (collection ? collection.mintedCount : 0);

  const activeMaxSupply = onChainMaxSupply !== undefined
    ? Number(onChainMaxSupply)
    : (collection ? collection.maxSupply : 1000);

  const activePaused = onChainPaused !== undefined ? Boolean(onChainPaused) : false;

  const activeMintPriceWei = onChainMintPrice !== undefined
    ? (onChainMintPrice as bigint)
    : parseEther(collection ? collection.mintPrice : "0.005");

  const pricePerNFT = Number(formatEther(activeMintPriceWei));
  const totalPrice = pricePerNFT * quantity;

  // Quantity Change Handlers
  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 10));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  // Perform NFT Minting
  const handleMint = async () => {
    if (!collection) return;

    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (chainId !== targetChainId) {
      toast.error(`Please switch your wallet network first.`);
      return;
    }

    if (activePaused) {
      toast.error("Minting is currently paused by the creator.");
      return;
    }

    if (activeMintedCount + quantity > activeMaxSupply) {
      toast.error("Not enough tokens remaining in the collection supply.");
      return;
    }

    setMinting(true);
    setTxSuccess(false);

    try {
      const publicClient = createPublicClient({
        chain: targetChainId === 8453 ? base : baseSepolia,
        transport: http(),
      });

      // Submit payable mint transaction
      const mintHash = await writeContractAsync({
        address: address as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: "mint",
        args: [BigInt(quantity)],
        value: activeMintPriceWei * BigInt(quantity),
      });

      toast.info("Transaction submitted! Waiting for block confirmation on Base...");

      // Wait for block receipt confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });

      if (receipt.status === "reverted") {
        throw new Error("The transaction was reverted on-chain. Minting failed.");
      }

      setTxHash(mintHash);
      setTxSuccess(true);

      // Refresh supply count
      refetchNextTokenId();

      // Optimistically update supply
      setCollection((prev) => prev ? {
        ...prev,
        mintedCount: activeMintedCount + quantity
      } : null);

      toast.success(`Successfully minted ${quantity} NFT(s)!`);
    } catch (err) {
      console.error("Mint failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Minting transaction failed.";
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected in your wallet.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setMinting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: targetChainId });
    } catch (err) {
      console.error("Network switch error:", err);
      toast.error("Failed to switch network in wallet.");
    }
  };

  const openseaUrl = collection
    ? (collection.network === "base"
      ? `https://opensea.io/assets/base/${address}`
      : `https://testnets.opensea.io/assets/base-sepolia/${address}`)
    : "#";

  const basescanUrl = collection
    ? (collection.network === "base"
      ? `https://basescan.org/address/${address}`
      : `https://sepolia.basescan.org/address/${address}`)
    : "#";

  const basescanTxUrl = collection && txHash
    ? (collection.network === "base"
      ? `https://basescan.org/tx/${txHash}`
      : `https://sepolia.basescan.org/tx/${txHash}`)
    : "#";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative grid-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-slate-500 font-semibold text-sm">Loading NFT collection metrics...</span>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-20 px-4 relative grid-bg">
        <GlassCard className="text-center p-12 max-w-md bg-white border border-slate-100 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Collection Not Found</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">
            The NFT contract address you are trying to view does not exist or has not been registered.
          </p>
          <button onClick={() => router.push("/explorer")} className="px-6 py-3 rounded-xl bg-primary text-white font-bold cursor-pointer hover:bg-primary-hover shadow-sm transition-colors">
            Back to Explorer
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg pb-20 relative">
      {/* Glow backgrounds */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animate-pulse-slow" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-accent-purple/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animate-pulse-slow" />

      {/* Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
        <img 
          src={collection.banner} 
          alt={collection.name} 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-95" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Logo & Collection Descriptors */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white bg-slate-50 shadow-lg flex-shrink-0">
                <img src={collection.logo} alt={collection.name} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-bold uppercase border border-primary/10 tracking-wider">
                    {collection.network === "base" ? "Base Mainnet" : "Base Sepolia"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px] font-mono border border-slate-200">
                    {formatAddress(address)}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  {collection.name}
                </h1>
                <p className="text-slate-500 text-sm font-semibold">
                  Symbol: <span className="text-primary font-bold">${collection.symbol}</span>
                </p>
              </div>
            </div>

            <GlassCard className="space-y-4 bg-white border border-slate-100 shadow-sm p-6 rounded-2xl">
              <h3 className="font-extrabold text-slate-800 text-lg">About this Collection</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {collection.description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Creator Wallet</span>
                  <p className="text-slate-700 font-mono mt-0.5 truncate font-medium">{collection.creator}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Smart Contract</span>
                  <a 
                    href={basescanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline flex items-center gap-1 mt-0.5 font-mono font-bold"
                  >
                    <span>{formatAddress(address)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT: Minting Panel */}
          <div>
            <GlassCard className="space-y-6 sticky top-24 border border-slate-100 hover:border-primary/10 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Public Mint Stage</span>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl font-black text-slate-900">
                    {pricePerNFT === 0 ? "Free Mint" : `${pricePerNFT} ETH`}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">per NFT</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Minted Supply</span>
                  <span className="text-slate-800">
                    {activeMintedCount} / {activeMaxSupply}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full" 
                    style={{ width: `${Math.min(100, (activeMintedCount / activeMaxSupply) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block text-right font-medium">
                  {activeMaxSupply - activeMintedCount} NFTs remaining
                </span>
              </div>

              {/* Quantity selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select Quantity</label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <button 
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || minting}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200/60 text-slate-500 hover:text-slate-800 disabled:opacity-40 shadow-sm cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-lg text-slate-900">{quantity}</span>
                  <button 
                    onClick={handleIncrement}
                    disabled={quantity >= 10 || minting}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200/60 text-slate-500 hover:text-slate-800 disabled:opacity-40 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>{quantity} x {pricePerNFT} ETH</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Gas Fee</span>
                  <span>~0.0001 ETH</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2.5 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span>{totalPrice.toFixed(4)} ETH</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isConnected ? (
                  <div className="w-full flex justify-center">
                    <ConnectButton />
                  </div>
                ) : wrongChain ? (
                  <button
                    onClick={handleSwitchNetwork}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100/50 transition-all cursor-pointer text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Switch wallet network</span>
                  </button>
                ) : (
                  <button
                    onClick={handleMint}
                    disabled={minting || activeMintedCount >= activeMaxSupply || activePaused}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-sm"
                  >
                    {minting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Transaction...</span>
                      </>
                    ) : activePaused ? (
                      <span>Minting Paused</span>
                    ) : activeMintedCount >= activeMaxSupply ? (
                      <span>Sold Out</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Mint {quantity} NFT(s)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Marketplace Links */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <a 
                  href={openseaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100/50 transition-colors font-bold"
                >
                  <span>OpenSea</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a 
                  href={basescanUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-800 hover:bg-slate-100 transition-colors font-bold"
                >
                  <span>Basescan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </GlassCard>
          </div>

        </div>
      </div>

      {/* TRANSACTION SUCCESS MODAL */}
      <AnimatePresence>
        {txSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl p-6 relative border border-slate-100 bg-white shadow-2xl space-y-6 text-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => setTxSuccess(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex justify-center">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Mint Successful!</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  Successfully claimed {quantity} NFT(s) from &quot;{collection.name}&quot;
                </p>
              </div>

              {/* NFT image preview */}
              <div className="relative h-40 w-40 mx-auto rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
                <img src={collection.logo} alt="NFT Preview" className="h-full w-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-slate-900/80 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-white">
                  Token #{activeMintedCount}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-left max-w-sm mx-auto">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800">{totalPrice.toFixed(4)} ETH</span>
                </div>
                 <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Transaction Status</span>
                  <span className="text-emerald-600 font-bold">Confirmed</span>
                </div>
                <div className="flex justify-between items-center gap-4 font-medium">
                  <span className="text-slate-500">Tx Hash</span>
                  <a 
                    href={basescanTxUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary font-mono font-bold truncate hover:underline flex items-center gap-1 max-w-[150px]"
                  >
                    <span>{txHash}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <SocialShare
                  collectionName={collection.name}
                  contractAddress={address}
                  network={collection.network}
                  symbol={collection.symbol}
                />
              </div>

              <button
                onClick={() => setTxSuccess(false)}
                className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-900 text-sm font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
