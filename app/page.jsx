"use client";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Static testimonials data - easy to add/remove
const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    year: "2024",
    message: "Absolutely magical Valentine's dinner! The ambiance was perfect and the food was exceptional. Can't wait to come back!",
    link: "https://g.co/kgs/example1",
    platform: "Google"
  },
  {
    id: 2,
    name: "Michael & Jennifer",
    rating: 5,
    year: "2024",
    message: "Best Valentine's experience we've ever had. The staff made us feel so special. Highly recommend!",
    link: "https://facebook.com/example2",
    platform: "Facebook"
  },
  {
    id: 3,
    name: "David R.",
    rating: 5,
    year: "2023",
    message: "The food was incredible and the service was top-notch. Perfect spot for a romantic evening.",
    link: "https://g.co/kgs/example3",
    platform: "Google"
  },
  {
    id: 4,
    name: "Emily & Chris",
    rating: 5,
    year: "2023",
    message: "We've been coming here for 3 years now for Valentine's. It never disappoints! The attention to detail is amazing.",
    link: "https://g.co/kgs/example4",
    platform: "Google"
  },
];

// Time slots from 4pm to 11pm in 30-minute intervals
const allTimeSlots = [
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", 
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
  "10:00 PM", "10:30 PM", "11:00 PM"
];

const dates = ["13th", "14th", "15th"];

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "dairy-free", label: "Dairy Free" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Fetch availability when date changes
  useEffect(() => {
    if (date) {
      fetchAvailability(date);
    }
  }, [date]);

  const fetchAvailability = async (selectedDate) => {
    setLoadingAvailability(true);
    try {
      const response = await fetch(`/api/valentines/availability?date=${selectedDate}`);
      const data = await response.json();
      setAvailability(data.slots || {});
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
    setLoadingAvailability(false);
  };

  const formatPhoneNumber = (value) => {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 10) {
      numbers = numbers.slice(0, 10);
    }
    let formatted = numbers;
    if (numbers.length > 6) {
      formatted = `(${numbers.slice(0, 3)})-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else if (numbers.length > 3) {
      formatted = `(${numbers.slice(0, 3)})-${numbers.slice(3)}`;
    } else if (numbers.length > 0) {
      formatted = `(${numbers}`;
    }
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);
  };

  const handleDietaryChange = (option) => {
    setDietaryRestrictions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !phone || !email || !guests || !date || !timeSlot) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const stripe = await stripePromise;
    try {
      const response = await fetch("/api/valentines/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          numberOfGuests: parseInt(guests),
          date,
          timeSlot,
          dietaryRestrictions,
          notesAndAllergies: notes,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      if (data.sessionId) {
        stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>★</span>
    ));
  };

  const isSlotAvailable = (slot) => {
    const count = availability[slot] || 0;
    return count < 5;
  };

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-red-900 to-red-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Valentine's Day at Maurya's
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-red-100">
            February 13th, 14th & 15th, 2025
          </p>
          <p className="text-lg text-red-200 max-w-2xl mx-auto mb-8">
            Celebrate love with an unforgettable dining experience. Reserve your table now for a romantic evening filled with exquisite cuisine and enchanting ambiance.
          </p>
          <a 
            href="#booking-form" 
            className="inline-block bg-white text-red-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-100 transition-colors"
          >
            Reserve Your Table
          </a>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Our Guests Say</h2>
        <p className="text-gray-600 text-center mb-12">Real reviews from our Valentine's Day celebrations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="border-2 border-red-100 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.year}</p>
                </div>
                <div className="text-lg">{renderStars(testimonial.rating)}</div>
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.message}"</p>
              <a 
                href={testimonial.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-800 font-medium text-sm inline-flex items-center"
              >
                View on {testimonial.platform} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form" className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Reserve Your Table</h2>
          <p className="text-gray-600 text-center mb-8">
            Secure your spot for Valentine's with a $10/person reservation fee
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Name *</label>
              <input
                type="text"
                className="w-full border-2 border-[#d88728] p-3 rounded focus:outline-none focus:border-red-500"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Phone Number *</label>
              <input
                type="tel"
                className="w-full border-2 border-[#d88728] p-3 rounded focus:outline-none focus:border-red-500"
                placeholder="(XXX)-XXX-XXXX"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={14}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Best Email Address *</label>
              <input
                type="email"
                className="w-full border-2 border-[#d88728] p-3 rounded focus:outline-none focus:border-red-500"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Number of Guests * <span className="text-sm font-normal text-gray-600">($10 per person)</span></label>
              <select
                required
                className="w-full border-2 border-[#d88728] p-3 rounded focus:outline-none focus:border-red-500"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="" disabled>Select number of guests</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? "Guest" : "Guests"} - ${(i + 1) * 10} CAD
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Date *</label>
              <div className="grid grid-cols-3 gap-4">
                {dates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setDate(d); setTimeSlot(""); }}
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${
                      date === d 
                        ? "border-red-500 bg-red-50 text-red-700" 
                        : "border-gray-200 hover:border-[#d88728]"
                    }`}
                  >
                    Feb {d}
                  </button>
                ))}
              </div>
            </div>

            {date && (
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Time Slot *</label>
                {loadingAvailability ? (
                  <p className="text-gray-500">Loading availability...</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {allTimeSlots.map((slot) => {
                      const available = isSlotAvailable(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!available}
                          onClick={() => setTimeSlot(slot)}
                          className={`p-3 rounded border-2 text-sm font-medium transition-all ${
                            !available 
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : timeSlot === slot 
                                ? "border-red-500 bg-red-50 text-red-700" 
                                : "border-gray-200 hover:border-[#d88728]"
                          }`}
                        >
                          {slot}
                          {!available && <span className="block text-xs">Full</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Dietary Restrictions</label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((option) => (
                  <label key={option.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietaryRestrictions.includes(option.id)}
                      onChange={() => handleDietaryChange(option.id)}
                      className="h-5 w-5 mr-3 accent-red-600"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-bold mb-2">Notes & Allergies</label>
              <textarea
                className="w-full border-2 border-[#d88728] p-3 rounded focus:outline-none focus:border-red-500 min-h-[100px]"
                placeholder="Any special requests, allergies, or notes for the kitchen..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {guests && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-lg font-bold text-red-800">
                  Total Reservation Fee: ${parseInt(guests) * 10} CAD
                </p>
              </div>
            )}

            <div className="w-full flex justify-center items-center mb-5">
              {error && <p className="text-red-500">{error}</p>}
            </div>

            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-14 text-lg md:text-xl font-bold tracking-wider py-4 rounded-lg"
              >
                {loading ? "Processing..." : "Complete Reservation"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Terms & Information Section */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-8">Important Information</h2>
        
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-lg text-green-800 mb-3">💝 About the Reservation Fee</h3>
          <p className="text-green-700">
            The <strong>$10 per person reservation fee</strong> is a deposit to secure your table. 
            When you arrive at the restaurant, this fee will be returned to you in the form of a 
            <strong> $15 gift card</strong> that can be used towards your meal or future visits!
          </p>
        </div>

        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-2">Terms & Conditions</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Reservations are confirmed upon successful payment of the reservation fee.</li>
              <li>Please arrive within 15 minutes of your reserved time slot. Late arrivals may result in forfeiture of your reservation.</li>
              <li>Cancellations must be made at least 24 hours in advance for a full refund.</li>
              <li>The $15 gift card will be provided upon arrival and check-in at the restaurant.</li>
              <li>Gift cards are valid for 1 year from the date of issue.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Privacy Policy</h3>
            <p>
              Your personal information is collected solely for the purpose of managing your reservation. 
              We will use your email and phone number to send confirmation and reminder messages. 
              Your information will not be shared with third parties except as necessary to process your payment.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Contact Us</h3>
            <p>
              For any questions or special requests, please contact us at:<br />
              📞 +1 250 377 4969<br />
              📧 comments@mauryascuisine.com<br />
              📍 165 Victoria St, Kamloops, BC, Canada. V2C 1Z4
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
