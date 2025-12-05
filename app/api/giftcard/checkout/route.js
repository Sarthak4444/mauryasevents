import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { buyerName, buyerEmail, cards, isGift } = await req.json();

    // Validate required fields
    if (!buyerName || !buyerEmail || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate cards
    let totalAmount = 0;
    let totalCards = 0;
    
    for (const card of cards) {
      if (!card.recipientName || !card.recipientEmail || !card.amount) {
        return NextResponse.json(
          { error: "Each card must have recipient name, email, and amount" },
          { status: 400 }
        );
      }
      
      const amount = parseFloat(card.amount);
      
      // Validate amount range
      if (amount < 10 || amount > 500) {
        return NextResponse.json(
          { error: "Card amount must be between $10 and $500" },
          { status: 400 }
        );
      }
      
      totalAmount += amount;
      totalCards += 1;
    }

    // Maximum 50 cards per order
    if (totalCards > 50) {
      return NextResponse.json(
        { error: "Maximum 50 cards per order" },
        { status: 400 }
      );
    }

    // Calculate bonus cards
    let bonusAmount = 0;
    for (const card of cards) {
      const amount = parseFloat(card.amount);
      if (amount >= 100) {
        bonusAmount += 20;
      } else if (amount >= 50) {
        bonusAmount += 10;
      }
    }

    // Generate a unique order ID
    const orderId = `GC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order data to pass to success URL
    const orderData = {
      buyerName,
      buyerEmail,
      cards,
      isGift: isGift || false,
      bonusAmount,
      totalAmount,
      orderId
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Maurya's Gift Card",
              description: `${totalCards} Gift Card${totalCards > 1 ? 's' : ''} - Total: $${totalAmount.toFixed(2)} CAD${bonusAmount > 0 ? ` (Includes $${bonusAmount} Bonus!)` : ''}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/giftcard/success?orderData=${encodeURIComponent(JSON.stringify(orderData))}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/giftcard?cancelled=true`,
      customer_email: buyerEmail,
      metadata: {
        orderId,
        buyerEmail,
        totalCards: totalCards.toString(),
        bonusAmount: bonusAmount.toString()
      }
    });

    return NextResponse.json({ 
      sessionId: session.id,
      orderId,
      bonusAmount,
      totalAmount
    }, { status: 200 });
    
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

