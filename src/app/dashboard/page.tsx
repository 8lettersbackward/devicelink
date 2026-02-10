
"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings, 
  Bell, 
  Cpu, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = 'register' | 'manage' | 'notifications' | 'settings';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('manage');

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-1 bg-primary w-24 mb-4"></div>
        <p className="text-[10px] uppercase tracking-widest font-bold">Initializing Hub</p>
      </div>
    </div>
  );

  if (!user) return null;

  const navItems = [
    { id: 'register', label: 'Register Device', icon: Plus },
    { id: 'manage', label: 'Manage Devices', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-background">
      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 order-2 md:order-1">
        <div className="max-w-4xl">
          <header className="mb-10">
            <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase mb-2">
              {navItems.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {activeTab === 'manage' && "Active monitoring of your monochrome ecosystem."}
              {activeTab === 'register' && "Onboard new hardware to the central hub."}
              {activeTab === 'notifications' && "Recent system alerts and heartbeat logs."}
              {activeTab === 'settings' && "Global hub configuration and security protocols."}
            </p>
          </header>

          {activeTab === 'manage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-none bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold tracking-tight uppercase">Device Node 0{i}</CardTitle>
                    <Activity className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Status: Operational</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Uptime: 14d 2h</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'register' && (
            <Card className="border-none shadow-none bg-muted/30 max-w-xl">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-background border flex items-center gap-4">
                    <Smartphone className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-sm uppercase">Quick Pair</p>
                      <p className="text-xs text-muted-foreground">Scan for nearby hardware nodes.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-background border flex items-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-sm uppercase">Legacy Registration</p>
                      <p className="text-xs text-muted-foreground">Manual key entry for older systems.</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full rounded-none h-12 uppercase font-bold tracking-widest">Begin Discovery</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="p-4 border-b flex justify-between items-center group cursor-pointer hover:bg-muted/10">
                  <div className="flex gap-4 items-center">
                    <div className="h-2 w-2 bg-primary rounded-none" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">System Update Protocol 7-{n}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Timestamp: 2024-05-2{n}T10:00:00Z</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 uppercase text-[10px] font-bold">Archive</Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Security</h3>
                <div className="p-4 bg-muted/30 flex justify-between items-center">
                  <span className="text-sm font-medium">Auto-Lock Nodes</span>
                  <div className="h-4 w-10 bg-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Connectivity</h3>
                <div className="p-4 bg-muted/30 flex justify-between items-center">
                  <span className="text-sm font-medium">Broadcast Hub Presence</span>
                  <div className="h-4 w-10 bg-secondary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Side Navigation */}
      <aside className="w-full md:w-80 border-l bg-muted/5 order-1 md:order-2">
        <div className="sticky top-16 p-6 space-y-2">
          <div className="mb-8 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Hub Navigation</p>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-4 transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground font-bold" 
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "" : "group-hover:text-primary")} />
                <span className="text-xs uppercase tracking-widest font-bold">{item.label}</span>
              </div>
              {activeTab === item.id && <div className="h-1 w-1 bg-primary-foreground rotate-45" />}
            </button>
          ))}

          <div className="mt-20 px-4">
             <div className="p-6 border border-dashed text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Total Nodes Active</p>
                <p className="text-4xl font-headline font-bold">08</p>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
