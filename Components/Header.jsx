"use client";
import React from "react";
import Link from "next/link";
import Logo from "./Logo.png"
import Image from "next/image";

function Header() {

  return (
    <div className="sticky top-0 left-0 right-0 z-40">
      <div className="w-full flex justify-start items-center bg-black py-5 px-10">
          <Link href="/">
          <Image src= {Logo} className="cursor-pointer m-5" width={200} height={100} alt="Logo" />
          </Link>
        </div>
    </div>
  );
}

export default Header;
