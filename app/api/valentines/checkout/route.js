import Stripe from "stripe";
import mongoose from "mongoose";
import ValentinesBooking from "../../../../models/ValentinesBooking";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { 
      name, 
      email, 
      phone, 
      numberOfGuests, 
      date, 
      timeSlot, 
      dietaryRestrictions, 
      notesAndAllergies 
    } = await req.json();

    // Connect to database to check availability
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if the slot is still available (max 4 bookings per slot)
    const existingBookings = await ValentinesBooking.countDocuments({
      date: date,
      timeSlot: timeSlot,
      paymentStatus: 'completed'
    });

    if (existingBookings >= 4) {
      return NextResponse.json(
        { error: "Sorry, this time slot is no longer available. Please select another time." },
        { status: 400 }
      );
    }

    // $10 per person, no tax
    const totalAmount = numberOfGuests * 10;
    const unitAmount = 1000; // $10 in cents

    const line_items = [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Valentine's Day Table Reservation",
            description: `Reservation for ${numberOfGuests} guest(s) on Feb ${date} at ${timeSlot}`,
          },
          unit_amount: unitAmount,
        },
        quantity: numberOfGuests,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&numberOfGuests=${encodeURIComponent(numberOfGuests)}&date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(timeSlot)}&dietaryRestrictions=${encodeURIComponent(JSON.stringify(dietaryRestrictions))}&notesAndAllergies=${encodeURIComponent(notesAndAllergies)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}?cancelled=true`,
      customer_email: email,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

