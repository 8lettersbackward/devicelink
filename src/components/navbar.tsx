
"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-headline tracking-tighter text-primary">
              MONOCHROME
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-sm font-medium hover:text-muted-foreground transition-colors">
              Dashboard
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile">
                   <Button variant="ghost" size="icon">
                     <UserIcon className="h-5 w-5" />
                   </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b px-4 pb-4 pt-2 space-y-2">
          <Link href="/dashboard" className="block py-2 text-base font-medium">Dashboard</Link>
          {user ? (
            <>
              <Link href="/profile" className="block py-2 text-base font-medium">Profile</Link>
              <button onClick={handleSignOut} className="w-full text-left py-2 text-base font-medium">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-base font-medium">Log In</Link>
              <Link href="/signup" className="block py-2 text-base font-medium text-primary">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
