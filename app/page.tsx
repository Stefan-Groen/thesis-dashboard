import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-12 text-center">
        {/* SignalShark Logo - Image */}
        <div className="flex justify-center">
          <Image
            src="/signalshark-logo.png"
            alt="SignalShark"
            width={800}
            height={200}
            className="w-auto h-32 md:h-40 lg:h-48"
            priority
          />
        </div>

        {/* Orange Tagline */}
        <div className="flex justify-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#FEAF2F]">
            Navigate the ocean of information
          </h2>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          {/* Get in Contact - Outlined */}
          <a href="mailto:contact@signalshark.com">
            <Button
              size="lg"
              variant="outline"
              className="w-64 text-lg py-6 rounded-full border-2 border-[#FEAF2F] text-[#FEAF2F] hover:bg-[#FEAF2F]/10 font-bold uppercase tracking-wide"
            >
              Get in Contact
            </Button>
          </a>

          {/* Login - Filled Orange */}
          <Link href="/dashboard">
            <Button
              size="lg"
              className="w-64 text-lg py-6 rounded-full bg-[#FEAF2F] hover:bg-[#FEC45F] text-white font-bold uppercase tracking-wide"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
