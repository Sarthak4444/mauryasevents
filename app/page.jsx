"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Image from "next/image";
// import HeartR from "./HeartR.png";
// import HeartL from "./HeartL.png";
import Item from "./../Components/Item.png";
import React, { useState, useRef } from "react";
// import { loadStripe } from "@stripe/stripe-js";

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// );

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

  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // const stripe = await stripePromise;
    // try {
    //   const response = await fetch("/api/checkout", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       firstName,
    //       lastName,
    //       email,
    //       phone,
    //       people,
    //       date,
    //       time,
    //       note,
    //     }),
    //   });

    //   const data = await response.json();
    //   // if (data.sessionId) {
    //   //   stripe.redirectToCheckout({ sessionId: data.sessionId });
    //   // }

    //   setLoading(false);
    // } catch (error) {
    //   setError(error.message);
    //   setLoading(false);
    // }

    const success_url = `${
      process.env.NEXT_PUBLIC_SITE_URL
    }/success?firstName=${encodeURIComponent(
      firstName
    )}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(
      email
    )}&phone=${encodeURIComponent(phone)}&people=${encodeURIComponent(
      people
    )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
      time
    )}&note=${encodeURIComponent(note)}`;

    router.push(success_url);
    setLoading(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = "2025-03-30";

  return (
    <div>
      <Header />
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 pt-20 flex flex-col md:flex-row justify-center items-center gap-10">
        <div className="flex flex-col justify-center relative items-start gap-14 w-full md:w-1/2">
          <p className="text-3xl md:text-4xl tracking-wide font-bold">
            <span className="relative inline-block">
              One dish.
              {/* <Image
                src={HeartR}
                alt="Heart"
                width={100}
                height={100}
                className="absolute top-1/2 translate-y-[-85%] left-full -ml-12 -z-10"
              /> */}
            </span>
            One drink. <br className="lg:block hidden" />
            One unforgettable <br className="lg:block hidden" /> moment at a
            time.
          </p>
          <p className="text-lg tracking-wide md:text-xl">
            Find your perfect pairing at Maurya's. Our curated menu and
            handcrafted cocktails are designed for{" "}
            <span className="text-red-500">unforgettable moments.</span>
          </p>
          <button
            onClick={handleScrollToSection}
            className="bg-[#d88728] hover:scale-105 transition-all duration-500 text-white px-14 text-lg md:text-xl font-bold tracking-wider py-4"
          >
            Reserve A Table
          </button>
        </div>

        <div className="md:w-1/2 w-full md:my-0 my-10">
          <Image src={Item} alt="food" width={500} height={500} />
        </div>
      </section>
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 pb-10 pt-4">
        <div className="flex flex-col md:flex-row gap-10 mb-4">
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            <p className="text-xl tracking-wide font-bold">
              Welcome to Maurya’s dining experience!
            </p>
            <p>
              Unwind and savor the artistry of Maurya's. Our specially curated
              four-course menu, house-made sparkling wine, and expertly mixed
              cocktails offer an escape from the ordinary.
            </p>
            <p>
              Join this culinary experience for just $85 per person. <br />{" "}
              Question about the menu? Call{" "}
              <Link className="text-blue-500" href="tel:2503774969">
                250 377 4969
              </Link>
            </p>
          </div>
          <div className="flex flex-col justify-start gap-6 w-full md:w-1/2 relative">
            <p className="text-xl tracking-wide font-bold relative inline-block">
              Garden of Love Champagne
              {/* <Image
      src={HeartL}
      alt="Heart"
      width={100} 
      height={100}
      className="absolute top-1/2 translate-y-[-70%] left-full -ml-32 -z-10"
    /> */}
            </p>
            <p>
              Garden of Love: One perfect sip at a time. Our house-made
              sparkling wine, a surprising blend of grape and tomato, is a
              garden's own creation. Raise your glass and savor the moment.
            </p>
            <p className="leading-tight">
              # 4 Course Menu <br /> # House made champagne / sparkling wine{" "}
              <br />
              # Alchemist style cocktails house made <br /> # Zero-proof
              cocktails "why miss the fun!" <br />
              <span className="text-red-500">
                <span className="text-black">#</span> Special dietary options
                available upon request in advance
              </span>
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
      <hr className="bg-black mx-auto w-[85%] h-[2px]" />
      <section className="h-fit max-w-[1300px] mx-auto md:p-20 p-6 justify-center items-center mb-8">
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
          <hr className="bg-black mx-auto w-[100%] mb-14 h-[2px]" />
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
        className="w-full border-2 border-[#d88728] p-3 mt-2"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={today}
        max={maxDate}
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
                {[...Array(15)].map((_, i) => {
                  const hour = 4 + Math.floor(i / 2);
                  const minutes = i % 2 === 0 ? "00" : "30";
                  return (
                    <option key={i} value={`${hour}:${minutes}`}>
                      {hour}:{minutes}
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
              placeholder="Please specify any alergies or dietary restrictions."
            ></textarea>
          </div>

          {/* <hr className="bg-black mx-auto w-[100%] mb-14 h-[2px]" />
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
          </div> */}
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
              information. I have read the{" "}
              <Link
                className="text-blue-500"
                target="_blank"
                href="/reservations-and-dining-discreations"
              >
                Reservations and Dining Discretions
              </Link>{" "}
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
              {loading ? "Reserving..." : "Reserve Now"}
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}
