"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Pattern from "/Images/Pattern.png";

function Footer() {

  return (
    <div className="py-10 bg-black text-white">
      <div className="flex md:flex-row flex-col gap-6 md:gap-10 justify-center items-center">
        <Image
          src={Pattern}
          alt="Pattern"
          loading="lazy"
          width={200}
          height={200}
          className="w-[120px] md:w-[200px] h-auto"
        />
        <div className="flex text-center md:text-left flex-col gap-3 md:gap-6">
          <Link className="text-sm underline" href="/terms-and-conditions">
            Terms & Conditions
          </Link>
          <Link className="text-sm underline" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="text-sm underline" href="/reservations-and-dining-discreations">
            Reservations and Dining Discreations
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;
