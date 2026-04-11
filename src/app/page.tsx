"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldAlert, Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden relative">
      <section className="flex-1 flex items-center justify-center px-6 sm:px-10 relative z-10 py-16 md:py-24">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="flex justify-center">
            <div className="h-20 w-20 md:h-24 md:w-24 neo-flat flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none">
              1TAP <br className="sm:hidden" /> <span className="opacity-40 uppercase tracking-[0.05em] sm:tracking-[0.1em] text-foreground">SECURE</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-md mx-auto font-medium leading-relaxed px-4">
              Professional safety orchestration. <br className="hidden sm:block" /> Precision neomorphic protection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center pt-8 max-w-sm sm:max-w-none mx-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:px-12 h-14 md:h-16 text-[11px] md:text-sm font-bold uppercase neo-btn bg-background text-foreground hover:text-primary tracking-[0.2em]">
                ENLIST <ArrowRight className="ml-3 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full sm:px-12 h-14 md:h-16 text-[11px] md:text-sm font-bold uppercase neo-btn bg-background text-foreground tracking-[0.2em]">
                SIGN IN
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 md:py-12 text-center text-muted-foreground font-bold text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2024 1TAP SECURE. NEOMORPHIC HUB v2.0</p>
        </div>
      </footer>
    </div>
  );
}
