import React from 'react'
import Link from "next/link"

function page() {
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
    </div>
  </div>
  )
}

export default page