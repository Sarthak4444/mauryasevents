import mongoose from "mongoose";
import GiftCard from "../../../../models/GiftCard";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { code, email } = await req.json();
    
    // Validate required fields
    if (!code || !email) {
      return NextResponse.json(
        { error: "Please provide both card code and email" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the card
    const card = await GiftCard.findOne({ 
      code: code.toUpperCase().trim(),
      ownerEmail: email.toLowerCase().trim()
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found. Please check the code and email address." },
        { status: 404 }
      );
    }
    
    // Return card details
    return NextResponse.json({
      success: true,
      card: {
        code: card.code,
        originalAmount: card.originalAmount,
        remainingAmount: card.remainingAmount,
        ownerName: card.ownerName,
        status: card.status,
        isBonus: card.isBonus,
        createdAt: card.createdAt
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Check balance error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

