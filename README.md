# 🔵 Base NFT Collection Deployer (Launchpad)

An ultra-premium, production-ready, no-code NFT launcher optimized for **Base Mainnet** and **Base Sepolia Testnet**. Creators can deploy secure ERC-721 Drop contracts, upload logo/banner artwork permanently to IPFS, set claim phases (mint prices & supply caps), claim their 1st token, and establish an automated public minting page—**all in under 30 seconds**.

---

## 🚀 Key Features

1. **Wallet Integration**
   - Seamless one-click connection using **thirdweb v5 ConnectButton**.
   - Immediate support for **Coinbase Wallet**, **MetaMask**, and **WalletConnect**.
   - Real-time active chain identification and network switcher triggers.

2. **No-Code ERC-721 Deployment**
   - High-performance step-by-step deployer utilizing thirdweb's audited **DropERC721** prebuilt smart contracts.
   - Fully optimized creator settings: Custom Names, Symbols, Descriptions, Max Supply, Mint Prices, and Royalty splits (0% to 10% sliders).

3. **Decentralized Storage (IPFS)**
   - Smooth client-side uploads of logos and banners directly to IPFS, ensuring maximum compatibility with OpenSea, Blur, and standard NFT aggregators.

4. **Public Minting Page Generator**
   - Automated creation of public-facing mint endpoints for each collection: `/collection/[contract-address]`.
   - Beautiful mint cards with live supply progress indicators, quantity modifiers, fee breakdowns, and block explorer shortcuts.

5. **Creator Management Dashboard**
   - Absolute control over the smart contract phases: Update pricing, pause/resume public claim conditions, transfer ownership, and withdraw contract proceeds.

6. **Optimized for Virality & Sharing**
   - Auto-generated Twitter/X templates, copy-to-clipboard minting links, and celebratory canvas-confetti explosions on successfully launched deploys.

7. **Sleek High-End UI/UX**
   - Dark-mode first premium glassmorphism layouts built using **Tailwind CSS v4** and animated via **Framer Motion**.
   - Fully responsive on mobile, tablet, and widescreen layouts.

8. **Launchpad Simulator Mode**
   - An elegant sandbox switch that simulates blockchain uploads, contract deploys, and claims, allowing local review and testing without any active wallet funds.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15.5.18 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4, shadcn/ui principles
- **Animations:** Framer Motion
- **Web3 SDK:** thirdweb SDK v5
- **EVM Libraries:** wagmi, viem, TanStack React Query
- **Alerts:** sonner (Toast notifications)
- **Effects:** canvas-confetti

---

## 📁 Repository Structure

```
├── public/                 # Static assets (Favicons, images)
├── src/
│   ├── app/                # Next.js 15 Pages & Layouts
│   │   ├── api/            # API endpoints
│   │   │   └── collections # GET/POST active collection logs
│   │   ├── collection/     # Dynamic Public Mint Page routes
│   │   ├── dashboard/      # Dynamic Creator Dashboard routes
│   │   ├── deploy/         # Multi-step deployer wizard
│   │   ├── explorer/       # Collections explorer grid
│   │   ├── globals.css     # Global styles & Tailwind v4 Theme
│   │   ├── layout.tsx      # Root providers wrapper
│   │   └── page.tsx        # Viral Landing Page
│   ├── components/         # Reusable layouts & visual elements
│   │   ├── common/         # GlassCard, ConfettiEffect, SocialShare
│   │   ├── layout/         # Glassmorphic Navbar & Footer
│   │   └── providers/      # Thirdweb Provider configuration
│   ├── data/               # Seed database (JSON)
│   ├── lib/                # Config files (thirdweb client, utils)
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

### 2. Clone and Install Dependencies
Navigate to the root workspace directory and run:
```bash
npm install
```

### 3. Supply Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Provide your **Thirdweb Client ID** in `.env.local`:
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
```
*(Get a free Client ID instantly on the [thirdweb Dashboard](https://thirdweb.com/create-api-key)).*

### 4. Run Development Server
Boot up the local dev server using Next's Turbopack engine:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🚀 Production Build & Deployment

### 1. Build Verification
Before deploying to production, compile the build locally to ensure complete type safety and zero errors:
```bash
npm run build
```

### 2. Deploying to Vercel
This project is fully ready for zero-config deployment on Vercel:
1. Push the code to a Git repository (GitHub, GitLab, Bitbucket).
2. Connect the repository in the Vercel Dashboard.
3. Configure the Environment Variables:
   - Add `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` to Vercel's Environment Variables.
4. Click **Deploy**. Vercel will build and serve the App Router serverless functions automatically.
