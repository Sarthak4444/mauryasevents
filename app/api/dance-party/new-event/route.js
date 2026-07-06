import nodemailer from "nodemailer";
import mongoose from "mongoose";
import DancePartyBooking from "../../../../models/DancePartyBooking";
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

    const generateTicketNumber = async () => {
      let ticketNumber;
      let isUnique = false;

      while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 10000);
        ticketNumber = 'DP-' + randomNum.toString().padStart(4, '0');

        const existingTicket = await DancePartyBooking.findOne({
          'ticketHolders.ticketNumber': ticketNumber
        });

        if (!existingTicket) {
          isUnique = true;
        }
      }

      return ticketNumber;
    };

    const ticketHoldersWithNumbers = await Promise.all(
      ticketHolders.map(async (holder) => ({
        ...holder,
        ticketNumber: await generateTicketNumber()
      }))
    );

    // $45 + 5% GST = $47.25 per ticket
    const totalAmount = tickets * 47.25;

    const newBooking = new DancePartyBooking({
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

    const ticketDetailsHTML = ticketHoldersWithNumbers.map((holder, index) => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="color: #d32f2f; margin: 0 0 10px 0;">Ticket #${index + 1}</h4>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${holder.firstName} ${holder.lastName}</p>
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${holder.ticketNumber}</p>
      </div>
    `).join('');

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Payment Confirmation - Maurya's Event Tickets",
      html: `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; line-height: 1.8;">
  <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${ticketHoldersWithNumbers[0].firstName}</strong>,</p>

  <p>
    Your payment has been confirmed! We look forward to seeing you at our event on <strong>Saturday, July 18th from 5:00 PM to 10:00 PM</strong>.
  </p>

  <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 5px; display: inline-block; margin-bottom: 30px;">
    Booking Details
  </h3>

  <p style="margin-bottom: 20px;">
    <strong>&nbsp; &bull; Email:</strong> ${email} <br />
    <strong>&nbsp; &bull; Phone:</strong> ${phone} <br />
    <strong>&nbsp; &bull; Total Tickets:</strong> ${tickets} <br />
    <strong>&nbsp; &bull; Total Amount:</strong> $${totalAmount.toFixed(2)} CAD <br />
    <strong>&nbsp; &bull; Event Date:</strong> Saturday, July 18th, 5:00 PM – 10:00 PM <br />
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
    const bookings = await DancePartyBooking.find();
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
