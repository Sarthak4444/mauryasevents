"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Success() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return console.log("No search params");

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
        
        const result = await response.json();
        router.push("/payment-successful");
      } catch (error) {
        console.error(error);
        router.push("/cancel");
      } finally {
        setLoading(false);
      }
    };

    sendRequest();
  }, []);

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-black">
      {loading && (
        <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
}
