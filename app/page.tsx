import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbarglass } from "@/components/Navbarglass";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar (on top) */}
      <div className="relative z-50">
        <Navbarglass />
      </div>
      {/* vignete layer */}
      <div
        className="
            hero-vignette
            pointer-events-none
            absolute inset-0
            w-full h-full
            z-10
          "
      />
      {/* 1440px Container (content + background lives here) */}
      <div className="relative w-full max-w-[1440px] mx-auto z-10">
        {/* Blobs for the whole landing (hero + roadmap) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-visible">
          <div className="hero-bubble hero-bubble-two" />
          <div className="hero-bubble hero-bubble-three" />
          <div className="hero-bubble hero-bubble-one" />
          <div className="hero-bubble hero-bubble-four" />
          <div className="hero-bubble hero-bubble-5" />

          {/* Extra blobs for roadmap area */}
          <div className="hero-bubble hero-bubble-R1" />
          <div className="hero-bubble hero-bubble-R2" />
          <div className="hero-bubble hero-bubble-R3" />
          <div className="hero-bubble hero-bubble-R4" />
          <div className="hero-bubble hero-bubble-R5" />
        </div>
        {/* Actual content on top of background */}
        <div className="relative z-20">
          {/* Hero Section */}
          <section className="min-h-screen pt-40 pb-24 text-center flex flex-col items-center">
 
            <h1 className="text-4xl md:text-6xl lg:text-7xl leading-20 text-white/80 text-center font-bold text-shadow-hero">
              Navigate the Ocean <br /> of Information
            </h1>

            <p className="mt-4 max-w-xl text-base md:text-lg text-white/70">
              SignalShark helps you analyze trends, automate insights, and
              monitor the metrics that matter.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex gap-4">
              <Link href={"/dashboard"}>
                <Button size={"lg"} className="cursor-pointer">
                  Go to dashboard
                </Button>
              </Link>

              <Link href={"features"}>
                <Button
                  variant={"outline"}
                  className="cursor-pointer border-white/30 bg-transparent text-white hover:bg-white/10 gap-1 flex items-center align-middle"
                  size={"lg"}
                >
                  Learn more
                  <ChevronRight />
                </Button>
              </Link>
            </div>

            {/* Dashboard preview image */}
            <div
              id="dashboard"
              className="relative mt-20 w-full max-w-5xl rounded-3xl bg-[#050308] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <Image
                src={"/ss_dashboard.png"}
                alt="SignalShark dashboard"
                width={1600}
                height={900}
                className="h-auto w-full"
                priority
              />
              <div className="absolute inset-0 bg-[#535353]/25 pointer-events-none" />
            </div>
          </section>

          {/* Roadmap Section */}
          <section className="min-h-[788px] max-h-[788px] mt-32 mb-32">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white/90">
              How SignalShark Works
            </h2>

            <div className="mt-16 max-w-5xl mx-auto">
              {/* TOP ROW (above the line) */}
              <div className="grid grid-cols-4 gap-x-10 gap-y-8">
                {/* Col 1 – Data Collection */}
                <div className="col-start-1 col-span-1">
                  <h3 className="font-semibold text-lg">Data Collection</h3>
                  <p className="mt-2 text-sm text-white/70 max-w-xs">
                    SignalShark collects news articles from different news
                    sources
                  </p>
                </div>

                {/* Col 3 – Critical Assessment */}
                <div className="col-start-3 col-span-1">
                  <h3 className="font-semibold text-lg">Critical Assessment</h3>
                  <p className="mt-2 text-sm text-white/70 max-w-xs">
                    SignalShark reviews its own work by cross-checking it with
                    other AI models
                  </p>
                </div>
              </div>

              {/* LINE + DOTS (middle) */}
              <div className="relative my-16">
                {/* Line */}
                <div className="h-px w-full bg-white/40" />

                {/* Dots */}
                <div className="absolute inset-x-0 -top-1.5 flex justify-between">
                  <span className="w-3 h-3 rounded-full bg-white shadow" />
                  <span className="w-3 h-3 rounded-full bg-white shadow" />
                  <span className="w-3 h-3 rounded-full bg-white shadow" />
                  <span className="w-3 h-3 rounded-full bg-white shadow" />
                </div>
              </div>

              {/* BOTTOM ROW (below the line) */}
              <div className="grid grid-cols-4 gap-x-10 gap-y-8">
                {/* Col 2 – Classification */}
                <div className="col-start-2 col-span-1">
                  <h3 className="font-semibold text-lg">Classification</h3>
                  <p className="mt-2 text-sm text-white/70 max-w-xs">
                    Based on your situation, SignalShark identifies threats and
                    opportunities through Artificial Intelligence
                  </p>
                </div>

                {/* Col 4 – Overview */}
                <div className="col-start-4 col-span-1">
                  <h3 className="font-semibold text-lg">Overview</h3>
                  <p className="mt-2 text-sm text-white/70 max-w-xs">
                    Everything is clearly shown in the online dashboard
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>{" "}
        {/* close content wrapper */}
      </div>{" "}
      {/* close 1440px container */}
      <Footer />
    </main>
  );
}
