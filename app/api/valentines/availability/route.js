import mongoose from "mongoose";
import ValentinesBooking from "../../../../models/ValentinesBooking";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // Get all bookings for the specified date
    const bookings = await ValentinesBooking.find({ 
      date: date,
      paymentStatus: 'completed'
    });

    // Count bookings per time slot
    const slots = {};
    bookings.forEach((booking) => {
      if (slots[booking.timeSlot]) {
        slots[booking.timeSlot]++;
      } else {
        slots[booking.timeSlot] = 1;
      }
    });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

