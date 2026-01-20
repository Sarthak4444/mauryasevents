"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

function SuccessComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) {
      console.log("No search params");
      return;
    }

    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const numberOfGuests = searchParams.get("numberOfGuests");
    const date = searchParams.get("date");
    const timeSlot = searchParams.get("timeSlot");
    const dietaryRestrictionsParam = searchParams.get("dietaryRestrictions");
    const notesAndAllergies = searchParams.get("notesAndAllergies");

    const sendRequest = async () => {
      try {
        const dietaryRestrictions = dietaryRestrictionsParam 
          ? JSON.parse(decodeURIComponent(dietaryRestrictionsParam)) 
          : [];
        
        const response = await fetch("/api/valentines/new-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            numberOfGuests: parseInt(numberOfGuests),
            date,
            timeSlot,
            dietaryRestrictions,
            notesAndAllergies: notesAndAllergies || '',
          }),
        });

        if (!response.ok) throw new Error("Failed to send data");

        await response.json();
        router.push("/payment-successful");
      } catch (error) {
        console.error(error);
        router.push("/?error=booking-failed");
      }
    };

    sendRequest();
  }, [searchParams, router]);

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-black">
      {loading && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Confirming your reservation...</p>
        </div>
      )}
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex justify-center items-center bg-black">Loading...</div>}>
      <SuccessComponent />
    </Suspense>
  );
}
