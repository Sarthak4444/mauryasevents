"use client";
import React from "react";
import Link from "next/link";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

export default function PaymentSuccessful() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center items-center p-6 bg-gray-50">
        <div className="max-w-lg w-full bg-white border-2 border-green-200 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-green-700">Reservation Confirmed! 💝</h1>
          
          <p className="text-gray-600 text-lg mb-6">
            Thank you for reserving your Valentine's Day table at Maurya's! 
            A confirmation email with your booking details has been sent to your email address.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-green-800 mb-2">🎁 Don't Forget!</h3>
            <p className="text-green-700 text-sm">
              When you arrive at the restaurant, your $10/person reservation fee will be returned as a 
              <strong> $15 gift card</strong>! Just present your confirmation email.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-yellow-800 mb-2">⏰ Remember</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Please arrive within 15 minutes of your reservation time</li>
              <li>• Bring your confirmation email or booking number</li>
              <li>• Contact us 24 hours in advance for any changes</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/" 
              className="block w-full bg-[#d88728] hover:bg-[#c07a24] text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Questions? Contact us at<br />
              📞 +1 250 377 4969<br />
              📧 comments@mauryascuisine.com
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
