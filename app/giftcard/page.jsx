"use client";
import React, { useState, useEffect } from "react";
import Footer from "../../Components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function GiftCardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("buy"); // buy or check
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerEmailConfirm, setBuyerEmailConfirm] = useState("");
  const [cards, setCards] = useState([{ 
    isForSelf: true, 
    recipientName: "", 
    recipientEmail: "", 
    recipientEmailConfirm: "",
    amount: "", 
    personalMessage: "" 
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  
  // Check balance state
  const [checkCode, setCheckCode] = useState("");
  const [checkEmail, setCheckEmail] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [cardBalance, setCardBalance] = useState(null);

  useEffect(() => {
    if (searchParams.get("cancelled") === "true") {
      setError("Payment was cancelled. Please try again.");
    }
  }, [searchParams]);

  // Prevent paste and drop on email confirmation fields
  const preventCopyPaste = (e) => {
    e.preventDefault();
    return false;
  };

  const addCard = () => {
    if (cards.length < 50) {
      setCards([...cards, { 
        isForSelf: true, 
        recipientName: "", 
        recipientEmail: "", 
        recipientEmailConfirm: "",
        amount: "", 
        personalMessage: "" 
      }]);
    }
  };

  const removeCard = (index) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    // Reset recipient fields when switching to "For Myself"
    if (field === "isForSelf" && value === true) {
      newCards[index].recipientName = "";
      newCards[index].recipientEmail = "";
      newCards[index].recipientEmailConfirm = "";
      newCards[index].personalMessage = "";
    }
    setCards(newCards);
  };

  const calculateTotal = () => {
    return cards.reduce((sum, card) => sum + (parseFloat(card.amount) || 0), 0);
  };

  const calculateBonus = () => {
    let bonus = 0;
    cards.forEach(card => {
      const amount = parseFloat(card.amount) || 0;
      if (amount >= 100) {
        bonus += 20;
      } else if (amount >= 50) {
        bonus += 10;
      }
    });
    return bonus;
  };

  const validateCards = () => {
    // Validate buyer email confirmation
    if (buyerEmail !== buyerEmailConfirm) {
      return "Your email addresses do not match. Please check and try again.";
    }
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card.amount || parseFloat(card.amount) < 10 || parseFloat(card.amount) > 500) {
        return `Card ${i + 1}: Amount must be between $10 and $500`;
      }
      if (!card.isForSelf) {
        if (!card.recipientName.trim()) {
          return `Card ${i + 1}: Recipient name is required`;
        }
        if (!card.recipientEmail.trim() || !card.recipientEmail.includes("@")) {
          return `Card ${i + 1}: Valid recipient email is required`;
        }
        if (card.recipientEmail !== card.recipientEmailConfirm) {
          return `Card ${i + 1}: Recipient email addresses do not match`;
        }
      }
    }
    return null;
  };

  const handleReviewOrder = (e) => {
    e.preventDefault();
    setError("");
    
    const validationError = validateCards();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setShowSummary(true);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const stripe = await stripePromise;
      
      // Prepare cards with proper recipient info
      const finalCards = cards.map(card => ({
        recipientName: card.isForSelf ? buyerName : card.recipientName,
        recipientEmail: card.isForSelf ? buyerEmail : card.recipientEmail,
        amount: parseFloat(card.amount),
        personalMessage: card.personalMessage || "",
        isForSelf: card.isForSelf
      }));

      // Check if any card is a gift
      const hasGiftCards = cards.some(card => !card.isForSelf);

      const response = await fetch("/api/giftcard/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerEmail,
          cards: finalCards,
          isGift: hasGiftCards
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      if (data.sessionId) {
        stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleCheckBalance = async (e) => {
    e.preventDefault();
    setCheckLoading(true);
    setCheckError("");
    setCardBalance(null);

    try {
      const response = await fetch("/api/giftcard/check-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: checkCode,
          email: checkEmail
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setCheckError(data.error);
      } else {
        setCardBalance(data.card);
      }
    } catch (error) {
      setCheckError(error.message);
    } finally {
      setCheckLoading(false);
    }
  };

  const presetAmounts = [25, 50, 75, 100, 150, 200];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef9f3] to-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Maurya's <span className="text-[#d88728]">Gift Cards</span>
          </h1>
          <p className="text-lg text-gray-300">
            Give the gift of delicious food and memorable experiences
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b-2 border-gray-100">
            <button
              onClick={() => { setActiveTab("buy"); setShowSummary(false); }}
              className={`flex-1 py-4 px-6 text-lg font-semibold transition-all ${
                activeTab === "buy"
                  ? "bg-[#d88728] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <i className="fas fa-gift mr-2"></i>
              Buy Gift Card
            </button>
            <button
              onClick={() => setActiveTab("check")}
              className={`flex-1 py-4 px-6 text-lg font-semibold transition-all ${
                activeTab === "check"
                  ? "bg-[#d88728] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <i className="fas fa-search-dollar mr-2"></i>
              Check Balance
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-10">
            {activeTab === "buy" && !showSummary && (
              <div>
                {/* Bonus Info Banner */}
                <div className="bg-gradient-to-r from-[#d88728] to-[#f5a623] text-white p-5 rounded-xl mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🎁</div>
                    <div>
                      <h3 className="font-bold text-lg">Bonus Card Offer! <span className="text-sm opacity-90"> Maximum bonus $20</span></h3>
                      <p className="text-sm opacity-90">
                      • Buy $50 and get a <strong>$10 Bonus Card</strong> <br /> • Buy $100 and get a <strong>$20 Bonus Card</strong> 
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleReviewOrder}>
                  {/* Buyer Information */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728] transition-colors"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728] transition-colors"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Your Email *</label>
                        <input
                          type="email"
                          value={buyerEmailConfirm}
                          onChange={(e) => setBuyerEmailConfirm(e.target.value)}
                          onPaste={preventCopyPaste}
                          onDrop={preventCopyPaste}
                          onCopy={preventCopyPaste}
                          autoComplete="off"
                          className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-colors ${
                            buyerEmailConfirm && buyerEmail !== buyerEmailConfirm 
                              ? "border-red-400 focus:border-red-500" 
                              : "border-gray-200 focus:border-[#d88728]"
                          }`}
                          placeholder="Re-enter your email"
                          required
                        />
                        {buyerEmailConfirm && buyerEmail !== buyerEmailConfirm && (
                          <p className="text-red-500 text-sm mt-1">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            Emails do not match
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gift Cards */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">
                        Gift Card{cards.length > 1 ? "s" : ""}
                      </h2>
                      {cards.length < 50 && (
                        <button
                          type="button"
                          onClick={addCard}
                          className="text-[#d88728] hover:text-[#c07a24] font-medium"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Another Card
                        </button>
                      )}
                    </div>

                    {cards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-700">
                            Card #{index + 1}
                          </h3>
                          {cards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCard(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              <i className="fas fa-trash mr-1"></i> Remove
                            </button>
                          )}
                        </div>

                        {/* Per-card recipient toggle */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            This card is for:
                          </label>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => updateCard(index, "isForSelf", true)}
                              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                                card.isForSelf
                                  ? "border-[#d88728] bg-[#d88728] text-white"
                                  : "border-gray-200 hover:border-[#d88728] text-gray-700"
                              }`}
                            >
                              <i className="fas fa-user"></i>
                              Myself
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCard(index, "isForSelf", false)}
                              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                                !card.isForSelf
                                  ? "border-[#d88728] bg-[#d88728] text-white"
                                  : "border-gray-200 hover:border-[#d88728] text-gray-700"
                              }`}
                            >
                              <i className="fas fa-gift"></i>
                              A Friend
                            </button>
                          </div>
                        </div>

                        {/* Amount Selection */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Amount * (Min $10 - Max $500)
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                            {presetAmounts.map((amount) => (
                              <button
                                key={amount}
                                type="button"
                                onClick={() => updateCard(index, "amount", amount.toString())}
                                className={`py-2 px-3 rounded-lg border-2 font-medium transition-all ${
                                  parseFloat(card.amount) === amount
                                    ? "border-[#d88728] bg-[#d88728] text-white"
                                    : "border-gray-200 hover:border-[#d88728]"
                                }`}
                              >
                                ${amount}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input
                              type="number"
                              value={card.amount}
                              onChange={(e) => updateCard(index, "amount", e.target.value)}
                              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728]"
                              placeholder="Custom amount"
                              min="10"
                              max="500"
                              required
                            />
                          </div>
                          {parseFloat(card.amount) >= 50 && (
                            <p className="text-green-600 text-sm mt-2">
                              <i className="fas fa-check-circle mr-1"></i>
                              You'll get a ${parseFloat(card.amount) >= 100 ? "20" : "10"} Bonus Card!
                            </p>
                          )}
                        </div>

                        {/* Recipient Info (only when card is for a friend) */}
                        {!card.isForSelf && (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-sm text-[#d88728] mb-3">
                              <i className="fas fa-info-circle mr-1"></i>
                              This card will be emailed to your friend
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Recipient Name *
                                </label>
                                <input
                                  type="text"
                                  value={card.recipientName}
                                  onChange={(e) => updateCard(index, "recipientName", e.target.value)}
                                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728]"
                                  placeholder="Friend's name"
                                  required={!card.isForSelf}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Recipient Email *
                                </label>
                                <input
                                  type="email"
                                  value={card.recipientEmail}
                                  onChange={(e) => updateCard(index, "recipientEmail", e.target.value)}
                                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728]"
                                  placeholder="friend@example.com"
                                  required={!card.isForSelf}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Confirm Recipient Email *
                                </label>
                                <input
                                  type="email"
                                  value={card.recipientEmailConfirm}
                                  onChange={(e) => updateCard(index, "recipientEmailConfirm", e.target.value)}
                                  onPaste={preventCopyPaste}
                                  onDrop={preventCopyPaste}
                                  onCopy={preventCopyPaste}
                                  autoComplete="off"
                                  className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-colors ${
                                    card.recipientEmailConfirm && card.recipientEmail !== card.recipientEmailConfirm 
                                      ? "border-red-400 focus:border-red-500" 
                                      : "border-gray-200 focus:border-[#d88728]"
                                  }`}
                                  placeholder="Re-enter friend's email"
                                  required={!card.isForSelf}
                                />
                                {card.recipientEmailConfirm && card.recipientEmail !== card.recipientEmailConfirm && (
                                  <p className="text-red-500 text-sm mt-1">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    Emails do not match
                                  </p>
                                )}
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Personal Message (Optional)
                                </label>
                                <textarea
                                  value={card.personalMessage}
                                  onChange={(e) => updateCard(index, "personalMessage", e.target.value)}
                                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728]"
                                  placeholder="Happy Holidays! Enjoy your meal..."
                                  rows={2}
                                  maxLength={500}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg mb-6 flex items-start">
                    <i className="fas fa-info-circle mr-3 mt-1 text-yellow-600"></i>
                    <div>
                      <span className="font-bold uppercase">Important:</span> Gift cards are <span className="font-bold">only applicable for Dine-In and Takeout</span> orders.
                    </div>
                  </div>

                  {/* Order Summary Preview */}
                  <div className="bg-[#1a1a1a] text-white rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-3">Order Preview</h3>
                    <div className="flex justify-between mb-2">
                      <span>Gift Cards ({cards.length})</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    {calculateBonus() > 0 && (
                      <div className="flex justify-between text-[#d88728] mb-2">
                        <span>🎁 Bonus Cards</span>
                        <span>+${calculateBonus().toFixed(2)} FREE</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-3 mt-3 flex justify-between text-xl font-bold">
                      <span>Total to Pay</span>
                      <span>${calculateTotal().toFixed(2)} CAD</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#d88728] hover:bg-[#c07a24] text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
                  >
                    Review Order
                  </button>
                </form>
              </div>
            )}

            {/* Order Summary */}
            {activeTab === "buy" && showSummary && (
              <div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="text-[#d88728] hover:text-[#c07a24] mb-6"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Edit
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>

                {/* Gift Card Preview */}
                <div className="mb-6">
                  {cards.map((card, index) => (
                    <div key={index} className="relative mb-4">
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <img
                          src="/GiftCard.png"
                          alt="Gift Card"
                          className="w-full"
                        />
                        <div className="absolute top-4 right-4 bg-white border-2 border-[#d88728] px-4 py-2 rounded">
                          <div className="text-xl font-bold">${parseFloat(card.amount).toFixed(0)}</div>
                          <div className="text-xs text-[#d88728]">GIFT CARD</div>
                        </div>
                      </div>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>For:</strong> {card.isForSelf ? buyerName : card.recipientName}
                          {card.isForSelf && <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">(You)</span>}
                          {!card.isForSelf && <span className="ml-2 text-xs bg-[#d88728] text-white px-2 py-1 rounded">Gift</span>}
                        </p>
                        <p className="text-sm">
                          <strong>Email:</strong> {card.isForSelf ? buyerEmail : card.recipientEmail}
                        </p>
                        {card.personalMessage && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{card.personalMessage}"
                          </p>
                        )}
                      </div>
                      
                      {/* Bonus Card Preview */}
                      {parseFloat(card.amount) >= 50 && (
                        <div className="mt-3 relative">
                          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#d88728]">
                            <img
                              src="/BonusCard.png"
                              alt="Bonus Card"
                              className="w-full"
                            />
                            <div className="absolute top-4 right-4 bg-white border-2 border-[#d88728] px-4 py-2 rounded">
                              <div className="text-xl font-bold">
                                ${parseFloat(card.amount) >= 100 ? "20" : "10"}
                              </div>
                              <div className="text-xs text-[#d88728]">BONUS CARD</div>
                            </div>
                          </div>
                          <div className="mt-2 p-3 bg-[#fef9f3] rounded-lg border border-[#d88728]">
                            <p className="text-sm text-[#d88728]">
                              <i className="fas fa-gift mr-1"></i>
                              <strong>Bonus for you!</strong> This card will be sent to {buyerEmail}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Summary */}
                <div className="bg-[#1a1a1a] text-white rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4">Payment Summary</h3>
                  
                  <div className="space-y-2 mb-4">
                    {cards.map((card, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          Gift Card #{index + 1} for {card.isForSelf ? "yourself" : card.recipientName}
                        </span>
                        <span>${parseFloat(card.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {calculateBonus() > 0 && (
                    <div className="border-t border-gray-700 pt-3 mb-3">
                      <div className="text-[#d88728]">
                        <div className="flex justify-between">
                          <span>🎁 Bonus Cards Included</span>
                          <span>+${calculateBonus().toFixed(2)} FREE</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)} CAD</span>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6">
                  <p className="text-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    {cards.some(c => !c.isForSelf)
                      ? "Gift cards will be emailed to the recipients. You'll also receive a confirmation email with all card details."
                      : "Gift cards will be emailed to you after payment."}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#d88728] hover:bg-[#c07a24] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-lock mr-2"></i>
                      Pay ${calculateTotal().toFixed(2)} CAD
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Check Balance Tab */}
            {activeTab === "check" && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-[#fef9f3] rounded-full mb-4">
                    <i className="fas fa-credit-card text-4xl text-[#d88728]"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Check Your Balance</h2>
                  <p className="text-gray-600 mt-2">
                    Enter your gift card code and email to see your remaining balance
                  </p>
                </div>

                <form onSubmit={handleCheckBalance} className="max-w-md mx-auto">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gift Card Code *
                    </label>
                    <input
                      type="text"
                      value={checkCode}
                      onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728] text-center font-mono text-lg tracking-widest uppercase"
                      placeholder="XXXXXXXX"
                      maxLength={8}
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={checkEmail}
                      onChange={(e) => setCheckEmail(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#d88728]"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  {checkError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      {checkError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={checkLoading}
                    className="w-full bg-[#d88728] hover:bg-[#c07a24] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-all"
                  >
                    {checkLoading ? (
                      <span>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Checking...
                      </span>
                    ) : (
                      "Check Balance"
                    )}
                  </button>
                </form>

                {/* Balance Result */}
                {cardBalance && (
                  <div className="max-w-md mx-auto mt-8">
                    <div className="bg-gradient-to-br from-[#d88728] to-[#f5a623] rounded-xl p-6 text-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm opacity-80">Card Balance</p>
                          <p className="text-4xl font-bold">${cardBalance.remainingAmount.toFixed(2)}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          cardBalance.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          {cardBalance.status}
                        </div>
                      </div>
                      <div className="border-t border-white/30 pt-4 mt-4">
                        <p className="text-sm opacity-80">Card Code</p>
                        <p className="font-mono text-lg tracking-wider">{cardBalance.code}</p>
                      </div>
                      <div className="flex justify-between mt-4 text-sm opacity-80">
                        <span>Original Value: ${cardBalance.originalAmount.toFixed(2)}</span>
                        {cardBalance.isBonus && <span className="bg-white/20 px-2 py-1 rounded">Bonus Card</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-[#fef9f3] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-envelope text-2xl text-[#d88728]"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Delivery</h3>
            <p className="text-gray-600 text-sm">Gift cards are sent instantly via email after purchase</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-[#fef9f3] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-utensils text-2xl text-[#d88728]"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Regular Menu</h3>
            <p className="text-gray-600 text-sm">Redeemable on our full regular food menu</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-[#fef9f3] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-redo text-2xl text-[#d88728]"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Multiple Uses</h3>
            <p className="text-gray-600 text-sm">Use your card across multiple visits until balance is zero</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function GiftCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fef9f3]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d88728] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GiftCardContent />
    </Suspense>
  );
}
