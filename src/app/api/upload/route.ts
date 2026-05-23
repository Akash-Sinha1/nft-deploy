import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check if Pinata IPFS integration is configured
    const pinataJwt = process.env.PINATA_JWT;
    if (pinataJwt) {
      try {
        const pinataFormData = new FormData();
        const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
        pinataFormData.append("file", fileBlob, file.name);
        
        const pinataMetadata = JSON.stringify({
          name: file.name,
        });
        pinataFormData.append("pinataMetadata", pinataMetadata);
        
        const pinataOptions = JSON.stringify({
          cidVersion: 1,
        });
        pinataFormData.append("pinataOptions", pinataOptions);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pinataJwt}`,
          },
          body: pinataFormData,
        });

        if (res.ok) {
          const data = await res.json();
          const ipfsHash = data.IpfsHash;
          return NextResponse.json({
            ipfsUri: `ipfs://${ipfsHash}`,
            url: `https://ipfs.io/ipfs/${ipfsHash}`,
          });
        } else {
          console.error("Pinata upload failed with status:", res.status, await res.text());
        }
      } catch (ipfsErr) {
        console.error("IPFS Pinata upload error, falling back to local:", ipfsErr);
      }
    }

    // Local file upload fallback (robust & foolproof for local dev)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileExt = path.extname(file.name) || ".png";
    const uniqueName = `${crypto.randomUUID()}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;
    return NextResponse.json({
      ipfsUri: url, // Return local path as fallback for database and metadata
      url,
    });
  } catch (err) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
