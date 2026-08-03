import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProgressIndicator } from '@/components/order/progress-indicator';

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-dark flex flex-col justify-between">
      {/* Top Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="container max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <span className="text-xs font-bold tracking-tight text-white">
            Project Cheesecake Senior Sleepover
          </span>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <ProgressIndicator />
        </div>
      </header>

      {/* Main Order Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-muted-foreground">
        <p>Project Cheesecake Senior Sleepover 2026 • Food Ordering Portal</p>
      </footer>
    </div>
  );
}
