"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../../../Components/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const processOrder = async () => {
      try {
        const orderDataParam = searchParams.get("orderData");
        
        if (!orderDataParam) {
          setError("Invalid order data");
          setLoading(false);
          return;
        }

        const parsedOrderData = JSON.parse(decodeURIComponent(orderDataParam));
        setOrderData(parsedOrderData);

        // Call the complete API to create cards and send emails
        const response = await fetch("/api/giftcard/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedOrderData),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "Order already processed") {
            // Order was already processed, just show success
            setCards(parsedOrderData.cards.map(c => ({
              amount: c.amount,
              ownerName: c.recipientName,
              isBonus: false
            })));
          } else {
            throw new Error(data.error || "Failed to process order");
          }
        } else {
          setCards(data.cards || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error processing order:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    processOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef9f3]">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#d88728] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-700">Processing your order...</p>
          <p className="text-gray-500 mt-2">Please wait while we create your gift cards</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef9f3] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/giftcard")}
            className="bg-[#d88728] hover:bg-[#c07a24] text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go Back to Gift Cards
          </button>
        </div>
      </div>
    );
  }

  const giftCards = cards.filter(c => !c.isBonus);
  const bonusCards = cards.filter(c => c.isBonus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef9f3] to-white">
      {/* Success Header */}
      <section className="bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-5xl"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-300">
            Your gift card{giftCards.length > 1 ? "s have" : " has"} been created
          </p>
        </div>
      </section>

      {/* Order Details */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {orderData && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Confirmed</h2>
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <i className="fas fa-check mr-1"></i> Complete
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono font-medium">{orderData.orderId}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                <p className="font-bold text-xl text-[#d88728]">
                  ${orderData.totalAmount?.toFixed(2)} CAD
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                <i className="fas fa-envelope text-[#d88728] mr-2"></i>
                Email Confirmation Sent To:
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <i className="fas fa-user mr-2"></i>
                  {orderData.buyerEmail}
                </p>
                {orderData.isGift && orderData.cards?.map((card, index) => (
                  card.recipientEmail !== orderData.buyerEmail && (
                    <p key={index} className="text-gray-600">
                      <i className="fas fa-gift mr-2 text-[#d88728]"></i>
                      {card.recipientEmail} (Gift Recipient)
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gift Cards Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Gift Cards</h2>
          
          <div className="space-y-4">
            {giftCards.map((card, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-[#d88728] rounded-lg flex items-center justify-center text-white">
                  <i className="fas fa-gift text-2xl"></i>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    ${card.amount} Gift Card
                  </p>
                  <p className="text-sm text-gray-600">
                    For: {card.ownerName}
                  </p>
                </div>
                {card.code && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Code</p>
                    <p className="font-mono font-bold text-[#d88728]">{card.code}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bonus Cards */}
          {bonusCards.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-[#d88728] mb-4">
                <i className="fas fa-star mr-2"></i>
                Your Bonus Cards
              </h3>
              <div className="space-y-4">
                {bonusCards.map((card, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-[#fef9f3] rounded-lg border border-[#d88728]">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#d88728] to-[#f5a623] rounded-lg flex items-center justify-center text-white">
                      <i className="fas fa-star text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        ${card.amount} Bonus Card
                      </p>
                      <p className="text-sm text-gray-600">
                        Thank you bonus!
                      </p>
                    </div>
                    {card.code && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Code</p>
                        <p className="font-mono font-bold text-[#d88728]">{card.code}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-[#d88728] to-[#f5a623] rounded-xl p-6 md:p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold">Check Your Email</p>
                <p className="text-sm opacity-90">Gift card details have been sent to your email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold">Visit Maurya's</p>
                <p className="text-sm opacity-90">Come dine at our restaurant</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold">Present Your Code</p>
                <p className="text-sm opacity-90">Show the gift card code when paying</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/giftcard")}
            className="bg-[#d88728] hover:bg-[#c07a24] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            <i className="fas fa-plus mr-2"></i>
            Buy Another Gift Card
          </button>
          <a
            href="https://www.mauryascuisine.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 text-center"
          >
            <i className="fas fa-external-link-alt mr-2"></i>
            Visit Our Website
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function GiftCardSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fef9f3]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#d88728] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

