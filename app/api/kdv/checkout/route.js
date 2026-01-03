import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { email, phone, tickets, ticketHolders } = await req.json();

    // KDV tickets are $25 CAD each + 5% GST = $26.25
    const unitAmount = 2625; // $26.25 in cents

    const line_items = [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Kamloops Dance Vibes Ticket",
            description: "KDV Event Admission (includes 5% GST)",
          },
          unit_amount: unitAmount,
        },
        quantity: tickets,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/kdv/success?email=${encodeURIComponent(
        email
      )}&phone=${encodeURIComponent(phone)}&tickets=${encodeURIComponent(
        tickets
      )}&ticketHolders=${encodeURIComponent(JSON.stringify(ticketHolders))}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kdv?cancelled=true`,
      customer_email: email,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

