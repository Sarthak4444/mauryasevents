"use client";
import React from "react";
import Link from "next/link";
import Header from "../../../Components/Header";
import Footer from "../../../Components/Footer";

export default function KDVPaymentSuccessful() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="max-w-lg w-full border-2 border-[#d88728] rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-[#d88728] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          
          <p className="text-gray-600 text-lg mb-6">
            Thank you for purchasing tickets to Kamloops Dance Vibes! 
            A confirmation email with your ticket details has been sent to your email address.
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm">
              <strong>Check your inbox</strong> for ticket numbers and event details.
              Don't forget to bring a valid ID to the event!
            </p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/kdv" 
              className="block w-full bg-[#d88728] hover:bg-[#c07a24] text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Buy More Tickets
            </Link>
            <Link 
              href="/" 
              className="block w-full border-2 border-[#d88728] text-[#d88728] hover:bg-[#d88728] hover:text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
