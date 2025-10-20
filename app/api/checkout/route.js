import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { email, phone, tickets, ticketHolders } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Event Tickets",
            },
            unit_amount: 2500, // $25.00 CAD in cents
          },
          quantity: tickets,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/success?email=${encodeURIComponent(
        email
      )}&phone=${encodeURIComponent(phone)}&tickets=${encodeURIComponent(
        tickets
      )}&ticketHolders=${encodeURIComponent(JSON.stringify(ticketHolders))}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      customer_email: email,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
