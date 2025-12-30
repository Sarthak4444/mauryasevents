"use client";

import { useState } from "react";

const options = [
  "All cocktails 15% OFF",
  "Buy one shot get the second at 50%",
  "All beers $5",
];

export default function SpinTheWheelPage() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    // Random spins (3–6 full rotations) + random landing
    const spins = Math.floor(Math.random() * 3) + 4;
    const segmentAngle = 360 / options.length;
    const randomIndex = Math.floor(Math.random() * options.length);
    const finalRotation =
      spins * 360 + (options.length - randomIndex) * segmentAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(options[randomIndex]);
      setSpinning(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-black to-red-900 text-white px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        🎉 Spin the Party Wheel 🎉
      </h1>

      {/* Wheel Container */}
      <div className="relative w-80 h-80 mb-8">
        {/* Pointer */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
        </div>

        {/* Wheel */}
        <div
          className="w-full h-full rounded-full border-8 border-white relative transition-transform duration-[4500ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {options.map((option, index) => {
            const angle = (360 / options.length) * index;
            return (
              <div
                key={index}
                className="absolute w-1/2 h-1/2 top-1/2 left-1/2 origin-bottom-left flex items-center justify-center text-sm font-bold text-center px-2"
                style={{
                  transform: `rotate(${angle}deg) translateX(-100%)`,
                }}
              >
                <span className="rotate-[-90deg]">
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spinWheel}
        disabled={spinning}
        className={`px-8 py-3 text-lg font-semibold rounded-full transition
          ${
            spinning
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-300"
          }`}
      >
        {spinning ? "Spinning..." : "SPIN NOW"}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-8 text-2xl font-bold text-center animate-bounce">
          🍹 {result} 🍺
        </div>
      )}
    </div>
  );
}
