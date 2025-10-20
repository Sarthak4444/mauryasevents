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

    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const tickets = searchParams.get("tickets");
    const ticketHoldersParam = searchParams.get("ticketHolders");

    const sendRequest = async () => {
      try {
        const ticketHolders = ticketHoldersParam ? JSON.parse(decodeURIComponent(ticketHoldersParam)) : [];
        
        const response = await fetch("/api/new-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            phone,
            tickets: parseInt(tickets),
            ticketHolders,
          }),
        });

        if (!response.ok) throw new Error("Failed to send data");

        await response.json();
        router.push("/payment-successful");
      } catch (error) {
        console.error(error);
        router.push("/payment-failed");
      }
    };

    sendRequest();
  }, [searchParams, router]);

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-black">
      {loading && (
        <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
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
