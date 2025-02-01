// import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import Booking from "../../../models/Booking";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const { bookingInfo } = await req.json();
    const { firstName, lastName, email, phone, people, date, time, note } = bookingInfo;

    console.log(firstName, lastName, email, phone, people, date, time, note);
    
    await mongoose.connect(process.env.MONGODB_URI);

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

    // // Set up the email transporter
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.GMAIL_APP_PASSWORD,
    //   },
    // });

    // // Mail options
    // const mailOptions = {
    //   from: process.env.GMAIL_USER,
    //   to: email,
    //   subject: "Booking Confirmation",
    //   text: `
    //     Dear ${firstName} ${lastName},
        
    //     Your booking has been confirmed!
    //     - Name: ${firstName} ${lastName}
    //     - Email: ${email}
    //     - Number: ${phone}
    //     - People: ${people}
    //     - Date: ${date}
    //     - Time: ${time}
    //     - Notes: ${note || "None"}
  
    //     Thank you for your reservation!
  
    //     Best regards,
    //     Maurya's Private Dining
    //   `,
    // };

    // // Send email
    // try {
    //   await transporter.sendMail(mailOptions);
    // } catch (emailError) {
    //   console.error("Email sending failed:", emailError);
    //   return NextResponse.json(
    //     { error: "Booking saved, but email sending failed." },
    //     { status: 500 }
    //   );
    // }

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
