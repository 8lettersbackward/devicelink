
"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { updatePassword, updateProfile } from "firebase/auth";
import { Loader2, User as UserIcon, Shield, Bell, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user, loading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    try {
      await updateProfile(user, { displayName });
      toast({ title: "Profile Updated", description: "Your basic info has been saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
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
      toast({ title: "Password Updated", description: "Your security credentials are secure." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: "Please re-authenticate to change sensitive settings." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
     <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-headline font-bold mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-secondary/50">
            <UserIcon className="h-4 w-4" /> Personal Info
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-secondary/50">
            <Shield className="h-4 w-4" /> Security
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-secondary/50">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Separator className="my-4" />
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10" onClick={() => auth.signOut()}>
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </aside>

        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email || ""} disabled className="bg-muted/50" />
                  <p className="text-[10px] text-muted-foreground italic">Email changes are restricted for security.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    placeholder="Your Name" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" disabled={updating}>
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Secure your account with a new password.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" variant="outline" disabled={updating || !newPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
