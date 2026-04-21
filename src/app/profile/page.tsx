
"use client";

import { useUser, useDatabase, useRtdb, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { updateProfile, signOut, updatePassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { 
  Loader2, 
  User as UserIcon, 
  LogOut, 
  IdCard, 
  Mail, 
  ArrowLeft, 
  Lock, 
  KeyRound
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const profileRef = useMemo(() => user ? ref(rtdb, `users/${user.uid}/profile`) : null, [rtdb, user]);
  const { data: profileData, loading: profileLoading } = useRtdb(profileRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
    if (user && !profileLoading && profileData) {
      setDisplayName(profileData.displayName || user.displayName || "");
    }
  }, [user, userLoading, profileData, profileLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rtdb) return;
    setUpdating(true);
    
    try {
      await updateProfile(user, { 
        displayName: displayName
      });

      const userProfileRef = ref(rtdb, `users/${user.uid}/profile`);
      await set(userProfileRef, {
        ...profileData,
        displayName,
        email: user.email,
        updatedAt: Date.now()
      });

      toast({ 
        title: "Profile Synchronized", 
        description: `Identity updated to: ${displayName || (user.email ? user.email.split('@')[0] : 'Default Node')}` 
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmNewPassword) {
      toast({ variant: "destructive", title: "Validation Error", description: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Security Alert", description: "Password must be at least 6 characters." });
      return;
    }
    
    setUpdatingPassword(true);
    try {
      await updatePassword(user, newPassword);
      toast({ 
        title: "Password Synchronized", 
        description: "Your account password has been updated successfully." 
      });
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          variant: "destructive", 
          title: "Re-authentication Required", 
          description: "For security, please sign out and sign back in to change your password." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Update Failed", 
          description: error.message 
        });
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => router.push("/login"));
  };

  if (userLoading || profileLoading) return (
     <div className="flex items-center justify-center h-[80vh] bg-background">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-[10px] uppercase tracking-widest font-black text-foreground">Accessing Vault</p>
      </div>
    </div>
  );

  if (!user) return null;

  const currentDisplayName = profileData?.displayName || user.displayName || (user.email ? user.email.split('@')[0] : "Anonymous Node");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-background min-h-screen">
      <Button 
        variant="ghost" 
        onClick={() => router.push("/dashboard")} 
        className="mb-8 p-0 h-auto hover:bg-transparent text-[10px] uppercase font-black tracking-widest flex items-center gap-2 group transition-all text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Back to Hub
      </Button>

      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-foreground">Account Hub</h1>
        <p className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">System identification and hub protocols.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <aside className="space-y-4">
          <div className="p-8 bg-white border border-black/5 flex flex-col items-center text-center mb-6 rounded-3xl shadow-sm">
            <Avatar className="h-28 w-28 rounded-2xl border-2 border-primary/10 mb-4 shadow-sm">
              <AvatarFallback className="rounded-2xl bg-primary/5 text-primary text-3xl font-black">
                {currentDisplayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-[10px] font-black uppercase tracking-widest truncate w-full text-foreground">{currentDisplayName}</p>
            <p className="text-[8px] text-muted-foreground font-black uppercase mt-2 truncate w-full tracking-widest">{user.email}</p>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-black uppercase text-[10px] tracking-widest shadow-sm">
              <UserIcon className="h-4 w-4" /> Identification
            </Button>
            <Separator className="my-6 border-black/5" />
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 font-black uppercase text-[10px] tracking-widest" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Terminate Session
            </Button>
          </nav>
        </aside>

        <div className="md:col-span-2 space-y-10">
          <Card className="border border-black/5 shadow-sm bg-white rounded-3xl">
            <CardHeader className="border-b border-black/5">
              <CardTitle className="text-2xl uppercase font-black tracking-[0.2em] text-black">IDENTIFICATION PROFILE</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Core system identity settings.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-black">
                      <IdCard className="h-4 w-4" /> Unique ID
                    </Label>
                    <Input value={user.uid} disabled className="bg-[#F8FAFC] border-none rounded-xl h-12 font-mono text-base text-black font-black opacity-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-black">
                      <Mail className="h-4 w-4" /> Master Email
                    </Label>
                    <Input value={user.email || ""} disabled className="bg-[#F8FAFC] border-none rounded-xl h-12 font-mono text-base text-black font-black opacity-100" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name / Identity</Label>
                  <Input 
                    id="display-name" 
                    placeholder="e.g. ALPHA-1" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    className="bg-white border-black/5 focus:border-primary h-14 uppercase text-sm font-black tracking-widest text-foreground rounded-xl"
                  />
                  <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest ml-1">This name will be displayed across your terminal hub.</p>
                </div>
              </CardContent>
              <CardFooter className="pt-6 border-t border-black/5">
                <Button type="submit" disabled={updating} className="w-full h-16 bg-primary text-white hover:bg-primary/90 uppercase font-black tracking-[0.3em] text-xs rounded-xl shadow-lg shadow-primary/20">
                  {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Synchronize Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border border-black/5 shadow-sm bg-white rounded-3xl">
            <CardHeader className="border-b border-black/5">
              <CardTitle className="text-2xl uppercase font-black tracking-[0.2em] text-black flex items-center gap-2">
                <Lock className="h-5 w-5" /> CHANGE PASSWORD
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Update your master account password.</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="bg-white border-black/5 focus:border-primary h-14 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</Label>
                  <Input 
                    id="confirm-new-password" 
                    type="password"
                    placeholder="••••••••" 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                    className="bg-white border-black/5 focus:border-primary h-14 rounded-xl"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-6 border-t border-black/5">
                <Button type="submit" disabled={updatingPassword} className="w-full h-16 bg-foreground text-white hover:bg-foreground/90 uppercase font-black tracking-[0.3em] text-xs rounded-xl shadow-lg">
                  {updatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" /> Change Password</>}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

