"use client";
import React from "react";
import Link from "next/link";
import Header from "../../../Components/Header";
import Footer from "../../../Components/Footer";

export default function KDVPaymentSuccessful() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful! 🎉</h1>
          
          <p className="text-purple-200 text-lg mb-6">
            Thank you for purchasing tickets to Kamloops Dance Vibes! 
            A confirmation email with your ticket details has been sent to your email address.
          </p>
          
          <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
            <p className="text-white text-sm">
              <strong>📧 Check your inbox</strong> for ticket numbers and event details.
              Don't forget to bring a valid ID to the event!
            </p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/kdv" 
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
            >
              Buy More Tickets
            </Link>
            <Link 
              href="/" 
              className="block w-full border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 font-bold py-3 px-6 rounded-full transition-all duration-300"
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

