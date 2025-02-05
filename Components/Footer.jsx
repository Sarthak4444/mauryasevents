"use client";
import React from "react";
import Link from "next/link";
import Pattern from "./Pattern.png"
import Image from "next/image";

function Footer() {

  return (
    <div className="py-10 bg-black text-white p-8">
      <div className="flex flex-col p-10 justify-center items-center">
        <Image
          src={Pattern}
          alt="Pattern"
          width={200}
          height={200}
        />
        <div className="text-left w-full flex gap-5 ml-10 -mt-4">
          <Link className="text-sm underline pr-10" href="/terms-and-conditions">
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
