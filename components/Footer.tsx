import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold text-white/80">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/80">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white">Acceptable Use</Link></li>
              <li><Link href="/dmca" className="hover:text-white">DMCA</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/80">Data</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li><Link href="/data-processing" className="hover:text-white">Data Processing & Rights</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/80">Status</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li><Link href="/api/health" className="hover:text-white">System Health</Link></li>
              <li><a href="/sitemap.xml" className="hover:text-white">Sitemap</a></li>
              <li><a href="/robots.txt" className="hover:text-white">Robots</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Verbio. All rights reserved.</p>
          <p>Verbio provides AI-assisted voice translation. Not a substitute for certified translation where legally required.</p>
        </div>
      </div>
    </footer>
  );
}


