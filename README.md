# 🔵 Base NFT Collection Deployer (Launchpad)

An ultra-premium, production-ready, no-code NFT launcher optimized for **Base Mainnet** and **Base Sepolia Testnet**. Creators can deploy secure, custom ERC-721 smart contracts, upload logo/banner artwork permanently to IPFS, set claim phases (mint prices & supply caps), and establish an automated public minting page—**all in under 30 seconds**.

---

## ⚡ Key Features

1. **Secure Wallet Integration**
   - Seamless connection using **Wagmi + RainbowKit**.
   - Immediate support for **Coinbase Wallet**, **MetaMask**, and **WalletConnect**.
   - Social/email logins are completely purged to maintain Web3 authenticity.

2. **Custom ERC-721 Smart Contracts**
   - Streamlined deployment using custom, high-security solidity contracts (`src/data/BaseNFTCollection.sol`).
   - Fully optimized creator settings: Custom Names, Symbols, Max Supply, Mint Prices, and Owner address management.

3. **Decentralized Storage (IPFS)**
   - Upload logo and banner artwork permanently to IPFS (via Pinata API), ensuring seamless compatibility with OpenSea, Coinbase NFT, and all standard marketplaces.

4. **Public Minting Page Generator**
   - Automated creation of public-facing mint endpoints for each collection: `/collection/[contract-address]`.
   - Beautiful mint cards with live supply progress indicators, quantity selectors, fee breakdowns, and block explorer shortcuts.

5. **Creator Management Dashboard**
   - Absolute control over the smart contract phases: Update pricing, toggle public claiming states, review collectors, and withdraw contract proceeds directly to your wallet.

6. **Optimized SPA Routing & Prefetching**
   - Zero hydration lag and <200ms perceived page transition delays.
   - Programmatic prefetching on Navbar hovers preloads pages instantly.
   - Dynamic lazy-loading boundaries with shimmering skeleton loading fallbacks.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Premium vanilla CSS styling with sleek glassmorphism shadows and subtle light-themed gradients.
- **EVM Libraries:** Wagmi v2, Viem v2, RainbowKit, TanStack React Query, and Alchemy RPC.
- **Smart Contracts:** Solidity (`src/data/BaseNFTCollection.sol`).
- **Effects:** canvas-confetti, dynamic state micro-animations.

---

## 📁 Repository Structure

```
├── public/                 # Static assets (Favicons, vector graphics)
├── src/
│   ├── app/                # Next.js 15 Pages & Layouts (App Router)
│   │   ├── api/            # API endpoints
│   │   │   ├── collections # Log dynamically deployed collections
│   │   │   ├── metadata    # IPFS metadata fetchers
│   │   │   └── upload      # Secure IPFS upload handlers
│   │   ├── collection/     # Dynamic Public Mint Page routes
│   │   ├── dashboard/      # Dynamic Creator Dashboard routes
│   │   ├── deploy/         # Multi-step deployer wizard
│   │   ├── explorer/       # Streamlined Collections explorer grid
│   │   ├── globals.css     # Global styles & Light Theme SaaS variables
│   │   ├── layout.tsx      # Root providers wrapper
│   │   └── page.tsx        # Streamlined Landing Page
│   ├── components/         # Reusable layouts & visual elements
│   │   ├── common/         # GlassCard, ConfettiEffect, SkeletonShimmer, SocialShare
│   │   ├── layout/         # Glassmorphic Navbar & Footer
│   │   └── providers/      # Web3Provider setup (Wagmi, RainbowKit)
│   ├── data/               # Solidity source, compilation scripts, and active contracts DB
│   ├── lib/                # Config files (Wagmi config, contract utilities)
│   └── hooks/              # Custom helper hooks
├── .env.example            # Environment variables template
├── tsconfig.json           # TypeScript configuration
└── package.json            # Scripts & dependencies
```

---

## ⚙️ Local Development Setup

Follow these steps to run the Base NFT Deployer locally:

### 1. Prerequisites
- **Node.js** version 18.0.0 or higher.
- **npm** (default package manager).

### 2. Install Dependencies
```bash
npm install
```

### 3. Supply Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
PINATA_JWT=your_pinata_jwt_token
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🚀 Production Build & Verification

### 1. Build Verification
To compile the build locally and ensure complete type safety with zero compilation errors:
```bash
npm run build
```

### 2. Deploying to Vercel
This project is fully ready for zero-config deployment on Vercel:
1. Push the code to your GitHub repository.
2. Connect the repository in the Vercel Dashboard.
3. Configure the Environment Variables (`NEXT_PUBLIC_ALCHEMY_API_KEY`, `PINATA_JWT`).
4. Click **Deploy**. Vercel will build and serve the App Router serverless functions automatically.
