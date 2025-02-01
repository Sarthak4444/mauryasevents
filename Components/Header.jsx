"use client";
import React from "react";
import Logo from "../Public/Images/Logo.png";
import Image from "next/image";
import Link from "next/link";

function Header() {

  return (
    <div className="sticky top-0 left-0 right-0 z-40">
      <div className="w-full flex justify-between items-center md:px-14 px-5 py-5 bg-black">
        <div>
          <Link href="/">
            <Image
              loading="lazy"
              src={Logo}
              alt="Logo"
              className="w-28 h-auto sm:w-36"
            />
          </Link>
        </div>
        <div>
          <button
            className="bg-black p-2 md:p-4 px-4 md:px-10 font-semibold border-[1px] border-[#d88728] text-white hover:bg-[#d88728] transition-all duration-400"
          >
            RESERVE NOW
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
