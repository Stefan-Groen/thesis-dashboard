import Link from "next/link"
import { IconArrowRight, IconBrandGithub, IconFileText, IconBrandLinkedin, IconShield, IconBolt, IconEye } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Shark SVG Component
function SharkIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shark body */}
      <path
        d="M45 32C45 28 42 24 38 22C34 20 30 20 26 22C22 24 19 28 19 32C19 36 22 40 26 42C30 44 34 44 38 42C42 40 45 36 45 32Z"
        fill="#0EA5E9"
        className="text-blue-500"
      />
      {/* Dorsal fin */}
      <path
        d="M32 18L28 28L36 28Z"
        fill="#0284C7"
        className="text-blue-600"
      />
      {/* Tail */}
      <path
        d="M18 32C18 32 14 28 12 32C14 36 18 32 18 32Z"
        fill="#0284C7"
        className="text-blue-600"
      />
      {/* Eye */}
      <circle cx="36" cy="28" r="2" fill="white" />
      <circle cx="36" cy="28" r="1" fill="#1E293B" />
      {/* Teeth */}
      <path
        d="M28 34L30 36L28 36Z M32 34L34 36L32 36Z M36 34L38 36L36 36Z"
        fill="white"
      />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 p-6 shadow-xl">
                <SharkIcon />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2">
                <IconBolt className="size-6 text-white" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white bg-clip-text">
              SignalShark
            </h1>
            <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
              AI-Powered Intelligence Dashboard
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Navigate the ocean of information with precision
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full">
              <IconEye className="size-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Threat Detection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-full">
              <IconBolt className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              <IconShield className="size-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Smart Classification</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button size="lg" className="w-full text-base py-6">
              Go to Dashboard
              <IconArrowRight className="ml-2 size-5" />
            </Button>
          </Link>

          <a
            href="https://github.com/Stefan-Groen/thesis-classifier"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="lg" variant="outline" className="w-full text-base py-6">
              <IconBrandGithub className="mr-2 size-5" />
              GitHub Repository
            </Button>
          </a>

          <a
            href="https://drive.google.com/file/d/1VP-katLsR3I07dTy8LLeXDfBUjHFFNgz/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="lg" variant="outline" className="w-full text-base py-6">
              <IconFileText className="mr-2 size-5" />
              Read Thesis
            </Button>
          </a>

          <a
            href="https://www.linkedin.com/in/stefan-groen-557223265/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="lg" variant="outline" className="w-full text-base py-6">
              <IconBrandLinkedin className="mr-2 size-5" style={{ color: '#0077B5' }} />
              Connect on LinkedIn
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Stefan Groen • Built with Next.js and AI
          </p>
        </div>
      </div>
    </div>
  )
}
