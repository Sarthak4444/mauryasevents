import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { firstName, lastName, email, phone, people, date, time, note } =
      await req.json();

    if (note === "") note = "None";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Reservation Fee",
            },
            unit_amount: 1000,
          },
          quantity: people,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/success?firstName=${encodeURIComponent(
        firstName
      )}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(
        email
      )}&phone=${encodeURIComponent(phone)}&people=${encodeURIComponent(
        people
      )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
        time
      )}&note=${encodeURIComponent(note)}`,

      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      customer_email: email,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
