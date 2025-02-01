"use client";
import React from "react";
import Link from "next/link";
import Logo from "./Logo.png"
import Image from "next/image";

function Header() {

  return (
    <div className="sticky top-0 left-0 right-0 z-40">
      <div className="w-full flex justify-start items-center md:px-14 px-5 py-5 bg-black">
        <div>
          <Link href="/">
          <Image src= {Logo} className="cursor-pointer w-28 h-auto" alt="Logo" width="112" height="250" />

          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
