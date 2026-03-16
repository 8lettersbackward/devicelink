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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <ShieldAlert className="h-20 w-20 text-accent animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter mb-8 text-foreground">
            1TAP <br /> <span className="text-accent uppercase">Safety Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Secure protection in a single tap. Professional safety orchestration for the modern world.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-10 h-14 text-lg font-bold bg-primary hover:bg-secondary">
                Secure My Life <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-10 h-14 text-lg font-bold border-accent text-accent hover:bg-accent/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-indigo-900/50 text-center text-muted-foreground text-[10px] tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2024 1tap. Clarity in Protection.</p>
        </div>
      </footer>
    </div>
  );
}