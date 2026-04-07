
"use client";

import Link from "next/link";
import { useUser, useAuth, useDatabase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { Menu, X, User as UserIcon, Hexagon, Radar, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user && rtdb) {
      const profileRef = ref(rtdb, `users/${user.uid}/profile`);
      get(profileRef).then(snapshot => {
        const profile = snapshot.val();
        setUserRole(profile?.role || 'user');
      });
    } else {
      setUserRole(null);
    }
  }, [user, rtdb]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const currentEmailPrefix = user?.email ? user.email.split('@')[0] : "User";
  const currentName = user?.displayName || currentEmailPrefix;

  return (
    <nav className="fixed top-0 w-full z-50 neo-blur border-b border-primary/5 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 text-primary group">
              <Hexagon className="h-7 w-7 transition-transform group-hover:rotate-45" fill="currentColor" fillOpacity={0.2} />
              <span className="font-bold tracking-tighter text-2xl uppercase text-foreground">1TAP</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            {user ? (
              <div className="flex items-center space-x-8">
                {userRole === 'guardian' && (
                  <Link href="/dashboard?view=guardian">
                    <Button variant="ghost" className="text-secondary hover:bg-secondary/10 gap-2 text-[10px] font-bold uppercase tracking-widest h-10 px-4 rounded-xl">
                      <Radar className="h-4 w-4" /> Track
                    </Button>
                  </Link>
                )}
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2 mb-1">
                     {userRole === 'guardian' && <ShieldAlert className="h-3 w-3 text-secondary" />}
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none">{currentName}</span>
                   </div>
                   <Link href="/dashboard" className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                    TERMINAL
                  </Link>
                </div>
                <div className="h-6 w-[1px] bg-primary/10" />
                <Link href="/profile">
                   <Button variant="ghost" size="icon" className="hover:bg-primary/5 text-primary rounded-xl">
                     <UserIcon className="h-5 w-5" />
                   </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-primary/10 rounded-2xl text-muted-foreground hover:bg-primary/5 text-[10px] font-bold uppercase px-6 h-10 tracking-widest">
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-secondary text-[10px] font-bold uppercase px-10 h-11 rounded-2xl tracking-[0.2em] shadow-lg shadow-primary/20 text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-foreground">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full h-[calc(100vh-64px)] bg-white z-[60] p-8 space-y-10 animate-in fade-in slide-in-from-top-4 duration-300 overflow-y-auto">
          {user ? (
            <>
              <div className="pb-8 border-b border-primary/5">
                <div className="flex items-center gap-3">
                  {userRole === 'guardian' && <ShieldAlert className="h-5 w-5 text-secondary" />}
                  <p className="text-lg font-bold uppercase tracking-widest text-primary">{currentName}</p>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-3">{user.email}</p>
              </div>
              <div className="space-y-6">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.3em] text-foreground hover:text-primary transition-colors">TERMINAL</Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.3em] text-foreground hover:text-primary transition-colors">PROFILE</Link>
                {userRole === 'guardian' && (
                  <Link href="/dashboard?view=guardian" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.3em] text-secondary hover:text-secondary/80 transition-colors">TACTICAL TRACK</Link>
                )}
              </div>
              <div className="pt-8 border-t border-primary/5">
                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full text-left text-sm font-bold uppercase tracking-[0.3em] text-destructive flex items-center gap-2">
                  TERMINATE SESSION
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-8 flex flex-col pt-4">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.3em] text-foreground">SIGN IN</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-[0.3em] text-primary">GET STARTED</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
