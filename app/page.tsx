import Link from "next/link"
import { IconSparkles, IconArrowRight, IconBrandGithub, IconFileText, IconBrandLinkedin } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 p-4">
              <IconSparkles className="size-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Article Classifier
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              AI-Powered Intelligence Dashboard
            </p>
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
