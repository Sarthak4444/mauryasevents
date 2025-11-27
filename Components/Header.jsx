"use client";
import React from "react";
import Link from "next/link";
import Logo from "./Logo.png"
import Image from "next/image";

function Header() {

  return (
    <div className="sticky top-0 left-0 right-0 z-40">
      <div className="w-full flex justify-start items-center h-5 mb-5 bg-black py-5 px-10">
        <div className="text-3xl my-4 text-black">000000<br><br><br><br>00000</div>
           {/*<Link href="/">
          <Image src= {Logo} width={150} height={100} alt="Logo" />
          </Link>
          */}
        </div>
    </div>
  );
}

export default Header;
