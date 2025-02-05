import React from 'react'
import Menu from "./Menu.png";
import Menuu from "./Menuu.png";
import Image from "next/image";

function page() {
  return (
    <div className='w-full'>
    <Image
            src={Menu}
            alt="Menu"
            width={25000}
            height={25000}
            className="w-full h-auto"
          />
    <Image
            src={Menuu}
            alt="Menu"
            width={25000}
            height={25000}
            className="w-full h-auto"
          />
    </div>
  )
}

export default page