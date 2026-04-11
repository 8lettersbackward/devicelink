"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth, useUser, useDatabase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!userLoading && user) {
      if (user.emailVerified) {
        router.push("/dashboard");
      } else {
        router.push("/verify-email");
      }
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;
      
      if (!loggedUser.emailVerified) {
        toast({
          variant: "destructive",
          title: "Identity Unverified",
          description: "Please confirm your email signature.",
        });
        router.push("/verify-email");
        return;
      }

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Verification failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6">
      <Card className="neo-flat w-full max-w-md p-6 sm:p-10 space-y-6 sm:space-y-8">
        <CardHeader className="space-y-4 text-center p-0">
          <div className="flex justify-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 neo-flat flex items-center justify-center mb-2">
              <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight uppercase text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-[9px] sm:text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase mt-2">Enter credentials to access hub</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
          <CardContent className="space-y-5 sm:space-y-6 p-0">
            <div className="space-y-2">
              <Label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</Label>
              <Input
                type="email"
                placeholder="name@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 sm:h-14 neo-inset bg-background text-foreground placeholder:text-muted-foreground/40 px-5 sm:px-6"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</Label>
                <Link href="/forgot-password" title="Forgot Password" className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-primary">
                  Lost Code?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 sm:h-14 neo-inset bg-background text-foreground pr-12 sm:pr-14 px-5 sm:px-6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 sm:space-y-8 p-0">
            <Button type="submit" className="w-full h-14 sm:h-16 neo-btn bg-background text-foreground hover:text-primary text-[11px] sm:text-sm font-bold uppercase tracking-[0.2em]" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
            <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-bold uppercase tracking-widest">
              No Account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Enlist
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
