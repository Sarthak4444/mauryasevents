import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Booking from "../../../models/Booking";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { firstName, lastName, email, phone, people, date, time, note } = await req.json();
    
    const connection = await mongoose.connect('mongodb+srv://SarthakMaurya:Sarthak_12345@cluster0.vxoif.mongodb.net/cluster0?retryWrites=true&w=majority');
    

    if (!connection) {
      return NextResponse.json(
        { error: "Failed to connect to the database." },
        { status: 500 }
      );
    } 

    if (!firstName || !lastName || !email || !phone || !date || !time || !people) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    

    const newBooking = new Booking({
      firstName,
      lastName,
      email,
      phone,
      people,
      date,
      time,
      note,
    });
    await newBooking.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Booking Confirmation",
      text: `
        Dear ${firstName} ${lastName},
        
        Your booking has been confirmed!
        - Name: ${firstName} ${lastName}
        - Email: ${email}
        - Number: ${phone}
        - People: ${people}
        - Date: ${date}
        - Time: ${time}
        - Notes: ${note || "None"}
  
        Thank you for your reservation!
  
        Best regards,
        Maurya's Private Dining
      `,
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        { error: "Booking saved, but email sending failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Booking saved and email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    if (!connection) {
      return NextResponse.json(
        { error: "Failed to connect to the database." },
        { status: 500 }
      );
    }
    const bookings = await Booking.find();
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
