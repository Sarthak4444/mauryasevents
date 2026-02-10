import mongoose from "mongoose";
import ValentinesBooking from "../../../../models/ValentinesBooking";
import { NextResponse } from "next/server";

// Manually disabled slots (mark as fully booked)
// Format: { "date": ["time slot", "time slot"] }
const manuallyDisabledSlots = {
  // "14th": ["6:00 PM"],
  // Add more as needed:
  // "13th": ["7:00 PM", "8:00 PM"],
  // "15th": ["5:30 PM"],
};

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

    // Apply manually disabled slots (set to 5 which is max capacity)
    if (manuallyDisabledSlots[date]) {
      manuallyDisabledSlots[date].forEach((slot) => {
        slots[slot] = 5; // 5 = fully booked
      });
    }

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

