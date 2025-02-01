import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';

export default function Success() {
  const [loading, setLoading] = useState(true);
  setLoading(true);

  const { firstName, lastName, email, phone, people, date, time, note } = useParams();

  useEffect(() => {

    const response = fetch('/api/new-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    })
    setLoading(false);
    console.log(response);

  }, []);

    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white text-black">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
          <p className="mt-4 text-gray-300">Thank you for your payment. Your reservation has been placed successfully. Please check you email for more information. We will be waiting for you!</p>
          <a
            href="/"
            disabled={loading}
            className="mt-6 inline-block bg-green-500 text-black px-6 py-2 rounded-xl font-medium hover:bg-green-600 transition"
          >
            {loading ? 'Loading...' : 'Go Back Home'}
          </a>
        </div>
      </div>
    );
  }
  