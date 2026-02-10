
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Shield, Zap } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-mobile");
  const feature1 = PlaceHolderImages.find(img => img.id === "feature-1");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden px-4">
        <div className="max-w-4xl text-center z-10">
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Simplicity in <br /> <span className="text-muted-foreground">Monochrome</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Experience a minimal dashboard designed for maximum productivity and zero distractions. Pure, clean, and elegant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link href="/signup">
              <Button size="lg" className="px-8 h-12 text-base font-medium">
                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base font-medium">
                Live Demo
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute -z-10 opacity-10">
           <Image
            src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1200/800"}
            alt="Hero background"
            width={1200}
            height={800}
            className="object-cover scale-150 grayscale"
            data-ai-hint="minimalist mobile"
           />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 p-8 bg-background rounded-lg border shadow-sm">
              <div className="h-12 w-12 bg-secondary flex items-center justify-center rounded-full mx-auto">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Mobile First</h3>
              <p className="text-muted-foreground">Designed specifically for the mobile professional on the go.</p>
            </div>
            <div className="space-y-4 p-8 bg-background rounded-lg border shadow-sm">
              <div className="h-12 w-12 bg-secondary flex items-center justify-center rounded-full mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Secure Access</h3>
              <p className="text-muted-foreground">Enterprise-grade security for your personal data and projects.</p>
            </div>
            <div className="space-y-4 p-8 bg-background rounded-lg border shadow-sm">
              <div className="h-12 w-12 bg-secondary flex items-center justify-center rounded-full mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">Optimized performance for a smooth, lag-free experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] w-full bg-secondary rounded-2xl overflow-hidden group">
            <Image
              src={feature1?.imageUrl || "https://picsum.photos/seed/2/600/400"}
              alt="Feature narrative"
              fill
              className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
              data-ai-hint="monochrome architecture"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-headline font-bold">Focus on What Matters</h2>
            <p className="text-lg text-muted-foreground">
              In a world full of noise, we provide a sanctuary of clarity. Our monochrome interface is proven to reduce cognitive load, letting your content and goals take center stage.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full border border-primary flex-shrink-0 mt-1" />
                <span>Distraction-free notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full border border-primary flex-shrink-0 mt-1" />
                <span>Minimalist data visualization</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full border border-primary flex-shrink-0 mt-1" />
                <span>Efficient navigation workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold mb-6">Ready to simplify your life?</h2>
          <p className="text-xl mb-10 opacity-80">Join thousands of users who have found clarity in the monochrome experience.</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="px-10 h-14 text-lg font-bold">
              Join Monochrome Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t text-center text-muted-foreground text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2024 Monochrome Mobile. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
