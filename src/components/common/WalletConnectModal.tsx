"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle2, AlertCircle, Laptop } from "lucide-react";
import { useConnect, useAccount } from "wagmi";
import { toast } from "sonner";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connectorId?: string;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connect, connectors, error: connectError } = useConnect();
  const { isConnected, address } = useAccount();
  
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => {
      window.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  // Auto close on successful connection
  useEffect(() => {
    if (isConnected && isOpen) {
      toast.success("Wallet connected successfully!", {
        description: `Connected to ${address?.slice(0, 6)}...${address?.slice(-4)}`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
      setConnecting(false);
      setActiveWallet(null);
      onClose();
    }
  }, [isConnected, address, isOpen, onClose]);

  // Handle connection errors
  useEffect(() => {
    if (connectError && activeWallet) {
      toast.error("Connection Failed", {
        description: connectError.message || "Failed to establish a secure connection.",
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
      setConnecting(false);
      setActiveWallet(null);
    }
  }, [connectError, activeWallet]);

  if (!mounted) return null;

  // Wallet SVG Icons
  const metamaskIcon = (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.56 12.3L26.4 5.23a1 1 0 00-.77-.58L17.2 3.12a2 2 0 00-2.4 1.34L12.3 12.3H2.86a1 1 0 00-.86 1.5l5.24 9.17a2 2 0 002 1.03h13.52a2 2 0 002-1.03l5.24-9.17a1 1 0 00-.86-1.5H29.56z" fill="#E2761B"/>
      <path d="M16 32l-5.32-9.3h10.64L16 32z" fill="#E2761B"/>
      <path d="M29.56 12.3l-3.16-7.07a1 1 0 00-.77-.58L16 3.12v9.18h13.56z" fill="#E1761B"/>
      <path d="M16 3.12L6.37 4.65a1 1 0 00-.77.58L2.44 12.3H16V3.12z" fill="#F6851B"/>
      <path d="M8.24 16.5H5.86l2.38 4.16L8.24 16.5z" fill="#D7C1B1"/>
      <path d="M23.76 16.5h2.38l-2.38 4.16V16.5z" fill="#D7C1B1"/>
      <path d="M16 12.3h-4.8l1.45 4.2h6.7L16 12.3z" fill="#161616"/>
      <path d="M23.76 16.5L16 23.7l-7.76-7.2H23.76z" fill="#D7C1B1"/>
      <path d="M16 23.7v8.3l7.76-15.5H16v7.2z" fill="#F6851B"/>
      <path d="M8.24 16.5L16 32v-8.3L8.24 16.5z" fill="#E2761B"/>
    </svg>
  );

  const coinbaseIcon = (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#0052FF"/>
      <rect x="8" y="8" width="16" height="16" rx="3.5" fill="white"/>
    </svg>
  );

  const walletconnectIcon = (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#3B99FC"/>
      <path d="M22.5 11.5c-3.6-3.6-9.4-3.6-13 0l-.8.8c-.3.3-.3.8 0 1.1l1.5 1.5c.2.2.5.2.7 0l.7-.7c2.4-2.4 6.2-2.4 8.6 0l.7.7c.2.2.5.2.7 0l1.5-1.5c.3-.3.3-.8 0-1.1l-.9-.8zm1.6 1.6l-.8.8c-.3.3-.3.8 0 1.1l1.5 1.5c.2.2.5.2.7 0l.8-.8c1.6-1.6 1.6-4.3 0-5.9l-.8-.8c-.3-.3-.8-.3-1.1 0l-1.5 1.5c-.2.2-.2.5 0 .7l.8.8c.8.8.8 2.1 0 2.9l-.4-.2zm-16.2 0l-.8-.8c-.8-.8-.8-2.1 0-2.9l.8-.8c.2-.2.2-.5 0-.7L6.4 7.2c-.3-.3-.8-.3-1.1 0l-.8.8c-1.6 1.6-1.6 4.3 0 5.9l.8.8c.2.2.5.2.7 0l1.5-1.5c.3-.3.3-.8 0-1.1z" fill="white"/>
    </svg>
  );

  const rabbyIcon = (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#8C65F7"/>
      <path d="M10 12c0-1.1.9-2 2-2h8a2 2 0 012 2v6a4 4 0 01-4 4h-4a4 4 0 01-4-4v-6z" fill="white"/>
      <circle cx="14" cy="14" r="1.5" fill="#8C65F7"/>
      <circle cx="18" cy="14" r="1.5" fill="#8C65F7"/>
    </svg>
  );

  const browserIcon = (
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
      <Laptop className="w-4 h-4" />
    </div>
  );

  const wallets: WalletItem[] = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect to your MetaMask browser extension or app.",
      icon: metamaskIcon,
      connectorId: "io.metamask",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      description: "Connect securely with Coinbase ecosystem assets.",
      icon: coinbaseIcon,
      connectorId: "coinbaseWalletSDK",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Scan a QR code from any mobile Web3 wallet.",
      icon: walletconnectIcon,
      connectorId: "walletConnect",
    },
    {
      id: "rabby",
      name: "Rabby Wallet",
      description: "Connect with the developer-first smart wallet.",
      icon: rabbyIcon,
      connectorId: "io.rabby",
    },
    {
      id: "injected",
      name: "Browser Wallet",
      description: "Use your default browser extension provider.",
      icon: browserIcon,
      connectorId: "injected",
    },
  ];

  // Trigger actual connection flow using Wagmi
  const handleWalletSelect = async (wallet: WalletItem) => {
    if (connecting) return;
    
    setActiveWallet(wallet.id);
    setConnecting(true);

    try {
      // Find the specific connector based on ID or fallback
      let connector = connectors.find(
        (c) => c.id === wallet.connectorId || c.name.toLowerCase().includes(wallet.id)
      );

      // Fallback to injected connector if not found
      if (!connector && wallet.id === "injected") {
        connector = connectors.find((c) => c.id === "injected");
      }

      if (connector) {
        await connect({ connector });
      } else {
        // Mock connection simulation if connector is not active on this environment
        setTimeout(() => {
          toast.info("Simulation Mode", {
            description: `${wallet.name} is not installed. Standard fallback connector triggered.`,
          });
          setConnecting(false);
          setActiveWallet(null);
        }, 1500);
      }
    } catch (err) {
      const error = err as Error;
      toast.error("Failed to connect", {
        description: error.message || "An unexpected error occurred during connection.",
      });
      setConnecting(false);
      setActiveWallet(null);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[6px]"
      />

      {/* Modal Wrapper */}
      <div 
        ref={modalRef}
        className="relative z-10 w-full max-w-[440px] px-4 md:px-0"
      >
        {/* Responsive Container (Centered Card on Desktop / Bottom Sheet on Mobile) */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: window.innerWidth < 768 ? 1 : 0.95,
            y: window.innerWidth < 768 ? "100%" : 0
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0 
          }}
          exit={{ 
            opacity: 0, 
            scale: window.innerWidth < 768 ? 1 : 0.95,
            y: window.innerWidth < 768 ? "100%" : 0
          }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          className="w-full bg-white md:rounded-[24px] rounded-t-[28px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col overflow-hidden max-h-[85vh] md:max-h-[90vh] fixed bottom-0 left-0 right-0 md:relative md:bottom-auto"
        >
          {/* Mobile indicator pill */}
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 md:hidden block shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 md:py-6 border-b border-slate-50 shrink-0">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connect Wallet</h2>
              <p className="text-[13px] text-slate-500 font-medium">
                Select a wallet to connect on <span className="text-primary font-semibold">Base</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-100/50 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Wallet List */}
          <div className="px-6 py-4 overflow-y-auto space-y-2.5 max-h-[60vh] md:max-h-[50vh] shrink">
            {wallets.map((wallet) => {
              const isCurrent = activeWallet === wallet.id;
              
              return (
                <button
                  key={wallet.id}
                  disabled={connecting}
                  onClick={() => handleWalletSelect(wallet)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer group ${
                    isCurrent
                      ? "border-primary bg-primary/[0.02]"
                      : connecting
                      ? "border-slate-100 opacity-50 cursor-not-allowed"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/75"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon container */}
                    <div className="shrink-0 flex items-center justify-center">
                      {wallet.icon}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 text-[15px] group-hover:text-primary transition-colors">
                        {wallet.name}
                      </span>
                      <span className="text-[12px] text-slate-400 leading-snug max-w-[240px]">
                        {wallet.description}
                      </span>
                    </div>
                  </div>

                  {/* Action/Spinner */}
                  <div className="shrink-0 pl-2">
                    {isCurrent ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Terms */}
          <div className="px-6 py-4 md:py-5 bg-slate-50/50 border-t border-slate-50 text-center shrink-0">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[320px] mx-auto">
              By connecting your wallet, you agree to our Terms of Service and acknowledge you understand dynamic NFT parameters.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
