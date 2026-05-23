"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSwitchChain, useDeployContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_BYTECODE } from "@/lib/contract";
import { 
  Rocket, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  Shield,
  Zap,
  Database,
  ShieldCheck
} from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";
import { ConfettiEffect } from "@/components/common/ConfettiEffect";
import { SocialShare } from "@/components/common/SocialShare";

// Total Wizard Steps
const STEPS = [
  { id: "basics", title: "Collection Info" },
  { id: "assets", title: "Media Assets" },
  { id: "pricing", title: "Mint Settings" },
  { id: "deploy", title: "Launch!" }
];

export default function DeployPageClient() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { deployContractAsync } = useDeployContract();
  const { writeContractAsync } = useWriteContract();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);

  // Form Fields
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [network, setNetwork] = useState("84532"); // Base Sepolia by default (84532)
  const [maxSupply, setMaxSupply] = useState("1000");
  const [mintPrice, setMintPrice] = useState("0.005");
  const [royaltyPercentage, setRoyaltyPercentage] = useState(2.5);

  const targetChainId = network === "8453" ? 8453 : 84532;
  const wrongChain = isConnected && chainId !== targetChainId;

  // Asset Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // Uploaded URIs
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // Deploying / Transaction States
  const [deploying, setDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);
  const [deployedAddress, setDeployedAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // File Upload Handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // Navigations
  const handleNext = () => {
    if (currentStep === 0 && (!name || !symbol)) {
      setErrorMsg("Please fill out the collection name and symbol.");
      return;
    }
    if (currentStep === 1 && !logoFile) {
      setErrorMsg("Please upload at least a collection logo.");
      return;
    }
    setErrorMsg("");
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Deployment script
  const handleLaunch = async () => {
    if (!isConnected || !address) {
      setErrorMsg("Please connect your wallet first!");
      return;
    }

    if (chainId !== targetChainId) {
      setErrorMsg(`Please switch your wallet network first.`);
      return;
    }

    setDeploying(true);
    setDeployLogs([]);
    setErrorMsg("");

    const addLog = (msg: string) => {
      setDeployLogs((prev) => [...prev, msg]);
      setActiveLogIndex((prev) => prev + 1);
    };

    try {
      addLog("Initializing launch parameters...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      addLog("Uploading assets to decentralized storage...");
      let finalLogoUrl = logoUrl;
      let finalBannerUrl = bannerUrl;

      // Upload Logo
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("file", logoFile);
        const logoRes = await fetch("/api/upload", {
          method: "POST",
          body: logoFormData,
        });
        if (!logoRes.ok) throw new Error("Logo upload failed.");
        const logoData = await logoRes.json();
        finalLogoUrl = logoData.url;
        setLogoUrl(finalLogoUrl);
      }

      // Upload Banner
      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", bannerFile);
        const bannerRes = await fetch("/api/upload", {
          method: "POST",
          body: bannerFormData,
        });
        if (!bannerRes.ok) throw new Error("Banner upload failed.");
        const bannerData = await bannerRes.json();
        finalBannerUrl = bannerData.url;
        setBannerUrl(finalBannerUrl);
      }
      addLog("Asset upload completed successfully!");
      await new Promise((resolve) => setTimeout(resolve, 600));

      addLog("Creating collection metadata specification...");
      const contractMetadata = {
        name,
        description: description || `Official NFT collection for ${name}`,
        image: finalLogoUrl,
        banner: finalBannerUrl,
        seller_fee_basis_points: Math.round(royaltyPercentage * 100),
        fee_recipient: address,
      };

      const metadataBlob = new Blob([JSON.stringify(contractMetadata)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json");
      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataFile);

      const metadataRes = await fetch("/api/upload", {
        method: "POST",
        body: metadataFormData,
      });
      if (!metadataRes.ok) throw new Error("Collection metadata upload failed.");
      const metadataJsonData = await metadataRes.json();
      const contractURI = metadataJsonData.url;

      addLog("Metadata successfully anchored! Requesting contract deployment signature...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Construct dynamic public client for transaction confirmation
      const publicClient = createPublicClient({
        chain: targetChainId === 8453 ? base : baseSepolia,
        transport: http(),
      });

      // Deploy the custom solidity smart contract on-chain
      const deployHash = await deployContractAsync({
        abi: NFT_CONTRACT_ABI,
        bytecode: NFT_CONTRACT_BYTECODE,
        args: [
          name,
          symbol,
          contractURI,
          "", // Temporary empty baseTokenURI, will set after we have contractAddress
          parseEther(mintPrice),
          BigInt(maxSupply),
          address, // initialOwner
        ],
      });

      addLog(`Deployment transaction submitted! Hash: ${deployHash.slice(0, 10)}...${deployHash.slice(-8)}`);
      addLog("Waiting for block confirmation on Base...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
      const contractAddress = receipt.contractAddress;

      if (!contractAddress) {
        throw new Error("Contract address was not returned from the transaction receipt.");
      }

      addLog(`Smart contract successfully deployed at ${contractAddress}!`);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Post-deployment metadata setup (set baseTokenURI to our dynamic serverless API)
      addLog("Configuring on-chain NFT metadata dynamic lookup...");
      const baseTokenURI = `${window.location.origin}/api/metadata/${contractAddress.toLowerCase()}/`;
      
      const setBaseUriHash = await writeContractAsync({
        address: contractAddress,
        abi: NFT_CONTRACT_ABI,
        functionName: "setBaseURI",
        args: [baseTokenURI],
      });
      
      addLog("Waiting for metadata verification on-chain...");
      await publicClient.waitForTransactionReceipt({ hash: setBaseUriHash });
      addLog("On-chain NFT metadata resolution configured successfully!");

      // Auto-mint the first NFT to the creator's wallet
      addLog("Auto-minting the first collection NFT to creator's wallet...");
      
      const mintFirstHash = await writeContractAsync({
        address: contractAddress,
        abi: NFT_CONTRACT_ABI,
        functionName: "mint",
        args: [BigInt(1)],
        value: parseEther(mintPrice),
      });

      addLog("Waiting for NFT delivery confirmation...");
      const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintFirstHash });
      if (mintReceipt.status === "reverted") {
        throw new Error("Initial NFT auto-mint failed.");
      }
      addLog("First collection NFT successfully delivered to creator!");

      addLog("Registering and indexing collection in database indexer...");

      // Save collection via our REST API
      const registerRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: contractAddress,
          name,
          symbol,
          description,
          logo: finalLogoUrl,
          banner: finalBannerUrl,
          creator: address,
          network: network === "8453" ? "base" : "base-sepolia",
          mintPrice,
          maxSupply,
        }),
      });

      if (!registerRes.ok) {
        console.error("Database indexing failed, but contract is deployed!");
      }

      addLog("All tasks completed! Redirecting...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setDeployedAddress(contractAddress);
      setCurrentStep(STEPS.length); // Transition to success screen
    } catch (err) {
      console.error("Deployment failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred during contract deployment.");
    } finally {
      setDeploying(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      setErrorMsg("");
      await switchChainAsync({ chainId: targetChainId });
    } catch (err) {
      console.error("Switch network error:", err);
      setErrorMsg("Failed to switch network in wallet.");
    }
  };

  return (
    <div className="min-h-screen grid-bg py-12 relative">
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/2 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Confetti celebration on success */}
      {currentStep === STEPS.length && <ConfettiEffect />}

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        
        {/* Wizard Steps indicator */}
        {currentStep < STEPS.length && (
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      idx < currentStep 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                        : idx === currentStep 
                        ? "bg-primary border-primary text-white scale-105 shadow-md shadow-primary/15" 
                        : "bg-slate-50 border-slate-200/80 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-bold mt-2 ${idx === currentStep ? "text-slate-900" : "text-slate-400"}`}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-[1px] flex-1 mx-2 sm:mx-4 ${idx < currentStep ? "bg-emerald-200" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Deploy Form */}
        <AnimatePresence mode="wait">
          {/* STEP 1: BASICS */}
          {currentStep === 0 && (
            <motion.div
              key="basics"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <GlassCard className="space-y-6 bg-white border border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Collection Details</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Configure the core details of your smart contract.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Collection Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Based Monkeys" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Symbol</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MONK" 
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe your NFT collection..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input text-sm resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Target Network</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNetwork("8453")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                        network === "8453"
                          ? "bg-primary/5 border-primary text-primary shadow-sm shadow-primary/5"
                          : "bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className="font-extrabold text-sm">Base Mainnet</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">Real ETH transactions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetwork("84532")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                        network === "84532"
                          ? "bg-primary/5 border-primary text-primary shadow-sm shadow-primary/5"
                          : "bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className="font-extrabold text-sm">Base Sepolia</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">Testnet (Free faucet gas)</span>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>

              {/* Feature cards section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <GlassCard className="space-y-4 border-l-2 border-l-primary bg-white" animate delay={0.05}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">Instant Deployments</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    We programmatically deploy contract infrastructure using standard high-security ERC-721 custom collection smart contracts on Base.
                  </p>
                </GlassCard>

                <GlassCard className="space-y-4 border-l-2 border-l-accent bg-white" animate delay={0.1}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">Decentralized Metadata</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Your assets are securely uploaded and permanently pinned to IPFS, ensuring seamless compatibility with OpenSea, Coinbase NFT, and other marketplaces.
                  </p>
                </GlassCard>

                <GlassCard className="space-y-4 border-l-2 border-l-accent-purple bg-white" animate delay={0.15}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">Creator Dashboard</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    A premium suite of management tools. Adjust mint prices, toggle active claiming states, review collectors, and withdraw earnings.
                  </p>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MEDIA ASSETS */}
          {currentStep === 1 && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <GlassCard className="space-y-6 bg-white border border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Media Assets</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Upload artwork assets that will represent your collection.</p>
                </div>

                {/* Banner Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Collection Banner (Recommended: 1200x400)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-36 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                    {bannerPreview ? (
                      <>
                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">Click or drag banner here to upload</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBannerChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Collection Profile Image / Logo (Recommended: 400x400)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl w-32 h-32 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold">Upload Logo</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100/60 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 3: PRICING & ROYALTIES */}
          {currentStep === 2 && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <GlassCard className="space-y-6 bg-white border border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Minting & Royalty Config</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Establish your prices, supplies, and royalty fees.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Max Token Supply</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1000" 
                      value={maxSupply}
                      onChange={(e) => setMaxSupply(e.target.value)}
                      className="glass-input text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mint Price (ETH)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 0.005" 
                      value={mintPrice}
                      onChange={(e) => setMintPrice(e.target.value)}
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                {/* Royalty slider */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Creator Royalty Percentage</label>
                    <span className="text-primary font-bold text-sm">{royaltyPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={royaltyPercentage}
                    onChange={(e) => setRoyaltyPercentage(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>0% (No royalties)</span>
                    <span>10% (Maximum fee)</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100/60 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 4: DEPLOY & LAUNCH */}
          {currentStep === 3 && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <GlassCard className="space-y-6 bg-white border border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Deploy Collection</h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Review your deployment settings and launch to the Base chain.</p>
                </div>

                {/* Configuration Summary Card */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-100/60 space-y-4">
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white" />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-none mb-1">{name}</h3>
                      <span className="text-xs text-slate-400 font-mono font-bold">${symbol}</span>
                    </div>
                  </div>
                  <hr className="border-slate-200/60" />
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Network</span>
                      <span className="text-slate-800 mt-0.5">{network === "8453" ? "Base Mainnet" : "Base Sepolia Testnet"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Max Supply</span>
                      <span className="text-slate-800 mt-0.5">{maxSupply} Tokens</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Mint Price</span>
                      <span className="text-slate-800 mt-0.5">{parseFloat(mintPrice) === 0 ? "Free" : `${mintPrice} ETH`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Royalties</span>
                      <span className="text-slate-800 mt-0.5">{royaltyPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Deploy Progress Display */}
                {deploying && (
                  <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Executing Launch Flow...</span>
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="h-[120px] overflow-y-auto space-y-2 pr-2 custom-scrollbar font-mono text-[10px] sm:text-xs">
                      {deployLogs.map((log, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-2 ${
                            idx === activeLogIndex 
                              ? "text-primary font-bold animate-pulse" 
                              : idx < activeLogIndex 
                              ? "text-emerald-600 font-medium" 
                              : "text-slate-400"
                          }`}
                        >
                          <span className="font-bold">[{idx + 1}]</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {!isConnected ? (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleBack}
                      disabled={deploying}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100/60 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    
                    <div className="w-full sm:w-auto flex justify-center">
                      <ConnectButton />
                    </div>
                  </div>
                ) : wrongChain ? (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleBack}
                      disabled={deploying}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100/60 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    
                    <button
                      onClick={handleSwitchNetwork}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Switch Wallet Network</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={handleBack}
                      disabled={deploying}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100/60 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    
                    <button
                      onClick={handleLaunch}
                      disabled={deploying}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {deploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Launching...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          <span>Deploy Collection Now</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* SUCCESS SCREEN */}
          {currentStep === STEPS.length && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <GlassCard className="text-center p-8 space-y-6 border border-slate-100 bg-white shadow-xl">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Collection Deployed!</h2>
                  <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
                    Congratulations! Your ERC-721 custom NFT collection smart contract has been deployed on the Base network in under a minute.
                  </p>
                </div>

                <hr className="border-slate-100 max-w-sm mx-auto" />

                {/* Action buttons */}
                <div className="flex flex-col gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => router.push(`/collection/${deployedAddress}`)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 transition-all cursor-pointer"
                  >
                    <span>Go to Public Mint Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/${deployedAddress}`)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <span>Open Creator Dashboard</span>
                  </button>
                </div>

                {/* Viral features */}
                <div className="pt-4 max-w-md mx-auto">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Spread the Word</span>
                    <SocialShare
                      collectionName={name}
                      contractAddress={deployedAddress}
                      network={network === "8453" ? "base" : "base-sepolia"}
                      symbol={symbol}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
