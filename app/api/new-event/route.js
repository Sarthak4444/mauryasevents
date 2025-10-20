import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Booking from "../../../models/Booking";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, phone, tickets, ticketHolders } = await req.json();
    
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    

    if (!connection) {
      return NextResponse.json(
        { error: "Failed to connect to the database." },
        { status: 500 }
      );
    } 

    if (!email || !phone || !tickets || !ticketHolders || ticketHolders.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique ticket numbers
    const generateTicketNumber = async () => {
      let ticketNumber;
      let isUnique = false;
      
      while (!isUnique) {
        // Generate a 3-digit ticket number with leading zeros
        const randomNum = Math.floor(Math.random() * 1000);
        ticketNumber = randomNum.toString().padStart(3, '0');
        
        // Check if this ticket number already exists
        const existingTicket = await Booking.findOne({
          'ticketHolders.ticketNumber': ticketNumber
        });
        
        if (!existingTicket) {
          isUnique = true;
        }
      }
      
      return ticketNumber;
    };

    // Generate unique ticket numbers for all ticket holders
    const ticketHoldersWithNumbers = await Promise.all(
      ticketHolders.map(async (holder) => ({
        ...holder,
        ticketNumber: await generateTicketNumber()
      }))
    );

    const totalAmount = tickets * 25; // $25 per ticket

    const newBooking = new Booking({
      email,
      phone,
      ticketHolders: ticketHoldersWithNumbers,
      totalTickets: tickets,
      totalAmount: totalAmount,
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

    // Create ticket details HTML
    const ticketDetailsHTML = ticketHoldersWithNumbers.map((holder, index) => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="color: #d32f2f; margin: 0 0 10px 0;">Ticket #${index + 1}</h4>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${holder.firstName} ${holder.lastName}</p>
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${holder.ticketNumber}</p>
      </div>
    `).join('');

    // Mail options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Payment Confirmation - Maurya's Event Tickets",
      html: `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; line-height: 1.8;">
  <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${ticketHoldersWithNumbers[0].firstName}</strong>,</p>
  
  <p>
    Your payment at <strong>Maurya's</strong> has been confirmed! We look forward to welcoming you to our event.
  </p>
  
  <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 5px; display: inline-block; margin-bottom: 30px;">
    Booking Details
  </h3>

  <p style="margin-bottom: 20px;">
    <strong>&nbsp; &bull; Email:</strong> ${email} <br />
    <strong>&nbsp; &bull; Phone:</strong> ${phone} <br />
    <strong>&nbsp; &bull; Total Tickets:</strong> ${tickets} <br />
    <strong>&nbsp; &bull; Total Amount:</strong> $${totalAmount} CAD <br />
  </p>

  <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 5px; display: inline-block; margin-bottom: 20px;">
    Ticket Information
  </h3>

  ${ticketDetailsHTML}

  <p style="margin-bottom: 20px;">
    Please bring a valid ID and this confirmation email to the event. Each ticket holder must be present.
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
        { error: "Payment saved, but email sending failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Payment saved and email sent successfully!" },
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

