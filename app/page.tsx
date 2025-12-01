import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-[var(--font-inter)]">
      {/* Header */}
      <header className="w-full flex justify-center">
        <div className="w-[1280px] px-16 py-6 inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2">
            <img className="w-8 h-8" src="/small_logo.png" alt="Logo Icon" />
            <img className="w-24 h-8" src="/small_logo_name.png" alt="SignalShark" />
          </div>
          <div className="flex justify-start items-center gap-8">
            <Link href="#product" className="text-center justify-center text-black text-base font-medium leading-6">
              Product
            </Link>
            <Link href="#contact" className="text-center justify-center text-black text-base font-medium leading-6">
              Contact
            </Link>
            <Link href="#pricing" className="text-center justify-center text-black text-base font-medium leading-6">
              Pricing
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full flex justify-center">
        <div className="w-[1280px] px-16 inline-flex justify-center items-center overflow-hidden">
          <div className="flex-1 px-8 py-10 inline-flex flex-col justify-center items-start gap-8">
            <div className="self-stretch flex flex-col justify-center items-start gap-6">
              <div className="self-stretch justify-center">
                <span className="text-black text-5xl font-bold leading-[55px]">Navigate the<br/></span>
                <span className="text-[#1d6ee8] text-5xl font-bold leading-[55px]">Ocean</span>
                <span className="text-black text-5xl font-bold leading-[55px]"> of information</span>
              </div>
              <div className="w-96 justify-center text-black/60 text-2xl font-medium leading-9">Improve your supply chain with AI </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-4 flex-wrap content-center">
              <Link href="/dashboard" className="px-4 py-3 bg-[#1d6ee8] rounded-xl flex justify-center items-center gap-2">
                <div className="text-center justify-center text-white text-lg font-medium leading-7">Go to dashboard</div>
              </Link>
              <a href="mailto:contact@signalshark.com" className="px-4 py-3 rounded-xl outline outline-2 outline-offset-[-2px] outline-black/20 flex justify-center items-center gap-2">
                <div className="justify-center text-black text-lg font-medium leading-7">Get in Contact</div>
              </a>
            </div>
          </div>
          <div className="flex-1 pl-16 py-20 inline-flex flex-col justify-start items-start gap-2">
            <div className="w-[826px] h-[537px] bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.08)] shadow-[0px_2px_12.800000190734863px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-black/20 flex flex-col justify-start items-start overflow-hidden">
              <div className="self-stretch h-10 relative bg-white border-b border-black/20">
                <div className="left-[16px] top-[15px] absolute inline-flex justify-start items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-lime-400 rounded-full" />
                </div>
              </div>
              <img className="w-[958px] h-[497px]" src="/screenshot_dashboard.png" alt="Dashboard Preview" />
            </div>
          </div>
        </div>
      </section>

      {/* How SignalShark Works Section */}
      <section className="w-full flex justify-center">
        <div className="w-[1280px] px-16 py-12 inline-flex flex-col justify-start items-start gap-12">
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch justify-center">
              <span className="text-black text-5xl font-bold leading-[57.60px]">Here is how </span>
              <span className="text-[#1d6ee8] text-5xl font-bold leading-[57.60px]">SignalShark</span>
              <span className="text-black text-5xl font-bold leading-[57.60px]"> Works ...</span>
            </div>
            <div className="self-stretch justify-center text-black/60 text-xl font-medium leading-7">Almost like magic</div>
          </div>
          <div className="self-stretch pl-8 inline-flex justify-center items-center gap-8">
            <div className="w-80 h-72 max-w-96 min-w-80 min-h-72 p-8 bg-white rounded-2xl shadow-[0px_12px_32px_0px_rgba(0,0,0,0.04)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.02)] outline outline-1 outline-offset-[-1px] outline-black/10 inline-flex flex-col justify-between items-start overflow-hidden">
              <div className="self-stretch inline-flex justify-start items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1d6ee8]">1</span>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                  <div className="self-stretch justify-center text-black text-base font-semibold leading-6">Scan News Sources</div>
                  <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">For new articles</div>
                </div>
              </div>
              <div className="self-stretch justify-start text-black text-lg font-medium leading-7">Happens automatically, sit back  and relax</div>
            </div>
            <div className="w-80 h-72 max-w-96 min-w-80 min-h-72 p-8 bg-white rounded-2xl shadow-[0px_12px_32px_0px_rgba(0,0,0,0.04)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.02)] outline outline-1 outline-offset-[-1px] outline-black/10 inline-flex flex-col justify-between items-start overflow-hidden">
              <div className="self-stretch inline-flex justify-start items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1d6ee8]">2</span>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                  <div className="self-stretch justify-center text-black text-base font-semibold leading-6">Classify New Articles</div>
                  <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Threats or Opportunties?</div>
                </div>
              </div>
              <div className="w-64 justify-center text-black text-lg font-medium leading-7">Uses Artificial Intelligence to classify tailored to your company</div>
            </div>
            <div className="w-80 h-72 max-w-96 min-w-80 min-h-72 p-8 bg-white rounded-2xl shadow-[0px_12px_32px_0px_rgba(0,0,0,0.04)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.02)] outline outline-1 outline-offset-[-1px] outline-black/10 inline-flex flex-col justify-between items-start overflow-hidden">
              <div className="self-stretch inline-flex justify-start items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1d6ee8]">3</span>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                  <div className="self-stretch justify-center text-black text-base font-semibold leading-6">Results</div>
                  <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">In the dashboard</div>
                </div>
              </div>
              <div className="w-64 justify-center text-black text-lg font-medium leading-7">Easy to use and clear dashboard displaying results</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Heavy Lifting Section */}
      <section className="w-full flex justify-center">
        <div className="w-[1280px] py-12 inline-flex justify-center items-center gap-12">
          <div className="text-center justify-center">
            <span className="text-black text-4xl font-bold leading-10">Let AI do the </span>
            <span className="text-[#1d6ee8] text-4xl font-bold leading-10">heavy Lifting</span>
            <span className="text-black text-4xl font-bold leading-10"> for you</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex justify-center">
        <div className="w-[1280px] px-16 pb-28 inline-flex justify-center items-center gap-24 overflow-hidden">
          <div className="flex-1 py-20 border-t border-black/10 flex justify-start items-start gap-28">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-14">
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="w-24 inline-flex justify-start items-center gap-2">
                  <div className="w-36 h-16 text-center justify-center text-black text-2xl font-semibold leading-9">SignalShark</div>
                </div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Navigate the ocean of information</div>
              </div>
              <div className="inline-flex justify-start items-center gap-6">
                <div className="w-6 h-6 relative overflow-hidden">
                  <div className="w-6 h-6 left-0 top-0 absolute bg-black/40" />
                </div>
                <div className="w-6 h-6 relative overflow-hidden">
                  <div className="w-6 h-6 left-0 top-0 absolute bg-white" />
                </div>
                <div className="w-6 h-6 relative overflow-hidden">
                  <div className="w-6 h-5 left-0 top-[1.15px] absolute bg-black/40" />
                </div>
              </div>
            </div>
            <div className="flex justify-start items-start gap-10">
              <div className="w-32 inline-flex flex-col justify-center items-start gap-2">
                <div className="self-stretch pb-4 inline-flex justify-start items-start">
                  <div className="justify-center text-black text-base font-semibold leading-6">Features</div>
                </div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Core features</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Pro experience</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Integrations</div>
              </div>
              <div className="w-32 inline-flex flex-col justify-center items-start gap-2">
                <div className="self-stretch pb-4 inline-flex justify-start items-start">
                  <div className="justify-center text-black text-base font-semibold leading-6">Learn more</div>
                </div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Blog</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Case studies</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Customer stories</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Best practices</div>
              </div>
              <div className="w-32 inline-flex flex-col justify-center items-start gap-2">
                <div className="self-stretch pb-4 inline-flex justify-start items-start">
                  <div className="justify-center text-black text-base font-semibold leading-6">Support</div>
                </div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Contact</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Support</div>
                <div className="self-stretch justify-center text-black/60 text-base font-medium leading-6">Legal</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
