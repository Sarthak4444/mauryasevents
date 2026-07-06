import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { email, phone, tickets, ticketHolders } = await req.json();

    // General admission: $45 CAD + 5% GST = $47.25
    const unitAmount = 4725;

    const line_items = [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "General Admission",
            description: "Colombian Independence Night entry (includes 5% GST)",
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
      }/dance-party/success?email=${encodeURIComponent(
        email
      )}&phone=${encodeURIComponent(phone)}&tickets=${encodeURIComponent(
        tickets
      )}&ticketHolders=${encodeURIComponent(JSON.stringify(ticketHolders))}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?cancelled=true`,
      customer_email: email,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
