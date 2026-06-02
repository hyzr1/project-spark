import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { LandingLoader } from "./components/landing-loader";
import { SmoothScroll } from "./components/smooth-scroll";
import { Ticker } from "./components/ticker";
import { Method } from "./components/method";
import { Receipts } from "./components/receipts";
import { Curriculum } from "./components/curriculum";
import { Mentor } from "./components/mentor";
import { Desk } from "./components/desk";
import { Pricing } from "./components/pricing";
import { FAQ } from "./components/faq";
import { ClosingCTA } from "./components/closing-cta";
import { Footer } from "./components/footer";

// Marketing site is the same for every visitor — pre-render at build time
// and serve from the CDN. Zero function invocations per visit.
export const dynamic = "force-static";
export const revalidate = false;

export default function Home() {
  return (
    <>
      <LandingLoader />
      <SmoothScroll />
      <Header />
      <main className="relative flex-1">
        <Hero />
        <Ticker />
        <div className="reveal"><Method /></div>
        <div className="reveal"><Receipts /></div>
        <div className="reveal"><Curriculum /></div>
        <div className="reveal"><Mentor /></div>
        <div className="reveal"><Desk /></div>
        <div className="reveal"><Pricing /></div>
        <div className="reveal"><FAQ /></div>
        <div className="reveal"><ClosingCTA /></div>
      </main>
      <Footer />
    </>
  );
}
