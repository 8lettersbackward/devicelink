"use client";

import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { Menu, X, User as UserIcon, Hexagon } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const currentEmailPrefix = user?.email ? user.email.split('@')[0] : "User";
  const currentName = user?.displayName || currentEmailPrefix;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 text-primary group">
              <Hexagon className="h-6 w-6 transition-transform group-hover:rotate-12" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none mb-0.5">{currentName}</span>
                   <Link href="/dashboard" className="text-[8px] font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors opacity-70">
                    Control Hub
                  </Link>
                </div>
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
              <div className="px-2 py-2 border-b border-dashed mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{currentName}</p>
              </div>
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
