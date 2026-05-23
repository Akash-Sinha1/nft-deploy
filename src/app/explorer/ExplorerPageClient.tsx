"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Compass, 
  Search, 
  Layers, 
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface CollectionData {
  address: string;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  banner: string;
  creator: string;
  network: string;
  mintPrice: string;
  maxSupply: number;
  mintedCount: number;
  isSeeded: boolean;
  createdAt: string;
  trendingScore?: number;
}

export default function ExplorerPageClient() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        // Build url query params
        let url = "/api/collections?";
        if (networkFilter !== "all") {
          url += `network=${networkFilter}&`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, [networkFilter]);


  // Client-side search and advanced sorting
  const filteredAndSortedCollections = collections
    .filter((col) => {
      const matchQuery = 
        col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.creator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "trending") {
        return (b.trendingScore || 0) - (a.trendingScore || 0);
      }
      if (sortBy === "supply") {
        return b.maxSupply - a.maxSupply;
      }
      if (sortBy === "price-low") {
        return parseFloat(a.mintPrice) - parseFloat(b.mintPrice);
      }
      if (sortBy === "price-high") {
        return parseFloat(b.mintPrice) - parseFloat(a.mintPrice);
      }
      return 0;
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  } as const;

  return (
    <div className="min-h-screen relative grid-bg py-12">
      {/* Glow backgrounds */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] bg-accent-purple/3 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-primary" />
            <span>Discover Creators</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Base Collection Explorer
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl font-medium">
            Browse through active, trending, and recently launched NFT contracts on the Base mainnet and Sepolia networks.
          </p>
        </div>


        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search address, symbol, name, creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full !pl-12 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800"
            />
          </div>

          {/* Network Selection */}
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full !pl-12 !pr-10 py-3 rounded-xl glass-input text-sm text-slate-800 appearance-none cursor-pointer"
            >
              <option value="all">All Networks</option>
              <option value="base">Base Mainnet</option>
              <option value="base-sepolia">Base Sepolia</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Sorting */}
          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full !pl-12 !pr-10 py-3 rounded-xl glass-input text-sm text-slate-800 appearance-none cursor-pointer"
            >
              <option value="newest">Newest Launches</option>
              <option value="trending">Highest Trending</option>
              <option value="supply">Max Supply</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Catalog */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse flex flex-col justify-between p-6 bg-white border border-slate-100">
                <div className="w-full h-32 rounded-xl bg-slate-50" />
                <div className="space-y-3">
                  <div className="h-4 w-2/3 bg-slate-50 rounded" />
                  <div className="h-3 w-1/2 bg-slate-50 rounded" />
                </div>
                <div className="h-8 w-full bg-slate-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedCollections.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredAndSortedCollections.map((col) => {
              const percentage = Math.min(100, Math.round((col.mintedCount / col.maxSupply) * 100));
              return (
                <motion.div key={col.address} variants={itemVariants}>
                  <div className="glass-panel rounded-2xl overflow-hidden hover:scale-[1.01] transition-all duration-300 flex flex-col h-full border border-slate-100 hover:border-primary/20 hover:shadow-lg group bg-white">
                    {/* Banner container */}
                    <div className="relative h-28 w-full bg-slate-50 overflow-hidden">
                      <img 
                        src={col.banner} 
                        alt={col.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/95 border border-slate-100 text-[10px] font-bold text-slate-800 uppercase tracking-wider shadow-sm">
                        {col.network === "base" ? "Base" : "Sepolia"}
                      </div>
                    </div>

                    {/* Logo & details */}
                    <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
                      <div className="relative -mt-8 mb-3 flex h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-slate-50 shadow-sm">
                        <img 
                          src={col.logo} 
                          alt={col.name} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="h-full w-full object-cover" 
                        />
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base truncate mb-0.5 group-hover:text-primary transition-colors duration-150">
                        {col.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50">
                          ${col.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          by {formatAddress(col.creator)}
                        </span>
                      </div>

                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-1 font-medium font-medium">
                        {col.description}
                      </p>

                      {/* Mint progress bar */}
                      <div className="space-y-1.5 mb-5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Supply Minted</span>
                          <span className="text-slate-800">{percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                          <span>{col.mintedCount} minted</span>
                          <span>{col.maxSupply} Max</span>
                        </div>
                      </div>

                      {/* Launch Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <Link
                          href={`/collection/${col.address}`}
                          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors text-center"
                        >
                          <span>Mint Page</span>
                        </Link>
                        <Link
                          href={`/dashboard/${col.address}`}
                          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 transition-colors text-center"
                        >
                          <span>Dashboard</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="glass-panel text-center p-16 rounded-2xl border border-slate-100 bg-white">
            <Compass className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Collections Discovered</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
              No deployed NFT collections matched your search parameters and filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setNetworkFilter("all");
                setSortBy("newest");
              }}
              className="px-6 py-3 rounded-xl font-bold bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
