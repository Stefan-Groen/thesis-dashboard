import Link from "next/link"
import { IconBrain, IconChartLine, IconRocket, IconShieldCheck, IconArrowRight, IconSparkles } from "@tabler/icons-react"
import { AnimatedStars } from "@/components/animated-stars"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated Stars Background */}
      <AnimatedStars />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconSparkles className="size-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Article Classifier</span>
            </div>
            <Link href="/login">
              <Button variant="outline" className="border-blue-400/30 bg-blue-950/30 text-white hover:bg-blue-900/50 backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-sm font-medium backdrop-blur-sm">
                <IconRocket className="size-4" />
                AI-Powered Article Classification
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Transform Articles into
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Actionable Intelligence
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Automatically classify, analyze, and monitor articles in real-time.
              Identify threats and opportunities before your competition does.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-lg shadow-blue-500/25 group">
                  Launch Dashboard
                  <IconArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-blue-400/30 bg-blue-950/30 hover:bg-blue-900/50 text-white text-lg px-8 py-6 backdrop-blur-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 pb-32">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything you need to stay ahead
              </h2>
              <p className="text-gray-400 text-lg">
                Powerful features designed for modern intelligence gathering
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              {/* Feature 1 */}
              <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-400/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <IconBrain className="size-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">AI Classification</CardTitle>
                  <CardDescription className="text-gray-400">
                    Advanced machine learning algorithms automatically categorize articles as threats, opportunities, or neutral
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-400/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <IconChartLine className="size-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Real-time Analytics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Track trends, monitor patterns, and visualize your article data with interactive charts and graphs
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-gradient-to-br from-pink-950/50 to-orange-950/50 border-pink-400/20 backdrop-blur-sm hover:border-pink-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                    <IconShieldCheck className="size-6 text-pink-400" />
                  </div>
                  <CardTitle className="text-white">Threat Detection</CardTitle>
                  <CardDescription className="text-gray-400">
                    Identify potential risks and security concerns early with intelligent threat classification and monitoring
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="bg-gradient-to-br from-green-950/50 to-teal-950/50 border-green-400/20 backdrop-blur-sm hover:border-green-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                    <IconSparkles className="size-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Smart Insights</CardTitle>
                  <CardDescription className="text-gray-400">
                    Get AI-generated summaries and explanations for each article classification decision
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 5 */}
              <Card className="bg-gradient-to-br from-orange-950/50 to-red-950/50 border-orange-400/20 backdrop-blur-sm hover:border-orange-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <IconRocket className="size-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Fast Performance</CardTitle>
                  <CardDescription className="text-gray-400">
                    Process thousands of articles quickly with our optimized classification pipeline and caching
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 6 */}
              <Card className="bg-gradient-to-br from-indigo-950/50 to-blue-950/50 border-indigo-400/20 backdrop-blur-sm hover:border-indigo-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                    <IconChartLine className="size-6 text-indigo-400" />
                  </div>
                  <CardTitle className="text-white">Custom Dashboards</CardTitle>
                  <CardDescription className="text-gray-400">
                    Personalize your workflow with starred articles, custom views, and user-uploaded content tracking
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 pb-32">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join the future of article intelligence. Start classifying and analyzing content today.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-lg shadow-blue-500/25 group">
                    Access Dashboard
                    <IconArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p>© 2025 Article Classification Dashboard. Built with Next.js and AI.</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
