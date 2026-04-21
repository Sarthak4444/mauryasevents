import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Maurya's Craft Bar & Kitchen",
  description:
    "Experience exquisite dining at Maurya's Craft Bar & Kitchen in Kamloops. Reserve your table for an unforgettable meal, perfect for any special occasion.",
  keywords:
    "maurya's, restaurant, fine dining, kamloops, craft bar, kitchen, couples dinner, romantic restaurant, special occasion dining, local restaurant",
  openGraph: {
    title: "Maurya's Craft Bar & Kitchen",
    description:
      "Enjoy an exceptional dining experience at Maurya's Craft Bar & Kitchen in Kamloops. Reserve your table for outstanding cuisine, ambiance, and service.",
    url: "https://www.mauryasevents.com",
    siteName: "Maurya's Events",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.mauryasevents.com/valentine's weekend.webp",
        width: 1920,
        height: 1080,
        alt: "Maurya's Craft Bar & Kitchen - Fine Dining Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maurya's Craft Bar & Kitchen",
    description:
      "Reserve your table at Maurya's Craft Bar & Kitchen in Kamloops for an outstanding culinary adventure.",
    images: [
      "https://www.mauryasevents.com/logo.webp",
    ],
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

        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '204595835739270');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>

      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=204595835739270&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}