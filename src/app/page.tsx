"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 bg-background">
        <div className="max-w-4xl text-center">
          <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            1TAP <br /> <span className="text-muted-foreground">DEVICE HUB</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Instant orchestration for your hardware ecosystem. Pure clarity, absolute control in a single tap.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link href="/signup">
              <Button size="lg" className="px-10 h-14 text-lg font-bold rounded-none">
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-10 h-14 text-lg font-bold rounded-none">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="py-8 border-t text-center text-muted-foreground text-xs tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2024 1tap. Clarity in Control.</p>
        </div>
      </footer>
    </div>
  );
}
