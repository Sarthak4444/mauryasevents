
import "./globals.css";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

export const metadata = {
  title: "Maurya's Private Dining",
  description:
    "Welcome to Maurya's Private Dining, where exquisite flavors meet exceptional ambiance. Explore our menu, reserve a table, and enjoy an unforgettable dining experience.",
  keywords:
    "restaurant, dining, fine dining, family dining, best restaurant, Maurya's, food and drinks, table reservations",
  openGraph: {
    title: "Maurya's Private Dining",
    description:
      "Experience the perfect blend of flavors and ambiance at Maurya's Private Dining. Browse our menu and reserve your table today!",
    url: "https://www.mauryascuisine.com",
    siteName: "Maurya's Private Dining",
    locale: "en_US",
    type: "website",
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
         <Header />
        {children} 
         <Footer />
      </body>
    </html>
  );
}
