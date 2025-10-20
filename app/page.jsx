"use client";
import { useRouter } from "next/navigation";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function Home() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState("");
  const [ticketHolders, setTicketHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
      
  const router = useRouter();

  const formatPhoneNumber = (value) => {
    let numbers = value.replace(/\D/g, "");

    if (numbers.length > 10) {
      numbers = numbers.slice(0, 10);
    }

    let formatted = numbers;
    if (numbers.length > 6) {
      formatted = `(${numbers.slice(0, 3)})-${numbers.slice(
        3,
        6
      )}-${numbers.slice(6)}`;
    } else if (numbers.length > 3) {
      formatted = `(${numbers.slice(0, 3)})-${numbers.slice(3)}`;
    } else if (numbers.length > 0) {
      formatted = `(${numbers}`;
    }

    return formatted;
  };

  const handleChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);
  };

  const handleTicketChange = (e) => {
    const numTickets = parseInt(e.target.value);
    setTickets(numTickets);
    
    // Initialize ticket holders array
    const holders = [];
    for (let i = 0; i < numTickets; i++) {
      holders.push({ firstName: "", lastName: "" });
    }
    setTicketHolders(holders);
  };

  const handleTicketHolderChange = (index, field, value) => {
    const updatedHolders = [...ticketHolders];
    updatedHolders[index][field] = value;
    setTicketHolders(updatedHolders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate that all ticket holders have names
    const allNamesFilled = ticketHolders.every(holder => 
      holder.firstName.trim() && holder.lastName.trim()
    );

    if (!allNamesFilled) {
      setError("Please fill in all ticket holder names");
      setLoading(false);
      return;
    }

    const stripe = await stripePromise;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          tickets,
          ticketHolders,
        }),
      });

      const data = await response.json();
      if (data.sessionId) {
        stripe.redirectToCheckout({ sessionId: data.sessionId });
      }

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      {/* Hero */}
      <section className="max-w-[1300px] mx-auto md:px-20 px-6 pt-10 md:pt-16">
        <div className="bg-white border-2 border-[#d88728] rounded-lg p-6 md:p-10 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Halloween Party at Maurya's
            </h1>
            <div className="mb-6">
              <p className="text-xl md:text-2xl font-semibold text-[#d88728] mb-2">
                October 31st, 2024
              </p>
              <p className="text-lg text-gray-600">
                Join us for a spooktacular night of themed cocktails, music, and unforgettable vibes
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
              <div className="bg-[#d88728] text-white px-6 py-3 rounded-lg font-semibold text-lg">
                $25 CAD per ticket
              </div>
              <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold text-lg border-2 border-gray-300">
                Limited availability
              </div>
            </div>
            <p className="text-gray-600 text-base">
              Secure your spot today and celebrate Halloween at Maurya's Craft Bar & Kitchen
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 justify-center items-center mb-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="mb-10">
            <label className="block text-2xl font-bold">E-mail</label>
            <input
              type="email"
              className="w-full border-2 border-[#d88728] p-3 mt-2 focus:outline-none"
              placeholder="Best & valid email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-10">
            <label className="block text-2xl font-bold">Mobile Number</label>
            <input
              type="tel"
              className="w-full border-2 border-[#d88728] p-3 mt-2 focus:outline-none"
              placeholder="Best & valid mobile number"
              value={phone}
              onChange={handleChange}
              maxLength={14}
              required
            />
          </div>
          <div className="mb-10">
            <label className="block text-2xl font-bold">Number of Tickets</label>
            <select
              required
              className="w-full border-2 border-[#d88728] p-3 mt-2"
              value={tickets}
              onChange={handleTicketChange}
            >
              <option value="" disabled selected>
                Select One
              </option>
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? "Ticket" : "Tickets"}
                </option>
              ))}
            </select>
          </div>

          {ticketHolders.length > 0 && (
            <div className="mb-10">
              <label className="block text-2xl font-bold mb-4">Ticket Holder Information</label>
              <div className="space-y-4">
                {ticketHolders.map((holder, index) => (
                  <div key={index} className="border-2 border-[#d88728] p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Ticket #{index + 1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 focus:outline-none focus:border-[#d88728]"
                          placeholder="First Name"
                          value={holder.firstName}
                          onChange={(e) => handleTicketHolderChange(index, 'firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 focus:outline-none focus:border-[#d88728]"
                          placeholder="Last Name"
                          value={holder.lastName}
                          onChange={(e) => handleTicketHolderChange(index, 'lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center mb-10">
            <input
              type="checkbox"
              id="consent"
              className="h-10 w-10 -mt-20"
              required
            />
            <label htmlFor="consent" className="ml-4 text-lg">
              I consent to receive communications from Maurya’s via email, text
              message, and/or other electronic means, including social media,
              regarding new menu items, special offers, and other relevant
              information. I have read the Terms & Conditions and Privacy Policy
              and I am ready to comply with it.
            </label>
          </div>

          <div className="w-full flex justify-center items-center mb-5">
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="w-full flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-14 text-lg md:text-xl font-bold tracking-wider py-4"
            >
              {loading ? "Processing..." : "Get Tickets"}
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}
