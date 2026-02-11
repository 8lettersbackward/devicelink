
"use client";

import { useUser, useFirestore, useAuth, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { updatePassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, User as UserIcon, Shield, Bell, LogOut, IdCard, Mail, Camera, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  // Fetch profile data from Firestore for persistence
  const profileRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profileData, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
    if (user && !profileLoading && profileData) {
      setDisplayName(profileData.displayName || user.displayName || "");
      setAvatarUrl(profileData.avatarUrl || user.photoURL || "");
    }
  }, [user, userLoading, profileData, profileLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setUpdating(true);
    
    try {
      // Update Firebase Auth Profile
      await updateProfile(user, { 
        displayName: displayName,
        photoURL: avatarUrl 
      });

      // Update Firestore Profile Document
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName,
        email: user.email,
        avatarUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({ 
        title: "Profile Synchronized", 
        description: `Identity updated to: ${displayName || 'Default Node'}` 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: error.message 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setUpdating(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      toast({ 
        title: "Password Rotated", 
        description: "Your access keys are now updated." 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Security Update Failed", 
        description: "Please re-authenticate to verify ownership." 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => router.push("/login"));
  };

  if (userLoading || profileLoading) return (
     <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-1 bg-primary w-24 mb-4"></div>
        <p className="text-[10px] uppercase tracking-widest font-bold">Accessing Vault</p>
      </div>
    </div>
  );

  if (!user) return null;

  const currentDisplayName = profileData?.displayName || user.displayName || "Anonymous Node";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-background min-h-screen">
      <Button 
        variant="ghost" 
        onClick={() => router.push("/dashboard")} 
        className="mb-8 p-0 h-auto hover:bg-transparent text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 group transition-all"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Back to Hub
      </Button>

      <header className="mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase mb-2">Account Hub</h1>
        <p className="text-muted-foreground text-sm tracking-wide uppercase">System identification and security protocols.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <aside className="space-y-4">
          <div className="p-8 border-2 border-dashed bg-muted/5 flex flex-col items-center text-center mb-6">
            <Avatar className="h-24 w-24 rounded-none border-2 border-primary mb-4">
              <AvatarImage src={avatarUrl} alt={currentDisplayName} />
              <AvatarFallback className="rounded-none bg-primary text-primary-foreground text-2xl font-bold">
                {currentDisplayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs font-bold uppercase tracking-widest truncate w-full">{currentDisplayName}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-1 truncate w-full">{user.email}</p>
          </div>

          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase text-[10px] tracking-widest">
              <UserIcon className="h-4 w-4" /> Identification
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-none hover:bg-muted font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
              <Shield className="h-4 w-4" /> Security
            </Button>
            <Separator className="my-4 border-dashed" />
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-none text-destructive hover:bg-destructive/10 font-bold uppercase text-[10px] tracking-widest" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Terminate Session
            </Button>
          </nav>
        </aside>

        <div className="md:col-span-2 space-y-10">
          <Card className="border-none shadow-none bg-muted/20 rounded-none">
            <CardHeader>
              <CardTitle className="text-sm uppercase font-bold tracking-[0.2em]">Identification Profile</CardTitle>
              <CardDescription className="text-xs uppercase">Core system identity settings.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <IdCard className="h-3 w-3" /> Unique ID
                    </Label>
                    <Input value={user.uid} disabled className="bg-muted/40 border-none rounded-none h-11 font-mono text-[10px]" />
                    <p className="text-[8px] text-muted-foreground uppercase">Permanent system identifier.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Master Email
                    </Label>
                    <Input value={user.email || ""} disabled className="bg-muted/40 border-none rounded-none h-11 font-mono text-[10px]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-[10px] font-bold uppercase tracking-widest">Display Name / Identity</Label>
                  <Input 
                    id="display-name" 
                    placeholder="e.g. Elvin" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    className="bg-background border-none rounded-none h-12 uppercase text-[10px] font-bold tracking-widest"
                  />
                  <p className="text-[8px] text-muted-foreground uppercase">This name will be displayed across your control hub.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar-url" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Camera className="h-3 w-3" /> Avatar Resource URL
                  </Label>
                  <Input 
                    id="avatar-url" 
                    placeholder="https://..." 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)} 
                    className="bg-background border-none rounded-none h-12 text-[10px] font-mono"
                  />
                  <p className="text-[9px] text-muted-foreground uppercase italic tracking-wider">Provide a remote link to your identification image.</p>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-dashed">
                <Button type="submit" disabled={updating} className="w-full rounded-none h-14 uppercase font-bold tracking-[0.2em] text-xs">
                  {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Synchronize Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border-none shadow-none bg-muted/20 rounded-none">
            <CardHeader>
              <CardTitle className="text-sm uppercase font-bold tracking-[0.2em]">Security Protocol</CardTitle>
              <CardDescription className="text-xs uppercase">Rotate your access credentials.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-[10px] font-bold uppercase tracking-widest">New System Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="bg-background border-none rounded-none h-12"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-dashed">
                <Button type="submit" variant="outline" disabled={updating || !newPassword} className="w-full rounded-none h-12 uppercase font-bold tracking-[0.2em] text-[10px]">
                  Rotate Access Keys
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
