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
  },
  {
    id: 2,
    name: "Michael & Jennifer",
    rating: 5,
    year: "2024",
    message: "Best Valentine's experience we've ever had. The staff made us feel so special. Highly recommend!",
  },
  {
    id: 3,
    name: "David R.",
    rating: 5,
    year: "2023",
    message: "The food was incredible and the service was top-notch. Perfect spot for a romantic evening.",
  },
  {
    id: 4,
    name: "Emily & Chris",
    rating: 5,
    year: "2023",
    message: "We've been coming here for 3 years now for Valentine's. It never disappoints! The attention to detail is amazing.",
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
  const [showTerms, setShowTerms] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-scroll testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
            February 13th, 14th & 15th, 2026
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
      <section className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Our Guests Say</h2>
        <p className="text-gray-600 text-center mb-12">Real reviews from our Valentine's Day celebrations</p>
        
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="border-2 border-red-100 rounded-lg p-8 bg-white shadow-lg max-w-2xl mx-auto">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{testimonial.name}</h3>
                        <p className="text-sm text-gray-500">{testimonial.year}</p>
                      </div>
                      <div className="text-xl">{renderStars(testimonial.rating)}</div>
                    </div>
                    <p className="text-gray-700 text-lg italic">"{testimonial.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-white border-2 border-red-200 hover:border-red-400 rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-white border-2 border-red-200 hover:border-red-400 rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial 
                    ? "bg-red-500 w-6" 
                    : "bg-red-200 hover:bg-red-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
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
                  Terms & Conditions – Valentine's Day Reservation
                </label>
                <div className={"text-sm text-gray-700 transition-all relative " + (showTerms ? "" : "max-h-10 overflow-hidden")}>
                  <p><strong>1. Reservation Fee</strong><br />The <strong>$10 per person reservation fee</strong> is a deposit to secure your table. When you arrive at the restaurant, this fee will be returned to you in the form of a <strong>$15 gift card</strong> that can be used towards your meal or future visits!</p>
                  <p className="mt-2"><strong>2. Table Time Limit</strong><br />To ensure all guests have a wonderful experience, table reservations are limited to a <strong>maximum of 2 hours</strong>. Please plan your dining experience accordingly.</p>
                  <p className="mt-2"><strong>3. No Refund Policy</strong><br />All ticket sales are final. No refunds or exchanges will be provided for any reason, including no-shows, late arrival, or removal from the event.</p>
                  <p className="mt-2"><strong>4. Gift Card Terms</strong><br />The $15 gift card will be provided upon arrival and check-in at the restaurant. Gift cards are valid for 1 year from the date of issue.</p>
                  <p className="mt-2"><strong>5. Right to Refuse Service</strong><br />Management reserves the right to refuse service or modify reservations due to unforeseen circumstances.</p>
                  <p className="mt-2">By completing this reservation, you agree to abide by these terms and conditions.</p>
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
                I consent to receive communications from Maurya's via email, text
                message, and/or other electronic means, including social media,
                regarding new events, special offers, and other relevant
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
                className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-14 text-lg md:text-xl font-bold tracking-wider py-4 rounded-lg"
              >
                {loading ? "Processing..." : "Complete Reservation"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
