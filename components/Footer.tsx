export default function Footer() {
    return (
      <footer className="w-full border-t border-white/10 mt-20 py-10 text-white/60">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left side */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-white/80">SignalShark</h3>
            <p className="text-sm mt-1">Navigate the ocean of information.</p>
          </div>
  
          {/* Center links */}
          <div className="flex gap-6 text-sm">
            <a href="/features" className="hover:text-white transition">Features</a>
            <a href="/pricing" className="hover:text-white transition">Pricing</a>
            <a href="/dashboard" className="hover:text-white transition">Dashboard</a>
            <a href="/contact" className="hover:text-white transition">Contact</a>
          </div>
  
          {/* Right side */}
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} SignalShark. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  