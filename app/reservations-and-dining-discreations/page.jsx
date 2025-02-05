import React from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

function page() {
  return (
    <>
      <Header />
      <section className="w-full flex text-white justify-center items-center h-[80vh] bg-[url('https://mauryascuisine.com/wp-content/uploads/2024/01/web-Home-3-Banner-v2.jpg')] bg-cover bg-no-repeat bg-right md:bg-center">
        <p className="text-5xl text-center -mt-32 px-2 tracking-wide font-[600]">
          Reservations and Dining Discreations
        </p>
      </section>

      <section className="h-fit max-w-[1250px] mx-auto md:p-20 p-6 text-left ">
        <p className="text-5xl font-extrabold mb-8 tracking-wider">
          Deposit & Reservation
        </p>
        <p className="text-xl font-semibold text-left tracking-wider pr-6 leading-10 text-neutral-600 mb-8">
          A non-refundable deposit of $10 per person is required to secure
          seating, as space is limited. This deposit has no cash value and is
          non-transferable.
        </p>
        <p className="text-5xl font-extrabold mb-8 tracking-wider">
          Gift Cards
        </p>
        <p className="text-xl font-semibold text-left tracking-wider pr-6 leading-10 text-neutral-600 mb-8">
          In return for your deposit, Maurya's will provide three $5 gift cards
          per person.
        </p>
        <p className="text-5xl font-extrabold mb-8 tracking-wider">
          Gift Card Use
        </p>
        <p className="text-xl font-semibold text-left tracking-wider pr-6 leading-10 text-neutral-600 mb-8">
          The gift cards may be used for dine-in and in-house takeout orders
          only. They are not valid thru third-party online storefront providers.
        </p>
        <p className="text-5xl font-extrabold mb-8 tracking-wider">
          Gift Card Restrictions
        </p>
        <p className="text-xl font-semibold text-left tracking-wider pr-6 leading-10 text-neutral-600 mb-8">
          Each gift card can be used only once per visit, per person, and cannot
          be combined with any other gift cards or promotions.
        </p>
        <p className="text-5xl font-extrabold mb-8 tracking-wider">
          Seating Time Limit
        </p>
        <p className="text-xl font-semibold text-left tracking-wider pr-6 leading-10 text-neutral-600 mb-8">
          The seating duration is limited to 2 hours per booking. We kindly ask
          that you respect this time frame to ensure we can accommodate all
          guests.
        </p>
        <p className="text-lg font-semibold text-left tracking-wider pt-4 pr-6 leading-10 mb-8">
          By submitting your booking, you agree to abide by the above terms and
          conditions.
        </p>
      </section>
      <Footer />
    </>
  );
}

export default page;
