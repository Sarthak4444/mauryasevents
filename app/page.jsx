"use client";
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
  const [showTerms, setShowTerms] = useState(false);

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
      <section className="max-w-[1300px] mx-auto md:px-20 px-6 pt-4 md:pt-6">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img
              src="/PosterNewYear.jpg"
              alt="New Year Party Illustration"
              className="w-full max-w-md rounded-lg shadow-xl"
            />
          </div>
          <div className="mb-8">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join us for an unforgettable evening a night full of good food, drink, 2026 countdown, music, people, games and prizes! 🍾✨  <br /> <br /><b> Your ticket includes access to a special buffet and one complimentary drink (alcoholic select beer/shot or zero-proof)</b>
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <a href="#booking-form" className="bg-[#d88728] text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-[#c07a24] transition-colors">
              $45 CAD per ticket
            </a>
            <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold text-lg border-2 border-red-400">
              Limited Seating
            </div>
          </div>
          <div className="mb-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-lg text-gray-600">
                <span className="text-2xl font-semibold text-black block">Surge Pricing in Action!</span>
                Every 25 tickets sold, the price climbs higher! Grab yours early to lock in the best deal:
                <br />
                <br />
                Tickets 1–25: $45 (ALMOST SOLD OUT!)
                <br />
                Tickets 26–50: $50
                <br />
                Tickets 51+: $55
                <br />
                <br />
                Don’t wait—beat the surge and secure your spot before the price jumps!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="booking-form" className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 justify-center items-center mb-8">
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
          <div className="flex items-start mb-4">
            <input
              type="checkbox"
              defaultChecked={true}
              id="consent_terms"
              className="h-6 w-6 mt-1"
              required
            />
            <div className="ml-4 text-lg max-w-full">
              <label htmlFor="consent_terms" className="font-semibold block mb-2 cursor-pointer">
                Terms & Conditions – New Year’s Party
              </label>
              <div className={"text-sm text-gray-700 transition-all relative " + (showTerms ? "" : "max-h-10 overflow-hidden") }>
                <p><strong>1. Admission Includes</strong><br/>Entry to the event, dinner buffet, and <strong>one complimentary select beer, shot (1oz) or select non-alcoholic drink</strong> per guest. The complimentary drink must be claimed at the bar and is non-transferable.</p>
                <p className="mt-2"><strong>2. No Refund Policy</strong><br/>All ticket sales are <strong>final</strong>. <strong>No refunds or exchanges</strong> will be provided for any reason, including no-shows, late arrival, or removal from the event.</p>
                <p className="mt-2"><strong>3. Right to Refuse Service &amp; Removal</strong><br/>Management reserves the <strong>right to refuse service or remove any individual</strong> from the premises due to inappropriate behavior, intoxication, misconduct, or failure to comply with staff instructions. <strong>No refund will be issued</strong> if a guest is removed.</p>
                <p className="mt-2"><strong>4. Alcohol Responsibility</strong><br/>The complimentary drink is limited to <strong>one select beer, shot or select non-alcoholic drink</strong> only. Any additional alcohol purchases are subject to venue rules and responsible service laws.</p>
                <p className="mt-2"><strong>5. Event Changes</strong><br/>The organizer reserves the right to make changes to the event program, menu, or schedule without prior notice.</p>
                <p className="mt-2">By purchasing a ticket or attending the event, guests agree to abide by these terms and conditions.</p>
                {!showTerms && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
              <button type="button" onClick={() => setShowTerms(s => !s)} className="text-[#d88728] text-sm font-semibold mt-2">
                {showTerms ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>
          <div className="flex items-center mb-10">
            <input
              type="checkbox"
              defaultChecked={true}
              id="consent_marketing"
              className="h-6 w-6 -mt-20"
              required
            />
            <label htmlFor="consent_marketing" className="ml-4 text-lg">
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
