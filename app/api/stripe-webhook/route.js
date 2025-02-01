import nodemailer from 'nodemailer';
import Stripe from "stripe";
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Booking from "../../../models/Booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const sig = req.headers["stripe-signature"];
    const body = await req.text();

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const { firstName, lastName, email, phone, people, date, time, note } = session.metadata;

        await dbConnect();

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
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,  
            pass: process.env.GMAIL_APP_PASSWORD,  
          },
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: 'Booking Confirmation',
          text: `
            Dear ${firstName} ${lastName},
            
            Your booking has been confirmed!
            - Name: ${firstName} ${lastName}
            - Email: ${email}
            - Number: ${phone}
            - People: ${people}
            - Date: ${date}
            - Time: ${time}
            - Notes: ${note}

            Thank you for your reservation!

            Best regards,
            Maurya's Private Dining
          `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Booking saved and email sent successfully!" }, { status: 200 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
