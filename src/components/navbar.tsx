
"use client";

import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-headline font-bold tracking-[0.2em] text-primary">
              MONOCHROME
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors">
                  Control Hub
                </Link>
                <div className="h-4 w-[1px] bg-border" />
                <Link href="/profile">
                   <Button variant="ghost" size="icon" className="rounded-none">
                     <UserIcon className="h-4 w-4" />
                   </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-none text-[10px] font-bold uppercase px-4">
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm" className="rounded-none text-[10px] font-bold uppercase px-6">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b px-4 pb-6 pt-2 space-y-4">
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-xs font-bold uppercase tracking-widest">Control Hub</Link>
              <Link href="/profile" className="block py-2 text-xs font-bold uppercase tracking-widest">Profile</Link>
              <button onClick={handleSignOut} className="w-full text-left py-2 text-xs font-bold uppercase tracking-widest text-destructive">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-xs font-bold uppercase tracking-widest">Sign In</Link>
              <Link href="/signup" className="block py-2 text-xs font-bold uppercase tracking-widest text-primary">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
