"use client";
import Image from "next/image";
import Food from "../public/images/Food.jpg";
import Link from "next/link";
import { useState, useRef } from "react";
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
            src={Food}
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
    </div>
  );
}
