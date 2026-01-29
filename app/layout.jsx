
import "./globals.css";

export const metadata = {
  title: "Valentine's Day at Maurya's",
  description:
    "Celebrate Valentine's Day at Maurya's with a romantic six-course dining experience. February 13th, 14th & 15th, 2026. Reserve your table now!",
  keywords:
    "valentines day, romantic dinner, six course meal, maurya's, restaurant, fine dining, kamloops, valentine's dinner, couples dinner, romantic restaurant, special occasion dining",
  openGraph: {
    title: "Valentine's Day at Maurya's",
    description:
      "Celebrate Valentine's Day at Maurya's with a romantic six-course dining experience. February 13th, 14th & 15th, 2026. Reserve your table now!",
    url: "https://www.mauryasevents.com",
    siteName: "Maurya's Events",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.mauryasevents.com/valentine's weekend.webp",
        width: 1920,
        height: 1080,
        alt: "Valentine's Day at Maurya's - Romantic Six-Course Dining Experience",
      },
    ],  
  },
  twitter: {
    card: "summary_large_image",
    title: "Valentine's Day at Maurya's",
    description: "Celebrate Valentine's Day with a romantic six-course dining experience. February 13th, 14th & 15th, 2026.",
    images: ["https://www.mauryasevents.com/valentine's weekend.webp"],
  },
};


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css"
          integrity="sha512-5Hs3dF2AEPkpNAR7UiOHba+lRSJNeM2ECkwxUIxC1Q/FLycGTbNapWXB4tP889k5T5Ju8fs4b1P5z/iB4nMfSQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}
