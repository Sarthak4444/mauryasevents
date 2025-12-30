"use client";

import { useState } from "react";

const segments = [
  { label: "All cocktails 15% OFF", color: "#7C3AED" },
  { label: "Buy one shot get 2nd at 50%", color: "#6366F1" },
  { label: "All beers $5", color: "#8B5CF6" },
];

export default function SpinTheWheelPage() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const segmentAngle = 360 / segments.length;

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    const spins = Math.floor(Math.random() * 3) + 5;
    const winningIndex = Math.floor(Math.random() * segments.length);

    const finalRotation =
      spins * 360 + (segments.length - winningIndex) * segmentAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(segments[winningIndex].label);
      setSpinning(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
        🎉 Spin the Party Wheel 🎉
      </h1>

      {/* Wheel Wrapper */}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Pointer */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-[18px] border-l-transparent border-r-transparent border-b-yellow-400" />
        </div>

        {/* Wheel */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden border-[10px] border-yellow-300 transition-transform duration-[4500ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((segment, index) => {
            const angle = segmentAngle * index;

            return (
              <div
                key={index}
                className="absolute w-1/2 h-1/2 top-1/2 left-1/2 origin-bottom-left flex items-center justify-center"
                style={{
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: segment.color,
                  clipPath: "polygon(0 0, 100% 0, 0 100%)",
                }}
              >
                <span
                  className="text-sm md:text-base font-bold text-white text-center px-2"
                  style={{
                    transform: `rotate(${segmentAngle / 2}deg) translateY(-55px)`,
                  }}
                >
                  {segment.label}
                </span>
              </div>
            );
          })}

          {/* Center Hub */}
          <div className="absolute inset-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black shadow-lg">
            SPIN
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={spinWheel}
        disabled={spinning}
        className={`mt-8 px-10 py-3 rounded-full text-lg font-semibold transition ${
          spinning
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-yellow-400 text-black hover:bg-yellow-300"
        }`}
      >
        {spinning ? "Spinning..." : "Spin Now"}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 text-2xl font-bold text-center animate-bounce">
          🥳 {result}
        </div>
      )}
    </div>
  );
}
