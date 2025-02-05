"use client";
import React from "react";
import Link from "next/link";
import Pattern from "./Pattern.png"
import Image from "next/image";

function Footer() {

  return (
    <div className="py-10 bg-black text-white">
      <div className="flex flex-col gap-6 md:gap-10 p-10 justify-center items-center">
        <Image
          src={Pattern}
          alt="Pattern"
          width={200}
          height={200}
        />
        <div className="text-left w-full">
          <Link className="text-sm underline mr-8" href="/terms-and-conditions">
            Terms & Conditions 
          </Link>
          <Link className="text-sm underline" href="/privacy-policy">
            Privacy Policy
          </Link>
        
        </div>
      </div>
    </div>
  );
}

export default Footer;
