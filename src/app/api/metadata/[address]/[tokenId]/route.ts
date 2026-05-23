import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dbPath = path.join(process.cwd(), "src/data/collections.json");

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ address: string; tokenId: string }> }
) {
  try {
    const { address, tokenId } = await props.params;
    
    let collections = [];
    try {
      const data = await fs.readFile(dbPath, "utf-8");
      collections = JSON.parse(data);
    } catch (e) {
      console.error("Error reading collections metadata database:", e);
    }

    const collection = collections.find(
      (c: { address: string }) => c.address.toLowerCase() === address.toLowerCase()
    );

    if (!collection) {
      return NextResponse.json(
        {
          name: `Token #${tokenId}`,
          description: "An NFT collection token.",
          image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80",
        }
      );
    }

    return NextResponse.json({
      name: `${collection.name} #${tokenId}`,
      description: collection.description || `An official NFT from the ${collection.name} collection.`,
      image: collection.logo,
      attributes: [],
    });
  } catch (err) {
    console.error("Metadata route error:", err);
    return NextResponse.json({ error: "Failed to generate metadata" }, { status: 500 });
  }
}
