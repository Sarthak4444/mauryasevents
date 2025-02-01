"use client";
import React from "react";
import Link from "next/link";
import Pattern from "./Pattern.png"
import Image from "next/image";

function Footer() {

  return (
    <div className="py-10 bg-black text-white">
      <div className="flex md:flex-row flex-col gap-6 md:gap-10 p-10 justify-center items-center">
        <Image
          src={Pattern}
          alt="Pattern"
          width={150}
          height={150}
        />
        <div className="flex text-center md:text-left flex-col gap-8 md:gap-16">
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
