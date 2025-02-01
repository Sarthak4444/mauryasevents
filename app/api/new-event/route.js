import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Booking from "../../../models/Booking";



export async function POST(req) {
    try {
        await dbConnect();
        const { firstName, lastName, email, phone, people, date, time, note } = await req.json();

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

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}