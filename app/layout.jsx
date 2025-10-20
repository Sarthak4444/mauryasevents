
import "./globals.css";

export const metadata = {
  title: "Maurya's Events - Halloween",
  description:
    "Welcome to Maurya's Events - Halloween, get your tickets now!",
  keywords:
    "halloween, tickets, events, maurya's, restaurant, dining, fine dining, family dining, tapas, cocktails, champagne, beer, beers, brewery, best cocktail bar, kamloops, mixology, best restaurant, Maurya's, food and drinks, table reservations",
  openGraph: {
    title: "Maurya's Events - Halloween",
    description:
      "Welcome to Maurya's Events - Halloween, get your tickets now!",
    url: "https://www.mauryasevents.com",
    siteName: "Maurya's Events - Halloween",
    locale: "en_US",
    type: "website",
    // images: [
    //   {
    //     url: "https://mauryasevents.com/Item.png",
    //     width: 800,
    //     height: 600,
    //     alt: "Maurya's Events - Halloween",
    //   },
    // ],  
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
