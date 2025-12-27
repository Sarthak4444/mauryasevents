import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { email, phone, tickets, ticketHolders } = await req.json();

    const ticketCounts = ticketHolders.reduce((acc, holder) => {
      const type = holder.ticketType || 'general';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const line_items = [];

    if (ticketCounts.general) {
      line_items.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: "General Admission",
            description: "General Admission Ticket (includes 5% GST)",
          },
          unit_amount: 4725, // $45 + 5% GST
        },
        quantity: ticketCounts.general,
      });
    }

    if (ticketCounts.student) {
      line_items.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: "Student Admission",
            description: "Student Admission Ticket (includes 5% GST). Must present valid Student ID.",
          },
          unit_amount: 3675, // $35 + 5% GST
        },
        quantity: ticketCounts.student,
      });
    }

    if (ticketCounts.kids) {
      line_items.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: "Kids Admission",
            description: "Kids Admission Ticket (includes 5% GST)",
          },
          unit_amount: 2625, // $25 + 5% GST
        },
        quantity: ticketCounts.kids,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
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
