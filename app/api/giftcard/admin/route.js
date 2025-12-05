import mongoose from "mongoose";
import GiftCard from "../../../../models/GiftCard";
import { NextResponse } from "next/server";

// Get all gift cards (admin only)
export async function GET(req) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get all gift cards, sorted by creation date (newest first)
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    
    // Group cards by orderId and include bonus cards with their parent
    const groupedCards = {};
    const bonusCards = [];
    
    cards.forEach(card => {
      if (card.isBonus && card.parentCardCode) {
        bonusCards.push(card);
      } else {
        if (!groupedCards[card.orderId]) {
          groupedCards[card.orderId] = {
            orderId: card.orderId,
            buyerName: card.buyerName,
            buyerEmail: card.buyerEmail,
            createdAt: card.createdAt,
            cards: []
          };
        }
        groupedCards[card.orderId].cards.push({
          _id: card._id,
          code: card.code,
          originalAmount: card.originalAmount,
          remainingAmount: card.remainingAmount,
          ownerName: card.ownerName,
          ownerEmail: card.ownerEmail,
          isGift: card.isGift,
          status: card.status,
          personalMessage: card.personalMessage,
          bonusCard: null
        });
      }
    });
    
    // Attach bonus cards to their parent cards
    bonusCards.forEach(bonus => {
      for (const orderId in groupedCards) {
        const cardIndex = groupedCards[orderId].cards.findIndex(
          c => c.code === bonus.parentCardCode
        );
        if (cardIndex !== -1) {
          groupedCards[orderId].cards[cardIndex].bonusCard = {
            _id: bonus._id,
            code: bonus.code,
            originalAmount: bonus.originalAmount,
            remainingAmount: bonus.remainingAmount,
            ownerName: bonus.ownerName,
            ownerEmail: bonus.ownerEmail,
            status: bonus.status
          };
          break;
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      orders: Object.values(groupedCards),
      totalCards: cards.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a gift card amount (admin only)
export async function PUT(req) {
  try {
    const { cardId, code, newAmount } = await req.json();
    
    // Validate required fields
    if (!cardId || !code || newAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (newAmount < 0) {
      return NextResponse.json(
        { error: "Amount cannot be negative" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the card
    const card = await GiftCard.findById(cardId);
    
    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }
    
    // Verify code matches
    if (card.code !== code.toUpperCase().trim()) {
      return NextResponse.json(
        { error: "Invalid card code" },
        { status: 400 }
      );
    }
    
    // Update the card
    card.remainingAmount = parseFloat(newAmount);
    
    // Update status based on amount
    if (newAmount === 0) {
      card.status = 'redeemed';
    } else if (card.status === 'redeemed') {
      card.status = 'active';
    }
    
    await card.save();
    
    return NextResponse.json({
      success: true,
      message: "Gift card updated successfully",
      card: {
        _id: card._id,
        code: card.code,
        originalAmount: card.originalAmount,
        remainingAmount: card.remainingAmount,
        status: card.status
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Admin PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

