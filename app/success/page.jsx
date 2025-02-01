"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    if (!searchParams) return; // Prevent running on first render

    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const people = searchParams.get("people");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const note = searchParams.get("note");

    // Ensure values exist before proceeding
    if (!firstName || !lastName || !email || !phone || !people || !date || !time) return;

    const bookingInfo = { firstName, lastName, email, phone, people, date, time, note };
    setBookingData(bookingInfo);
    
    console.log(bookingInfo); // Now this will correctly log values

    const sendRequest = async () => {
      try {
        const response = await fetch("/api/new-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingInfo),
        });

        if (!response.ok) throw new Error("Failed to send data");
        console.log(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    sendRequest();
  }, [searchParams]); // Runs when searchParams update

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white text-black">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
        <p className="mt-4 text-gray-300">
          Thank you for your payment. Your reservation has been placed successfully. Please check your email for more information. We will be waiting for you!
        </p>
        <button
          onClick={() => window.location.href = "/"}
          disabled={loading}
          className={`mt-6 inline-block px-6 py-2 rounded-xl font-medium transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-black"
          }`}
        >
          {loading ? "Loading..." : "Go Back Home"}
        </button>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
