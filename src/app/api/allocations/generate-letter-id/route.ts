import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate letter ID
export async function GET() {
  try {
    // Get count of existing allocation requests for the current year
    const year = new Date().getFullYear();
    const count = await prisma.allocationRequest.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });

    // Generate letter ID in format: DHQ/ACC/YYYY/XXXX
    const letterId = `DHQ/ACC/${year}/${String(count + 1).padStart(4, '0')}`;
    
    return NextResponse.json({ letterId });
  } catch (error) {
    console.error('Error generating letter ID:', error);
    
    // Fallback to a simpler format
    const fallbackId = `DHQ/ACC/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
    return NextResponse.json({ letterId: fallbackId });
  }
}