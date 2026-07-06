import DancePartyLanding from "../Components/DancePartyLanding";

const siteUrl = "https://www.mauryasevents.com";

export const metadata = {
  title: "Colombian Independence Night | Maurya's Kamloops – July 18",
  description:
    "Join Maurya's in Kamloops for Colombian Independence Night on Saturday, July 18th, 5–10 PM. General admission $45 includes a 3-course Colombian buffet, live cultural music, and community celebration. Kids under 12 free.",
  keywords: [
    "Colombian Independence Night",
    "Kamloops events",
    "Maurya's Craft Bar & Kitchen",
    "Colombian food Kamloops",
    "Kamloops buffet",
    "cultural event Kamloops",
    "July events Kamloops",
    "Colombian celebration",
    "family event Kamloops",
    "Maurya's events",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Colombian Independence Night at Maurya's | Kamloops",
    description:
      "Saturday, July 18th · 5–10 PM. $45 general admission includes a 3-course Colombian buffet, cultural music & community celebration. Kids under 12 free. Get tickets now.",
    url: siteUrl,
    siteName: "Maurya's Events",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/Colombian_Dance_Poster.jpeg`,
        width: 1200,
        height: 630,
        alt: "Colombian Independence Night at Maurya's Craft Bar & Kitchen, Kamloops",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colombian Independence Night at Maurya's | Kamloops",
    description:
      "July 18th · 5–10 PM. $45 admission · 3-course Colombian buffet · cultural music · kids under 12 free.",
    images: [`${siteUrl}/Colombian_Dance_Poster.jpeg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Colombian Independence Night",
  description:
    "Celebrate Colombian Independence Night at Maurya's with a 3-course buffet featuring authentic Colombian appetizers, main courses, and dessert, vibrant cultural music, and a welcoming community atmosphere.",
  startDate: "2026-07-18T17:00:00-07:00",
  endDate: "2026-07-18T22:00:00-07:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Maurya's Craft Bar & Kitchen",
    address: {
      "@type": "PostalAddress",
      streetAddress: "165 Victoria St",
      addressLocality: "Kamloops",
      addressRegion: "BC",
      postalCode: "V2C 1Z4",
      addressCountry: "CA",
    },
  },
  image: [`${siteUrl}/Colombian_Dance_Poster.jpeg`],
  organizer: {
    "@type": "Organization",
    name: "Maurya's Craft Bar & Kitchen",
    url: "https://www.mauryascuisine.com",
  },
  offers: {
    "@type": "Offer",
    url: siteUrl,
    price: "45",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    validFrom: "2026-07-05",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <DancePartyLanding />
    </>
  );
}
