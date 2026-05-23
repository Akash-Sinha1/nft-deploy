"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useSwitchChain, useReadContract, useWriteContract, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther, createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { NFT_CONTRACT_ABI } from "@/lib/contract";
import { 
  Loader2, 
  AlertTriangle,
  ArrowLeft,
  Settings,
  Coins,
  Pause,
  Play,
  UserCheck,
  Download,
  Users,
  ExternalLink
} from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";
import { formatAddress } from "@/lib/utils";
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

export default function DashboardClient({ address }: { address: string }) {
  const router = useRouter();
  const { address: walletAddress, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Component states
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pricing");

  // Forms state
  const [newPrice, setNewPrice] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [updating, setUpdating] = useState(false);

  // Fetch initial info from indexer DB
  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true);
        const response = await fetch(`/api/collections?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCollection(data[0]);
            setNewPrice(data[0].mintPrice);
          } else {
            // Fallback generic collection
            setCollection({
              address,
              name: "Base Deployed ERC-721 Drop",
              symbol: "NFT",
              description: "A programmatically deployed ERC-721 Drop NFT contract on the Base blockchain.",
              logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80",
              banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
              creator: walletAddress || "0xCreatorWalletAddressPlaceholder",
              network: "base-sepolia",
              mintPrice: "0.005",
              maxSupply: 1000,
              mintedCount: 1,
              isSeeded: false
            });
            setNewPrice("0.005");
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard collection info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollection();
  }, [address, walletAddress]);

  // Load contract balance dynamically
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}`,
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const contractBalance = balanceData ? balanceData.formatted : "0.0";

  // Read live owner, paused state, supply and price from blockchain
  const { data: contractOwner, refetch: refetchOwner } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "owner",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const { data: onChainPaused, refetch: refetchPaused } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "paused",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const { data: nextTokenId } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "nextTokenId",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const { data: onChainMintPrice, refetch: refetchMintPrice } = useReadContract({
    address: address as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    functionName: "mintPrice",
    query: {
      staleTime: 10000,
      gcTime: 300000,
    }
  });

  const activeOwner = contractOwner !== undefined
    ? (contractOwner as string)
    : (collection ? collection.creator : "");

  const mintingPaused = onChainPaused !== undefined
    ? Boolean(onChainPaused)
    : (collection ? collection.mintedCount >= collection.maxSupply : false);

  const activeMintedCount = nextTokenId !== undefined
    ? Number(nextTokenId) - 1
    : (collection ? collection.mintedCount : 0);

  // Holder mock list for beautiful statistics visual display
  const holdersList = React.useMemo(() => [
    { address: activeOwner, count: 1, label: "Owner (NFT #1)" },
    { address: "0x1b45...c3d4", count: 3, label: "Collector" },
    { address: "0x98f2...e10a", count: 2, label: "Collector" },
    { address: "0x44ab...5f53", count: 1, label: "Collector" },
  ], [activeOwner]);

  // Sync state when on-chain mint price resolves
  useEffect(() => {
    if (onChainMintPrice !== undefined) {
      setNewPrice(formatEther(onChainMintPrice as bigint));
    }
  }, [onChainMintPrice]);

  const targetChainId = collection?.network === "base" ? 8453 : 84532;
  const wrongChain = isConnected && chainId !== targetChainId;

  // Helper function to sync indexer database with our latest on-chain metadata state
  const syncCollectionWithDb = async (updatedFields: Partial<CollectionData>) => {
    if (!collection) return;
    try {
      const payload = {
        ...collection,
        ...updatedFields,
      };
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setCollection(payload);
    } catch (err) {
      console.error("Failed to sync updated collection with DB:", err);
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

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection) return;
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (chainId !== targetChainId) {
      toast.error(`Please switch your wallet network first.`);
      return;
    }
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setUpdating(true);

    try {
      const publicClient = createPublicClient({
        chain: targetChainId === 8453 ? base : baseSepolia,
        transport: http(),
      });

      const txHash = await writeContractAsync({
        address: address as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: "setMintPrice",
        args: [parseEther(newPrice)],
      });

      toast.info("Transaction submitted! Waiting for block confirmation on Base...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("The transaction reverted on-chain. Price update failed.");
      }

      // Sync indexer database
      await syncCollectionWithDb({ mintPrice: newPrice });

      // Refresh on-chain states
      refetchMintPrice();

      toast.success(`Successfully updated mint price to ${newPrice} ETH!`);
    } catch (err) {
      console.error("Failed to update price:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit pricing transaction.";
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected in your wallet.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePause = async () => {
    if (!collection) return;
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (chainId !== targetChainId) {
      toast.error(`Please switch your wallet network first.`);
      return;
    }

    setUpdating(true);
    const nextPauseState = !mintingPaused;

    try {
      const publicClient = createPublicClient({
        chain: targetChainId === 8453 ? base : baseSepolia,
        transport: http(),
      });

      const txHash = await writeContractAsync({
        address: address as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: "setPaused",
        args: [nextPauseState],
      });

      toast.info(`${nextPauseState ? "Pausing" : "Resuming"} minting. Waiting for block confirmation...`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("The transaction reverted on-chain. Paused toggle failed.");
      }

      // Refresh on-chain paused state
      refetchPaused();

      toast.success(`Minting successfully ${nextPauseState ? "paused" : "resumed"}!`);
    } catch (err) {
      console.error("Failed to toggle pause:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update claiming permissions.";
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected in your wallet.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection) return;
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (chainId !== targetChainId) {
      toast.error(`Please switch your wallet network first.`);
      return;
    }
    if (!newOwner || !newOwner.startsWith("0x") || newOwner.length !== 42) {
      toast.error("Please enter a valid wallet address starting with 0x.");
      return;
    }

    setUpdating(true);

    try {
      const publicClient = createPublicClient({
        chain: targetChainId === 8453 ? base : baseSepolia,
        transport: http(),
      });

      const txHash = await writeContractAsync({
        address: address as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: "transferOwnership",
        args: [newOwner as `0x${string}`],
      });

      toast.info("Transferring ownership. Waiting for block confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("The transaction reverted on-chain. Ownership transfer failed.");
      }

      // Sync indexer database
      await syncCollectionWithDb({ creator: newOwner });

      // Refresh on-chain state
      refetchOwner();

      setNewOwner("");
      toast.success(`Contract ownership successfully transferred to ${newOwner}!`);
    } catch (err) {
      console.error("Ownership transfer failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit ownership transfer transaction.";
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected in your wallet.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!collection) return;
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (chainId !== targetChainId) {
      toast.error(`Please switch your wallet network first.`);
      return;
    }
    if (parseFloat(contractBalance) === 0) {
      toast.error("No funds available to withdraw.");
      return;
    }

    setUpdating(true);

    try {
      const publicClient = createPublicClient({
        chain: targetChainId === 8453 ? base : baseSepolia,
        transport: http(),
      });

      const txHash = await writeContractAsync({
        address: address as `0x${string}`,
        abi: NFT_CONTRACT_ABI,
        functionName: "withdraw",
        args: [],
      });

      toast.info("Withdrawing funds. Waiting for block confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("The transaction reverted on-chain. Withdrawal failed.");
      }

      // Refresh balances
      refetchBalance();

      toast.success(`Successfully withdrew contract funds to owner wallet!`);
    } catch (err) {
      console.error("Withdrawal failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit withdrawal transaction.";
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected in your wallet.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative grid-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-slate-500 font-semibold text-sm">Loading Creator Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-20 px-4 relative grid-bg">
        <GlassCard className="text-center p-12 max-w-md bg-white border border-slate-100 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Collection Not Found</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">
            The collection you are trying to manage could not be loaded.
          </p>
          <button onClick={() => router.push("/")} className="px-6 py-3 rounded-xl bg-primary text-white font-bold cursor-pointer hover:bg-primary-hover shadow-sm transition-colors">
            Back Home
          </button>
        </GlassCard>
      </div>
    );
  }

  const basescanUrl = collection.network === "base"
    ? `https://basescan.org/address/${address}`
    : `https://sepolia.basescan.org/address/${address}`;

  return (
    <div className="min-h-screen grid-bg py-12 relative">
      {/* Glow backgrounds */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] bg-accent-purple/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Breadcrumb back */}
        <Link 
          href={`/collection/${address}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors duration-150 mb-6 bg-slate-50 border border-slate-200/60 py-1.5 px-3 rounded-xl hover:bg-slate-100 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Mint Page</span>
        </Link>

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <img src={collection.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{collection.name}</h1>
                <span className="text-xs font-bold font-mono text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded uppercase">{collection.symbol}</span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5 font-medium">Creator Dashboard Suite</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 text-xs font-semibold">Active</span>
            <a 
              href={basescanUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-2 flex items-center gap-1 text-xs text-primary hover:underline font-mono font-bold"
            >
              <span>{formatAddress(address)}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Dynamic Metric overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <GlassCard className="space-y-2 border-l-2 border-primary bg-white border border-slate-100 p-6 rounded-2xl shadow-sm" animate delay={0.05}>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Minted</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{activeMintedCount}</span>
              <span className="text-slate-500 text-xs font-medium">/ {collection.maxSupply} tokens</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${Math.min(100, (activeMintedCount / collection.maxSupply) * 100)}%` }}
              />
            </div>
          </GlassCard>

          <GlassCard className="space-y-2 border-l-2 border-sky-500 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm" animate delay={0.1}>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Contract Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{contractBalance} ETH</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">Available to withdraw to owner wallet</span>
          </GlassCard>

          <GlassCard className="space-y-2 border-l-2 border-indigo-500 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm" animate delay={0.15}>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Current Network</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{collection.network === "base" ? "Base" : "Sepolia"}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">Chain ID: {collection.network === "base" ? "8453" : "84532"}</span>
          </GlassCard>
        </div>

        {/* Main Interface Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT Navigation Tabs */}
          <div>
            <GlassCard className="p-3 space-y-1.5 bg-white border border-slate-100 shadow-sm rounded-2xl">
              <button
                onClick={() => setActiveTab("pricing")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                  activeTab === "pricing" 
                    ? "bg-primary text-white shadow-sm shadow-primary/10" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pricing Settings</span>
              </button>
              <button
                onClick={() => setActiveTab("holders")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                  activeTab === "holders" 
                    ? "bg-primary text-white shadow-sm shadow-primary/10" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Token Holders</span>
              </button>
              <button
                onClick={() => setActiveTab("ownership")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                  activeTab === "ownership" 
                    ? "bg-primary text-white shadow-sm shadow-primary/10" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Contract Ownership</span>
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer ${
                  activeTab === "withdraw" 
                    ? "bg-primary text-white shadow-sm shadow-primary/10" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Withdraw Earnings</span>
              </button>
            </GlassCard>

            {/* Warning wrong chain indicator */}
            {wrongChain && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2 mt-4 shadow-sm">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] text-amber-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Wallet Connection Mismatch</span>
                </div>
                <p className="leading-relaxed text-amber-700 font-medium">
                  Your connected wallet is on a different network than this contract. Switch to submit real contract transactions.
                </p>
                <button
                  onClick={handleSwitchNetwork}
                  className="w-full py-2.5 bg-amber-600 text-white font-bold rounded-xl mt-1 text-xs hover:bg-amber-700 transition-all cursor-pointer shadow-sm shadow-amber-100"
                >
                  Switch to {collection.network === "base" ? "Base" : "Base Sepolia"}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT Tab View Box */}
          <div className="lg:col-span-2">
            <GlassCard className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              
              {/* TAB 1: PRICING SETTINGS */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Pricing & Claim Controls</h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium">Configure parameters for how users mint your tokens.</p>
                  </div>

                  <form onSubmit={handleUpdatePrice} className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Update Mint Price (ETH)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="glass-input text-sm flex-1"
                        />
                        {!isConnected ? (
                          <div className="w-full sm:w-auto flex justify-center">
                            <ConnectButton />
                          </div>
                        ) : wrongChain ? (
                          <button
                            type="button"
                            onClick={handleSwitchNetwork}
                            className="px-6 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100/50 text-sm cursor-pointer"
                          >
                            Switch Network
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={updating}
                            className="px-6 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white text-sm disabled:opacity-40 cursor-pointer shadow-sm transition-colors"
                          >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Price"}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  <hr className="border-slate-100" />

                  {/* Pause / Resume Toggles */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mint Status Toggle</label>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">
                          {mintingPaused ? "Minting is currently PAUSED" : "Minting is currently ACTIVE"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                          {mintingPaused 
                            ? "Public collectors cannot mint. Resume to allow public claiming." 
                            : "Public collectors can claim NFTs at the current established price."}
                        </span>
                      </div>
                      {!isConnected ? (
                        <div className="w-full sm:w-auto flex justify-center">
                          <ConnectButton />
                        </div>
                      ) : wrongChain ? (
                        <button
                          type="button"
                          onClick={handleSwitchNetwork}
                          className="px-6 py-2.5 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100/50 text-xs cursor-pointer"
                        >
                          Switch Network
                        </button>
                      ) : (
                        <button
                          onClick={handleTogglePause}
                          disabled={updating}
                          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm border cursor-pointer transition-all duration-150 ${
                            mintingPaused
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/50"
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/50"
                          }`}
                        >
                          {updating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : mintingPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Resume Minting</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Pause Minting</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HOLDERS LIST */}
              {activeTab === "holders" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Token Collectors</h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium">Review wallets that currently hold your collection assets.</p>
                  </div>

                  <div className="space-y-2">
                    {holdersList.map((holder, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-800 text-xs break-all font-semibold">{holder.address}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">{holder.label}</span>
                        </div>
                        <span className="text-primary font-bold text-sm bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                          {holder.count} NFT(s)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: OWNERSHIP TRANSFER */}
              {activeTab === "ownership" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Transfer Smart Contract Ownership</h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium">Move full contract authority to another Ethereum address.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex gap-2.5 leading-relaxed font-medium shadow-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <span className="text-red-700">
                      <strong>WARNING:</strong> Transferring ownership is irreversible! You will completely lose access to portal structures, pauses, dashboard suites, and contract withdraw actions! Confirm the target address is correct.
                    </span>
                  </div>

                  <form onSubmit={handleTransferOwnership} className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Target Owner Wallet Address</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0x000000000000000000000000000000" 
                        value={newOwner}
                        onChange={(e) => setNewOwner(e.target.value)}
                        className="glass-input text-sm"
                      />
                    </div>
                    {!isConnected ? (
                      <div className="w-full flex justify-center">
                        <ConnectButton />
                      </div>
                    ) : wrongChain ? (
                      <button
                        type="button"
                        onClick={handleSwitchNetwork}
                        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100/50 text-sm cursor-pointer"
                      >
                        Switch Network to Transfer Ownership
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-40 cursor-pointer shadow-sm shadow-red-100 transition-colors"
                      >
                        {updating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Transfer Authority Irreversibly</span>
                          </>
                        )}
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* TAB 4: WITHDRAW EARNINGS */}
              {activeTab === "withdraw" && (
                <div className="space-y-6 text-center py-4">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-md">
                      <Coins className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Withdraw Contract Funds</h3>
                      <p className="text-slate-500 text-xs mt-1 font-medium">
                        Collect mint proceeds locked inside the ERC-721 Drop contract.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Available Balance</span>
                      <span className="text-3xl font-black text-slate-900 mt-1 block">{contractBalance} ETH</span>
                    </div>

                    {!isConnected ? (
                      <div className="w-full flex justify-center">
                        <ConnectButton />
                      </div>
                    ) : wrongChain ? (
                      <button
                        type="button"
                        onClick={handleSwitchNetwork}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100/50 transition-all text-sm cursor-pointer"
                      >
                        Switch Network to Withdraw
                      </button>
                    ) : (
                      <button
                        onClick={handleWithdrawFunds}
                        disabled={updating || parseFloat(contractBalance) === 0}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/10 disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer transition-colors"
                      >
                        {updating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Withdraw proceeds to Wallet</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </GlassCard>
          </div>

        </div>
      </div>
    </div>
  );
}
