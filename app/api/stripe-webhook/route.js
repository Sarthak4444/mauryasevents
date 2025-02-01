import nodemailer from "nodemailer";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Booking from "../../../models/Booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    },
  });
}

export async function POST(req) {
  try {
    console.log("🔹 Webhook received");

    // Set CORS headers
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*", // Allow all origins
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    });

    const sig = req.headers["stripe-signature"];
    const body = await req.text();

    console.log("🔹 Raw request body:", body);
    console.log("🔹 Stripe signature:", sig);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("🔹 Stripe event constructed successfully:", event.type);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new NextResponse(
        JSON.stringify({ error: "Webhook signature verification failed." }),
        { status: 400, headers }
      );
    }

    if (event.type === "checkout.session.completed") {
      console.log("🔹 Checkout session completed event detected.");

      const session = event.data.object;
      console.log("🔹 Session object:", session);

      if (session.payment_status === "paid") {
        console.log("✅ Payment is successful!");

        const { firstName, lastName, email, phone, people, date, time, note } =
          session.metadata || {};

        if (!firstName || !lastName || !email) {
          console.error("❌ Missing metadata in session!");
          return new NextResponse(
            JSON.stringify({ error: "Metadata is missing." }),
            { status: 400, headers }
          );
        }

        console.log("🔹 Metadata extracted successfully:", {
          firstName,
          lastName,
          email,
          phone,
          people,
          date,
          time,
          note,
        });

        await dbConnect();
        console.log("🔹 Connected to database.");

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
        console.log("✅ Booking saved in the database.");

        // Send confirmation email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

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
            - Notes: ${note}

            Thank you for your reservation!

            Best regards,
            Maurya's Private Dining
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log("✅ Email sent successfully.");
        } catch (emailError) {
          console.error("❌ Error sending email:", emailError.message);
        }

        return new NextResponse(
          JSON.stringify({ message: "Booking saved and email sent successfully!" }),
          { status: 200, headers }
        );
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
}
