import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbarglass } from "@/components/Navbarglass";
import "./globals.css";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import CircularTextWrapper from "@/components/CircularTextWrapper";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar on TOP (make sure inside Navbarglass you use z-50) */}
      <Navbarglass />

      {/* 1440px Figma container */}
      <div className="relative w-full max-w-[1440px] mx-auto min-h-screen z-10">
        {/* Bubbles behind everything */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-visible">
          <div className="hero-bubble hero-bubble-two" />
          <div className="hero-bubble hero-bubble-three" />
          <div className="hero-bubble hero-bubble-one" />
          <div className="hero-bubble hero-bubble-four" />
        </div>

        {/* Vignette above bubbles, below content, wider than frame */}
        <div
          className="
            hero-vignette
            pointer-events-none
            absolute top-0 left-1/2 -translate-x-1/2
            w-[1600px] h-full
            z-10
          "
        />
        

        {/* Hero content above vignette + bubbles */}
        <section className="relative z-20 pt-40 pb-24 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl leading-20 text-white/80 text-center font-bold text-shadow-hero">
            Navigate the Ocean <br /> of Information
          </h1>

          <p className="mt-4 max-w-xl text-base md:text-lg text-white/70">
            SignalShark helps you analyze trends, automate insights, and monitor
            the metrics that matter.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <Link href={'/dashboard'}>
              <Button size={'lg'} className="cursor-pointer">Go to dashboard</Button>
            </Link>
            <Link href={'features'}>
              <Button
                variant="outline"
                className="cursor-pointer border-white/30 bg-transparent text-white hover:bg-white/10 gap-1 flex items-center align-middle"
                size={'lg'}
                
              >
                Learn more
                <ChevronRight></ChevronRight>
              </Button>
            </Link>  
          </div>

          {/* Dashboard preview */}
          <div
            id="dashboard"
            className="relative mt-20 w-full max-w-5xl rounded-3xl bg-[#050308] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <Image
              src="/ss_dashboard.png"
              alt="SignalShark dashboard"
              width={1600}
              height={900}
              className="h-auto w-full"
              priority
            />
            {/* Vignette overlay */}
            <div className="absolute inset-0 bg-[#535353]/25 pointer-events-none"/>

          </div>
        </section>
      </div>
    </main>
  );
}
