"use client";

import { useUser, useDatabase, useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Settings, 
  Bell, 
  Cpu, 
  Smartphone,
  Loader2,
  Trash2,
  LogOut,
  UserPlus,
  Layers,
  PlusSquare,
  Eye,
  Eraser,
  Thermometer,
  Pencil,
  MapPin,
  AlertTriangle,
  Radar,
  ShieldAlert,
  Search,
  Check,
  X,
  ShieldCheck,
  UserCheck,
  Navigation,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ref, set, push, remove, update, onChildAdded, off, onValue, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRtdb } from "@/firebase/database/use-rtdb";

const SOSMap = dynamic(() => import("./sos-map"), { 
  ssr: false,
  loading: () => <div className="h-[200px] sm:h-[250px] md:h-[350px] w-full neo-inset animate-pulse flex items-center justify-center text-[10px] font-bold uppercase tracking-widest opacity-40 text-foreground">Initializing Terminal Map...</div>
});

type TabType = 'buddies' | 'nodes' | 'notifications' | 'settings' | 'guardian' | 'my-guardians';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { auth } = useFirebase();
  const rtdb = useDatabase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('buddies');
  const [hasMounted, setHasMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
    if (!userLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.emailVerified) {
        router.push("/verify-email");
      }
    }
    
    if (user && rtdb) {
      const profileRef = ref(rtdb, `users/${user.uid}/profile`);
      get(profileRef).then(snapshot => {
        const profile = snapshot.val();
        const role = profile?.role || 'user';
        setUserRole(role);
        setActiveTab(role === 'guardian' ? 'guardian' : 'buddies');
      });
    }
  }, [user, userLoading, router, rtdb]);

  const notificationsRef = useMemo(() => user && user.emailVerified ? ref(rtdb, `users/${user.uid}/notifications`) : null, [rtdb, user]);
  const { data: notificationsData } = useRtdb(notificationsRef);

  const notifications = useMemo(() => notificationsData ? Object.entries(notificationsData).map(([id, val]: [string, any]) => ({ ...val, id, createdAt: val.createdAt || val.timestamp || 0 })).sort((a, b) => b.createdAt - a.createdAt) : [], [notificationsData]);

  const currentName = useMemo(() => user?.email?.split('@')[0] || "Personnel", [user]);

  const navItems = useMemo(() => {
    return userRole === 'guardian' 
      ? [{ id: 'guardian', label: 'RADAR', icon: Radar }, { id: 'notifications', label: 'ALERTS', icon: Bell }, { id: 'settings', label: 'PROFILE', icon: Settings }]
      : [{ id: 'buddies', label: 'BUDDIES', icon: Smartphone }, { id: 'nodes', label: 'NODES', icon: Cpu }, { id: 'notifications', label: 'ALERTS', icon: Bell }, { id: 'settings', label: 'PROFILE', icon: Settings }];
  }, [userRole]);

  const logOutTerminal = () => signOut(auth).then(() => router.push("/login"));

  if (userLoading || !hasMounted) return <div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-center p-4 bg-background/80 backdrop-blur-md border-t border-black/5 pb-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all text-[8px] font-bold uppercase tracking-widest relative px-2",
              activeTab === item.id 
                ? "text-primary scale-110" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
            <span>{item.label}</span>
            {notifications.length > 0 && item.id === 'notifications' && (
              <span className="absolute top-0 right-1 h-1.5 w-1.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 p-6 h-screen sticky top-0 z-40 border-r border-black/5 bg-background/50 flex-col justify-between">
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 neo-flat flex items-center justify-center text-primary shrink-0">
              <Hexagon className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase flex items-baseline gap-1 text-foreground">
              1TAP <span className="text-primary">BUDDY</span>
            </h1>
          </div>

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 transition-all text-[10px] font-bold uppercase tracking-[0.1em] relative group whitespace-nowrap",
                  activeTab === item.id 
                    ? "neo-inset text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
                {notifications.length > 0 && item.id === 'notifications' && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-6 h-1.5 w-1.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <div className="p-5 neo-flat space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 neo-inset shrink-0">
                <AvatarFallback className="bg-transparent text-[9px] font-bold text-foreground">{currentName[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black truncate uppercase tracking-widest text-foreground">{currentName}</p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{userRole}</p>
              </div>
            </div>
            <button 
              onClick={logOutTerminal}
              className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors pl-1"
            >
              <LogOut className="h-3 w-3" />
              DISCONNECT
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 md:p-8 w-full pb-32 md:pb-8">
        <div className="max-w-6xl mx-auto mt-4 md:mt-0">
          {activeTab === 'buddies' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-foreground">Manage Buddies</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button className="neo-btn flex-1 sm:flex-none h-10 px-4 text-[9px] font-bold uppercase tracking-widest bg-background text-foreground hover:text-primary">
                    <PlusSquare className="h-4 w-4 mr-2" /> ENLIST
                  </Button>
                  <Button className="neo-btn flex-1 sm:flex-none h-10 px-4 text-[9px] font-bold uppercase tracking-widest bg-background text-primary">
                    <ShieldAlert className="h-4 w-4 mr-2" /> PROTOCOLS
                  </Button>
                </div>
              </div>

              <div className="neo-flat p-8 min-h-[300px] flex items-center justify-center text-center">
                 <div className="space-y-6 opacity-30">
                   <Smartphone className="h-12 w-12 mx-auto text-foreground" />
                   <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground">Operational Vault Empty</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="space-y-8">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-foreground">Guardian Hub</h2>
              <div className="neo-flat p-8 min-h-[400px] flex items-center justify-center text-center">
                 <div className="space-y-6 opacity-30">
                   <Radar className="h-12 w-12 mx-auto text-foreground" />
                   <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground">Terminal Section Initializing...</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-foreground">Alert Stream</h2>
              <div className="neo-flat p-6 sm:p-8">
                <ScrollArea className="h-[500px] pr-4">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] opacity-10">
                      <Bell className="h-12 w-12 mb-6 text-foreground" />
                      <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground">Telemetry Clear</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="mb-6 p-6 neo-flat bg-background/20">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex gap-4 items-center">
                            {n.type === 'sos' ? <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" /> : <Radar className="h-5 w-5 text-primary" />}
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-foreground">{n.message}</p>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge className="neo-btn bg-background text-[8px] font-bold px-4 py-1 uppercase shrink-0 text-foreground">{n.type}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {!['buddies', 'notifications', 'guardian'].includes(activeTab) && (
            <div className="space-y-8">
               <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-foreground">{activeTab.replace('-', ' ')}</h2>
               <div className="neo-flat p-20 flex items-center justify-center opacity-20">
                 <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-center text-foreground">Terminal Section Initializing...</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
