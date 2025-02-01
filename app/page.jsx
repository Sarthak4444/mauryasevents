"use client";
import Link from "next/link";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [people, setPeople] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sectionRef = useRef(null);
  const handleScrollToSection = () => {
    sectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    let numbers = value.replace(/\D/g, "");

    // Limit to 10 digits
    if (numbers.length > 10) {
      numbers = numbers.slice(0, 10);
    }

    // Format (xxx)-xxx-xxxx
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

  const handleChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const stripe = await stripePromise;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          people,
          date,
          time,
          note,
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
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 pt-20 flex flex-col md:flex-row justify-center items-center gap-10">
        <div className="flex flex-col justify-center items-start gap-6 md:gap-10 w-full md:w-1/2">
          <p className="text-4xl md:text-5xl tracking-wide font-extrabold">
            One dish. One drink. <br /> One unforgettable <br /> moment at a
            time.
          </p>
          <p className="text-lg md:text-xl">
            This <span className="text-red-500">Valentine's Day,</span> let
            Maurya's curate your perfect evening. Our special menu and
            handcrafted cocktails are designed to create lasting memories.
          </p>
          <button
            onClick={handleScrollToSection}
            className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-8 text-xl md:text-2xl font-extrabold tracking-wider py-2 "
          >
            Reserve A Table
          </button>
        </div>
        <div className="md:w-1/2 w-full">
          <Image
            src="data:image/jpeg;base64,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"
            alt="food"
            width={500}
            height={500}
          />
        </div>
      </section>
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 pb-10 pt-20">
        <div className="flex flex-col md:flex-row gap-10 mb-4">
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            <p className="text-2xl tracking-wide font-bold">
              Welcome to Maurya’s valentine dining experience!
            </p>
            <p>
              Experience the artistry of our culinary team this Valentine's Day
              with a specially curated 4-course menu. Savor handcrafted dishes,
              sip on our house-made champagne, and indulge in expertly mixed
              cocktails. Every detail is crafted with passion, creating perfect
              setting for romance.
            </p>
            <p>
              Join this culinary experience for just $85 per person. <br />{" "}
              Question about the menu? Call 250-377-4696
            </p>
          </div>
          <div className="flex flex-col justify-start gap-6 w-full md:w-1/2">
            <p className="text-2xl tracking-wide font-bold">
              Garden of Love champagne
            </p>
            <p>
              A house made champagne / sparkling wine “Garden of Love” where the
              elegance of grapes meet the bold sweetness of house-grown
              tomatoes. Raise your glass to love and let the 'Garden of Love' champagne
              suprise your senses. 'Love has never tasted this good.
            </p>
            <p className="leading-tight">
              # 4 Course Menu <br /> # House made Champagne / sparkling wine{" "}
              <br /> # Alchmest style cocktails house made <br /> # Zero-proof
              cocktails "why mis the fun!" <br /> <span className="text-red-500">Special dietary options available upon request in advance</span>
            </p>
          </div>
        </div>
        <Link
          href="/menu"
          ref={sectionRef}
          className="text-xl font-bold hover:underline transition-all duration-300 tracking-wider text-red-500"
        >
          View Menu
        </Link>
      </section>
      <hr className="bg-black mx-auto w-[80%] h-[2px]" />
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 justify-center items-center">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div>
              <label className="block text-2xl font-bold">Name</label>
              <input
                type="text"
                className="w-full border-2 border-[#d88728] p-3 mt-2 focus:outline-none"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="text"
                className="w-full border-2 border-[#d88728] p-3 mt-0 sm:mt-10 focus:outline-none"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
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
          <hr className="bg-black mx-auto w-[80%] mb-14 h-[2px]" />
          <div className="mb-10">
            <label className="block text-2xl font-bold">Number of guests</label>
            <select
              required
              className="w-full border-2 border-[#d88728] p-3 mt-2"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
            >
              <option value="" disabled selected>
                Select One
              </option>
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? "Person" : "People"}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div>
              <label className="block text-2xl font-bold">Date</label>
              <input
                type="date"
                className="w-full border-2 border-[#d88728] p-2 mt-2"
                min={new Date().toISOString().split("T")[0]}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-2xl font-bold">Time</label>
              <select
                required
                className="w-full border-2 border-[#d88728] p-3 mt-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="" disabled selected>
                  Select Time
                </option>
                {[...Array(22)].map((_, i) => {
                  const hour = 12 + Math.floor(i / 2);
                  const minutes = i % 2 === 0 ? "00" : "30";
                  const formattedHour = hour > 12 ? hour - 12 : hour;
                  const period = hour >= 12 ? "PM" : "AM";

                  return (
                    <option key={i} value={`${hour}:${minutes}`}>
                      {formattedHour}:{minutes} {period}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="mb-14">
            <label className="block text-2xl font-bold">Special Notes</label>
            <textarea
              className="w-full border-2 border-[#d88728] p-3 mt-2 resize-none"
              rows="4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

          <hr className="bg-black mx-auto w-[80%] mb-14 h-[2px]" />
          <div className="bg-orange-100 p-4 border-2 border-[#d88728] mb-10">
            <p className="text-sm">
              A $10 per person non-refundable fee is required to secure your
              reservation, as seating is limited. This fee is separate from menu
              pricing. As a thank you for your commitment,{" "}
              <span className="text-orange-600">
                you will receive a $15 gift card per person when you will be at
                Maurya’s,
              </span>{" "}
              effectively refunding the reservation fee and allowing you to
              experience the unique craftsmanship of Maurya’s.
            </p>
          </div>
          <div className="flex items-center mb-10">
            <input
              type="checkbox"
              id="consent"
              className="h-10 w-10 -mt-14"
              required
            />
            <label htmlFor="consent" className="ml-4 text-lg">
              I consent to receive communications from Maurya’s via email, text
              message, and/or other electronic means, including social media,
              regarding new menu items, special offers, and other relevant
              information.
            </label>
          </div>

          <div className="w-full flex justify-center items-center mb-5">
            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="w-full flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-10 text-xl md:text-2xl font-extrabold tracking-wider py-2"
            >
              {loading ? "Reserving..." : "Reserve Now"}
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}
