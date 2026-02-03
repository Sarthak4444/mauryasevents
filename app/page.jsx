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
    name: "John Weaver",
    rating: 5,
    year: "Google 2024",
    message: "Just had the Valentines Day set menu. One of he most unique and amazing dining experiences I have ever had. So much thought and creativity. Incredible flavors! Will be looking forward to trying this dine in experience more often. We were pretty regular takeaway customers already. If you are gluten intolerant this is one of the best places you can go as the options are so varied. You feel like part of the experience rather than an afterthought. Congratulations to all staff you run a tight ship!",
  },
  {
    id: 2,
    name: "L weaver",
    rating: 5,
    year: "Google 2023",
    message: "Tonight though, we did the Valentine's dinner and it was incredible... amazing food and drinks all presented personally with a lovely story accompanying each dish coming from/inspired by the chef's hometown. Definitely Indian food from a region that I had never tried. Such amazing tastes presented in a lovely way. The staff also made the night so special with their very attentive service. We will definitely reserve a table at the next set dinner! Thank you!",
  },
  {
    id: 3,
    name: "Michelle Graf",
    rating: 5,
    year: "Google 2023",
    message: "We went for the Valentine's special. This may have been one of the best meals I've ever eaten. It was an explosion of amazing flavors. A carnival for the taste buds.",
  },
  {
    id: 4,
    name: "Mr White",
    rating: 5,
    year: "Google 2023",
    message: "We had the off-menu experience for Valentines Day....Easily one of our best culinary experiences. Chef Dilip deftly wove traditional flavours and dishes into elevated cuisine with some western familiarity. Truly taste of India. Well balanced dishes that played on multiple senses. We had dinner there the week prior and it was just as delicious.",
  },
  {
    id: 5,
    name: "Brianne & Calli",
    rating: 5,
    year: "Google 2024",
    message: "We went and experienced the off menu Valentines dinner this year and were absolutely blown away. The combination of the storytelling, the impeccable service and the almost too good for Kamloops food was perfection. Each course was a surprise, and paired with a fresh, new-to-us cocktail. It's an investment, but we would absolutely do it again.",
  }
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
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [expandedTestimonials, setExpandedTestimonials] = useState({});

  const MAX_CHARS = 200; // Character limit for testimonials

  const toggleTestimonialExpand = (id) => {
    setExpandedTestimonials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return { text, isTruncated: false };
    return { text: text.substring(0, maxLength).trim() + '...', isTruncated: true };
  };

  // Auto-scroll testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Prevent body scroll when menu modal is open
  useEffect(() => {
    if (showMenuModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMenuModal]);

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
      <section className="relative w-full min-h-[400px] sm:min-h-0">
        {/* Background Image - Responsive for both mobile and desktop */}
        <img
          src="/valentine's weekend.webp"
          alt="Valentine's Day at Maurya's"
          className="w-full h-full object-cover absolute inset-0 sm:relative sm:h-auto"
        />

        {/* Buttons - Positioned at bottom */}
        <div className="absolute bottom-10 sm:bottom-28 md:bottom-48 left-0 right-0 flex justify-center px-4">
          <div className="flex flex-row gap-4 md:gap-6">
            <a
              href="#booking-form"
              className="bg-[#d88728] text-white py-3 rounded-lg sm:py-4 md:py-5 font-bold text-base sm:text-lg md:text-xl hover:bg-[#c07a24] transition-colors shadow-xl text-center w-40 sm:w-48 md:w-56"
            >
              Reserve Table
            </a>
            <button
              onClick={() => setShowMenuModal(true)}
              className="bg-transparent text-white py-3 rounded-lg sm:py-4 md:py-5 font-bold text-base sm:text-lg md:text-xl hover:bg-white hover:text-[#d88728] transition-colors border-white shadow-xl text-center w-40 sm:w-48 md:w-56"
              style={{ borderWidth: '3px' }}
            >
              View Menu
            </button>
          </div>
        </div>
      </section>

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-start justify-center overflow-y-auto">
          {/* Close Button - Fixed position */}
          <button
            onClick={() => setShowMenuModal(false)}
            className="fixed top-6 right-10 z-50 bg-white text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold shadow-lg"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          <div className="w-full max-w-3xl mx-auto p-4">
            
            {/* Menu Images */}
            <div className="flex flex-col gap-4">
              <img 
                src="/Menu_p1.jpeg" 
                alt="Valentine's Menu Page 1" 
                className="w-full h-auto rounded-lg shadow-xl"
              />
              <img 
                src="/Menu_p2.jpeg" 
                alt="Valentine's Menu Page 2" 
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
            
            {/* Reserve Table Button */}
            <div className="flex justify-center mt-8 mb-4">
              <a
                href="#booking-form"
                onClick={() => setShowMenuModal(false)}
                className="bg-[#d88728] text-white py-3 sm:py-4 md:py-5 font-bold text-base sm:text-lg rounded-lg md:text-xl hover:bg-[#c07a24] transition-colors shadow-xl text-center w-48 sm:w-56 md:w-64"
              >
                Reserve Table
              </a>
            </div>
          </div>
        </div>
      )}

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
              {testimonials.map((testimonial) => {
                const isExpanded = expandedTestimonials[testimonial.id];
                const { text: displayText, isTruncated } = truncateText(testimonial.message, MAX_CHARS);
                
                return (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="border-2 border-red-100 rounded-lg p-8 bg-white shadow-lg max-w-2xl mx-auto">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl">{testimonial.name}</h3>
                          <p className="text-sm text-gray-500">{testimonial.year}</p>
                        </div>
                        <div className="text-xl">{renderStars(testimonial.rating)}</div>
                      </div>
                      <p className="text-gray-700 text-lg italic">
                        "{isExpanded ? testimonial.message : displayText}"
                      </p>
                      {isTruncated && (
                        <button
                          onClick={() => toggleTestimonialExpand(testimonial.id)}
                          className="text-[#d88728] font-semibold text-sm mt-3 hover:text-[#c07a24] transition-colors"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial
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
          <p className="text-gray-600 text-center mb-2">
          Join this culinary experience — $79 per person
          </p>
          <p className="text-[#d88728] font-semibold text-center mb-8">
            February 13th, 14th & 15th, 2026
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
              <label className="block text-lg font-bold mb-2">Number of Guests * <span className="text-sm font-normal text-gray-600">($10 per person deposit to secure your table)</span></label>
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
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${date === d
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
                          className={`p-3 rounded border-2 text-sm font-medium transition-all ${!available
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
                className="w-full border-2 border-[#d88728] p-3 rounded focus:outline-none focus:border-red-500 min-h-[125px]"
                placeholder={"Any special requests, allergies, or notes for the kitchen...\nQuestions about the menu? Call 250-377-4969"}
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
                  <p><strong>1. Reservation Fee</strong><br />The <strong>$10 per person reservation fee</strong> is a deposit to secure your table. When you arrive at the restaurant, this fee will be returned to you in the form of a <strong>$15 gift card</strong> that can be used towards your future visits!</p>
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
                className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-6 sm:px-10 md:px-14 text-lg md:text-xl font-bold tracking-wider py-4 rounded-lg"
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
