"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../../Components/Header";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return console.log("no search params");

    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const people = searchParams.get("people");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const note = searchParams.get("note");

    const sendRequest = async () => {
      try {
        const response = await fetch("/api/new-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        if (!response.ok) throw new Error("Failed to send data");
        console.log(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    sendRequest();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-white text-black">
      <div className="bg-black p-6 shadow-lg text-center max-w-md m-5">
        <h1 className="text-3xl font-bold text-[#d88728]">
          Payment Successful!
        </h1>
        <p className="mt-4 text-gray-300">
          Thank you for your payment. Your reservation has been confirmed.
          Please check your email for further details. We will look forward to
          serving you soon. <br /> <br />
          If you have any questions please feel free to contact us at{" "}
          <Link className="text-blue-500" href="tel:2503774969">
            250 377 4969
          </Link>{" "}
          or{" "}
          <Link
            className="text-blue-500"
            href="mailto:comments@mauryascuisine.com"
          >
            comments@mauryascuisine.com
          </Link>
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          disabled={loading}
          className="mt-6 inline-block px-14 py-4 font-medium transition bg-[#d88728] hover:bg-[#df8e31] text-white"
        >
          {loading ? "Loading..." : "Go Back Home"}
        </button>
        <div className="text-red-500 mt-4">
          {loading
            ? "Please do not close the website until it is loading "
            : ""}
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense
      fallback={<div className="text-center text-white">Loading...</div>}
    >
      <Header />
      <SuccessContent />
    </Suspense>
  );
}
