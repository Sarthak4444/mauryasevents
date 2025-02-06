import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Booking from "../../../models/Booking";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { firstName, lastName, email, phone, people, date, time, note } = await req.json();
    
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    

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
      subject: "Booking Confirmation - Maurya's",
      html: `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; line-height: 1.8;">
  <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${firstName}</strong>,</p>
  
  <p>
    Your booking at <strong>Maurya's</strong> has been confirmed! We look forward to welcoming you.
  </p>
  
  <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 5px; display: inline-block; margin-bottom: 30px;">
    Reservation Details
  </h3>

  <p style="margin-bottom: 20px;">
    <strong>&nbsp; &bull; Name:</strong> ${firstName} ${lastName} <br />
    <strong>&nbsp; &bull; People:</strong> ${people} <br />
    <strong>&nbsp; &bull; Date:</strong> ${date} <br />
    <strong>&nbsp; &bull; Time:</strong> ${time}
  </p>

  <p style="margin-bottom: 20px;">
    Thank you for choosing us! If you have any questions or need assistance, feel free to reach out.
  </p>

  <p style="margin-bottom: 30px;">Best Regards,<br /><br />Maurya's Craft Bar & Kitchen</p>

  <div style="border-top: 2px solid #d32f2f; padding-top: 15px; margin-top: 30px; line-height: 1;">
    <p><strong>Maurya's Craft Bar & Kitchen</strong></p>
    <p>📍 165 Victoria St, Kamloops, BC, Canada. V2C 1Z4</p>
    <p>📞 +1 250 377 4969</p>
    <p>📧 comments@mauryascuisine.com</p>
    <p style="margin: 15px 0;">
      <a href="https://www.mauryascuisine.com" style="color: #d32f2f; text-decoration: none;">Visit our website</a> | 
      <a href="https://instagram.com/mauryas.rest.bar.banquet" style="color: #d32f2f; text-decoration: none;">Instagram</a>
    </p>
  </div>
</div>

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
