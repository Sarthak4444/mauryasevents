"use client";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function KDVPage() {
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
      const response = await fetch("/api/kdv/checkout", {
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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black">
      <Header />
      <section className="max-w-[1300px] mx-auto md:px-20 px-6 pt-4 md:pt-6">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img
              src="/kdv.jpeg"
              alt="Kamloops Dance Vibes"
              className="w-full max-w-2xl rounded-lg shadow-2xl border-2 border-purple-500/30"
            />
          </div>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Kamloops Dance Vibes
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Get ready to move! Join us for an electrifying night of music, dance, and unforgettable vibes. 🎶💃
            </p>
            <div className="mt-6 inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-2xl font-bold shadow-lg">
              $25 CAD per ticket
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="booking-form" className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 justify-center items-center mb-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Book Your Tickets</h2>
          
          <div className="mb-8">
            <label className="block text-xl font-bold text-white mb-2">E-mail</label>
            <input
              type="email"
              className="w-full border-2 border-purple-500 bg-white/90 p-3 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Best & valid email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-xl font-bold text-white mb-2">Mobile Number</label>
            <input
              type="tel"
              className="w-full border-2 border-purple-500 bg-white/90 p-3 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Best & valid mobile number"
              value={phone}
              onChange={handleChange}
              maxLength={14}
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-xl font-bold text-white mb-2">Number of Tickets</label>
            <select
              required
              className="w-full border-2 border-purple-500 bg-white/90 p-3 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
              value={tickets}
              onChange={handleTicketChange}
            >
              <option value="" disabled selected>
                Select One
              </option>
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? "Ticket" : "Tickets"} - ${(i + 1) * 25} CAD
                </option>
              ))}
            </select>
          </div>

          {ticketHolders.length > 0 && (
            <div className="mb-8">
              <label className="block text-xl font-bold text-white mb-4">Ticket Holder Information</label>
              <div className="space-y-4">
                {ticketHolders.map((holder, index) => (
                  <div key={index} className="border-2 border-purple-500/50 bg-white/90 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-purple-900">Ticket #{index + 1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">First Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-purple-500"
                          placeholder="First Name"
                          value={holder.firstName}
                          onChange={(e) => handleTicketHolderChange(index, 'firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Last Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-purple-500"
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

          <div className="flex items-start mb-6">
            <input
              type="checkbox"
              defaultChecked={true}
              id="consent_terms"
              className="h-5 w-5 mt-1 accent-purple-600"
              required
            />
            <div className="ml-4 text-white max-w-full">
              <label htmlFor="consent_terms" className="font-semibold block mb-2 cursor-pointer">
                Terms & Conditions – Kamloops Dance Vibes
              </label>
              <div className={"text-sm text-purple-200 transition-all relative " + (showTerms ? "" : "max-h-10 overflow-hidden")}>
                <p><strong>1. Admission</strong><br />Entry to the event with full access to all dance activities and entertainment.</p>
                <p className="mt-2"><strong>2. No Refund Policy</strong><br />All ticket sales are <strong>final</strong>. <strong>No refunds or exchanges</strong> will be provided for any reason, including no-shows, late arrival, or removal from the event.</p>
                <p className="mt-2"><strong>3. Right to Refuse Service &amp; Removal</strong><br />Management reserves the <strong>right to refuse service or remove any individual</strong> from the premises due to inappropriate behavior, intoxication, misconduct, or failure to comply with staff instructions. <strong>No refund will be issued</strong> if a guest is removed.</p>
                <p className="mt-2"><strong>4. Event Changes</strong><br />The organizer reserves the right to make changes to the event program or schedule without prior notice.</p>
                <p className="mt-2">By purchasing a ticket or attending the event, guests agree to abide by these terms and conditions.</p>
                {!showTerms && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-purple-950/80 to-transparent pointer-events-none" />
                )}
              </div>
              <button type="button" onClick={() => setShowTerms(s => !s)} className="text-pink-400 text-sm font-semibold mt-2 hover:text-pink-300 transition-colors">
                {showTerms ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>
          <div className="flex items-start mb-8">
            <input
              type="checkbox"
              defaultChecked={true}
              id="consent_marketing"
              className="h-5 w-5 mt-1 accent-purple-600"
              required
            />
            <label htmlFor="consent_marketing" className="ml-4 text-white text-sm">
              I consent to receive communications from Maurya's via email, text
              message, and/or other electronic means, including social media,
              regarding new events, special offers, and other relevant
              information. I have read the Terms & Conditions and Privacy Policy
              and I am ready to comply with it.
            </label>
          </div>

          <div className="w-full flex justify-center items-center mb-5">
            {error && <p className="text-red-400 bg-red-900/30 px-4 py-2 rounded">{error}</p>}
          </div>

          <div className="w-full flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-all duration-300 text-white px-14 text-lg md:text-xl font-bold tracking-wider py-4 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

