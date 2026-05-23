import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to our JSON database file
const dbPath = path.join(process.cwd(), "src/data/collections.json");

// Helper function to read the database
async function readDb() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading collection database, using empty fallback:", error);
    return [];
  }
}

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
  createdAt: string;
  volumeEth: string;
  trendingScore: number;
  isSeeded: boolean;
}

// In-memory fallback for environments with read-only file systems (like Vercel serverless functions)
let inMemoryFallback: CollectionData[] = [];
let isInitialized = false;

async function getCollections() {
  if (!isInitialized) {
    const seeded = await readDb();
    inMemoryFallback = seeded;
    isInitialized = true;
  }
  return inMemoryFallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() || "";
    const network = searchParams.get("network") || "";
    const creator = searchParams.get("creator")?.toLowerCase() || "";
    const address = searchParams.get("address")?.toLowerCase() || "";

    let collections = await getCollections();

    // Filter by query (name or symbol)
    if (query) {
      collections = collections.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.symbol.toLowerCase().includes(query)
      );
    }

    // Filter by network
    if (network) {
      collections = collections.filter((c) => c.network === network);
    }

    // Filter by creator wallet
    if (creator) {
      collections = collections.filter((c) => c.creator.toLowerCase() === creator);
    }

    // Filter by exact address
    if (address) {
      collections = collections.filter((c) => c.address.toLowerCase() === address);
    }

    // Sort by trendingScore (descending) first, then by createdAt (descending)
    const sorted = [...collections].sort((a, b) => {
      if ((b.trendingScore || 0) !== (a.trendingScore || 0)) {
        return (b.trendingScore || 0) - (a.trendingScore || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("API GET Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch collections", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      address,
      name,
      symbol,
      description,
      logo,
      banner,
      creator,
      network,
      mintPrice,
      maxSupply,
    } = body;

    // Validate inputs
    if (!address || !name || !symbol || !creator || !network) {
      return NextResponse.json(
        { error: "Missing required fields (address, name, symbol, creator, network)" },
        { status: 400 }
      );
    }

    const newCollection = {
      address,
      name,
      symbol,
      description: description || "No description provided.",
      logo: logo || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80",
      banner: banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      creator,
      network,
      mintPrice: mintPrice || "0",
      maxSupply: maxSupply ? parseInt(maxSupply) : 1000,
      mintedCount: 1, // Auto-mints 1st token
      createdAt: new Date().toISOString(),
      volumeEth: "0",
      trendingScore: 50, // Freshly launched starting score
      isSeeded: false,
    };

    // Update in-memory cache
    const collections = await getCollections();
    
    // Check if duplicate address
    const duplicateIndex = collections.findIndex(
      (c) => c.address.toLowerCase() === address.toLowerCase()
    );

    if (duplicateIndex !== -1) {
      collections[duplicateIndex] = {
        ...collections[duplicateIndex],
        ...newCollection,
        // Preserve mintedCount if already exists
        mintedCount: collections[duplicateIndex].mintedCount,
      };
    } else {
      collections.unshift(newCollection);
    }

    inMemoryFallback = collections;

    // Attempt to persist to filesystem (will work locally, might fail on read-only environments)
    try {
      await fs.writeFile(dbPath, JSON.stringify(collections, null, 2), "utf-8");
      console.log(`Successfully persisted new collection ${name} to ${dbPath}`);
    } catch (fsError) {
      console.warn("Failed to write to file system (expected on Vercel deployment). Persisted in memory only:", fsError);
    }

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error("API POST Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to save collection", details: errorMessage },
      { status: 500 }
    );
  }
}
