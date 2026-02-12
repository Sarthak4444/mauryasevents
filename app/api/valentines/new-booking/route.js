import nodemailer from "nodemailer";
import mongoose from "mongoose";
import ValentinesBooking from "../../../../models/ValentinesBooking";
import { NextResponse } from "next/server";

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
    
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    if (!connection) {
      return NextResponse.json(
        { error: "Failed to connect to the database." },
        { status: 500 }
      );
    } 

    if (!name || !email || !phone || !numberOfGuests || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Double check availability before saving
    const existingBookings = await ValentinesBooking.countDocuments({
      date: date,
      timeSlot: timeSlot,
      paymentStatus: 'completed'
    });

    if (existingBookings >= 4) {
      return NextResponse.json(
        { error: "This time slot is no longer available." },
        { status: 400 }
      );
    }

    // Generate unique booking number
    const generateBookingNumber = async () => {
      let bookingNumber;
      let isUnique = false;
      
      while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 100000);
        bookingNumber = 'VAL-' + randomNum.toString().padStart(5, '0');
        
        const existingBooking = await ValentinesBooking.findOne({ bookingNumber });
        
        if (!existingBooking) {
          isUnique = true;
        }
      }
      
      return bookingNumber;
    };

    const bookingNumber = await generateBookingNumber();
    const totalAmount = numberOfGuests * 10;

    const newBooking = new ValentinesBooking({
      name,
      email,
      phone,
      numberOfGuests,
      date,
      timeSlot,
      dietaryRestrictions: dietaryRestrictions || [],
      notesAndAllergies: notesAndAllergies || '',
      totalAmount,
      bookingNumber,
      paymentStatus: 'completed'
    });
    await newBooking.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    // Format dietary restrictions for email
    const dietaryText = dietaryRestrictions && dietaryRestrictions.length > 0 
      ? dietaryRestrictions.map(d => d.charAt(0).toUpperCase() + d.slice(1).replace('-', ' ')).join(', ')
      : 'None specified';

    // Mail options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "💝 Valentine's Day Reservation Confirmed - Maurya's",
      html: `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; line-height: 1.8;">
  <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💝 Valentine's Day Reservation</h1>
    <p style="color: #fecaca; margin: 10px 0 0 0;">Your table is confirmed!</p>
  </div>
  
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
    
    <p>
      Thank you for choosing Maurya's for your Valentine's celebration! Your reservation has been confirmed.
    </p>
    
    <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 10px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #dc2626; margin: 0 0 15px 0; border-bottom: 2px solid #dc2626; padding-bottom: 10px; display: inline-block;">
        📋 Reservation Details
      </h3>
      <p style="margin: 8px 0;"><strong>Booking Number:</strong> ${bookingNumber}</p>
      <p style="margin: 8px 0;"><strong>Date:</strong> February ${date}, 2026</p>
      <p style="margin: 8px 0;"><strong>Time:</strong> ${timeSlot}</p>
      <p style="margin: 8px 0;"><strong>Number of Guests:</strong> ${numberOfGuests}</p>
      <p style="margin: 8px 0;"><strong>Reservation Fee Paid:</strong> $${totalAmount} CAD</p>
    </div>

    <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #16a34a; margin: 0 0 10px 0;">🎁 Your $15 Gift Card Awaits!</h3>
      <p style="margin: 0; color: #166534;">
        When you arrive at the restaurant, present this confirmation and your reservation fee will be returned as a <strong>$15 gift card</strong> to use towards your meal or future visits!
      </p>
    </div>

    ${dietaryRestrictions && dietaryRestrictions.length > 0 ? `
    <p style="margin: 15px 0;"><strong>Dietary Restrictions:</strong> ${dietaryText}</p>
    ` : ''}
    
    ${notesAndAllergies ? `
    <p style="margin: 15px 0;"><strong>Notes/Allergies:</strong> ${notesAndAllergies}</p>
    ` : ''}

    <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0;">
      <strong>⏰ Important Reminders:</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Please arrive within 15 minutes of your reservation time</li>
        <li>Bring this confirmation email or your booking number</li>
        <li>For cancellations, please contact us at least 24 hours in advance</li>
      </ul>
    </div>

    <p style="margin-bottom: 20px;">
      We can't wait to make your Valentine's celebration special! If you have any questions, don't hesitate to reach out.
    </p>

    <p style="margin-bottom: 30px;">With love,<br /><br /><strong>Maurya's Craft Bar & Kitchen</strong></p>

    <div style="border-top: 2px solid #dc2626; padding-top: 15px; margin-top: 30px; line-height: 1.6; font-size: 14px; color: #666;">
      <p><strong>Maurya's Craft Bar & Kitchen</strong></p>
      <p>📍 165 Victoria St, Kamloops, BC, Canada. V2C 1Z4</p>
      <p>📞 +1 250 377 4969</p>
      <p>📧 comments@mauryascuisine.com</p>
      <p style="margin: 15px 0;">
        <a href="https://www.mauryascuisine.com" style="color: #dc2626; text-decoration: none;">Visit our website</a> | 
        <a href="https://instagram.com/mauryas.rest.bar.banquet" style="color: #dc2626; text-decoration: none;">Instagram</a>
      </p>
    </div>
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
      { message: "Booking saved and email sent successfully!", bookingNumber },
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
    const bookings = await ValentinesBooking.find().sort({ createdAt: -1 });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

