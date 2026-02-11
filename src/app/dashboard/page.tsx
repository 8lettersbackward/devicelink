
"use client";

import { useUser, useFirestore, useCollection, useFirebase, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Settings, 
  Bell, 
  Cpu, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Loader2,
  Trash2,
  Info,
  Edit,
  Eye,
  LogOut,
  Moon,
  Sun,
  Mail,
  Search,
  LayoutDashboard,
  History,
  PieChart as PieChartIcon,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, setDoc, collection, deleteDoc, serverTimestamp, addDoc, query, orderBy, limit } from "firebase/firestore";
import { signOut, verifyBeforeUpdateEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TabType = 'overview' | 'register' | 'manage' | 'notifications' | 'settings';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { auth } = useFirebase();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState("");

  const [registerLoading, setRegisterLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    type: 'SOS Beacon',
    status: 'online',
    specialData: ''
  });

  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setNewEmail(user.email || "");
    }
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, [user, userLoading, router]);

  const profileRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profileData } = useDoc(profileRef);

  const toggleTheme = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail || newEmail === user.email) return;
    setEmailLoading(true);
    verifyBeforeUpdateEmail(user, newEmail)
      .then(() => {
        toast({
          title: "Verification Sent",
          description: `Security verification sent to ${newEmail}.`
        });
      })
      .catch((error) => {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
      })
      .finally(() => setEmailLoading(false));
  };

  const handleLogout = () => {
    signOut(auth).then(() => router.push("/login"));
  };

  const devicesQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "devices");
  }, [db, user]);

  const { data: devices, loading: devicesLoading } = useCollection(devicesQuery);

  const notificationsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [db, user]);

  const { data: notifications, loading: notificationsLoading } = useCollection(notificationsQuery);

  const statusStats = useMemo(() => {
    if (!devices || devices.length === 0) return { online: 0, offline: 0, error: 0, total: 0 };
    return devices.reduce((acc: any, d: any) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      acc.total++;
      return acc;
    }, { online: 0, offline: 0, error: 0, total: 0 });
  }, [devices]);

  const chartData = useMemo(() => [
    { name: 'Secured', value: statusStats.online, fill: "var(--color-online)" },
    { name: 'Inactive', value: statusStats.offline, fill: "var(--color-offline)" },
    { name: 'Alert', value: statusStats.error, fill: "var(--color-error)" },
  ], [statusStats]);

  const chartConfig = {
    online: { label: "Secured", color: "hsl(var(--primary))" },
    offline: { label: "Inactive", color: "hsl(var(--muted-foreground))" },
    error: { label: "Alert", color: "hsl(var(--destructive))" },
  };

  const filteredDevices = useMemo(() => {
    if (!devices) return [];
    if (!searchQuery) return devices;
    const lowerQuery = searchQuery.toLowerCase();
    return devices.filter((d: any) => 
      d.name?.toLowerCase().includes(lowerQuery) || 
      d.id?.toLowerCase().includes(lowerQuery) ||
      d.type?.toLowerCase().includes(lowerQuery) ||
      d.status?.toLowerCase().includes(lowerQuery)
    );
  }, [devices, searchQuery]);

  const createNotification = (message: string) => {
    if (!user || !db) return;
    const notificationsRef = collection(db, "users", user.uid, "notifications");
    addDoc(notificationsRef, {
      userId: user.uid,
      message,
      read: false,
      createdAt: serverTimestamp()
    });
  };

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setRegisterLoading(true);
    const deviceRef = doc(db, "users", user.uid, "devices", formData.deviceId);
    const payload = {
      name: formData.name,
      id: formData.deviceId,
      type: formData.type,
      status: formData.status,
      ownerId: user.uid,
      registeredAt: serverTimestamp(),
      ...(formData.type === 'Other' && { specialData: formData.specialData })
    };
    setDoc(deviceRef, payload, { merge: true })
      .then(() => {
        createNotification(`Safety device registered: ${formData.name}`);
        setFormData({ name: '', deviceId: '', type: 'SOS Beacon', status: 'online', specialData: '' });
        setActiveTab('manage');
        toast({ title: "Protection Activated", description: "Emergency node successfully authorized." });
      })
      .catch((error) => {
        toast({ variant: "destructive", title: "Error", description: error.message });
      })
      .finally(() => setRegisterLoading(false));
  };

  const handleUpdateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !editingDevice) return;
    const deviceRef = doc(db, "users", user.uid, "devices", editingDevice.id);
    const { id, ...updateData } = editingDevice;
    setDoc(deviceRef, updateData, { merge: true })
      .then(() => {
        createNotification(`Emergency protocol updated: ${editingDevice.name}`);
        setIsEditDialogOpen(false);
        setEditingDevice(null);
        toast({ title: "Protocol Saved", description: "Safety configuration updated." });
      });
  };

  const handleDeleteDevice = (device: any) => {
    if (!user || !db) return;
    const deviceRef = doc(db, "users", user.uid, "devices", device.id);
    deleteDoc(deviceRef).then(() => {
      createNotification(`Protection deactivated for: ${device.name}`);
      toast({ title: "Node Purged", description: "Safety device removed from network." });
    });
  };

  if (userLoading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-pulse flex flex-col items-center">
        <ShieldAlert className="h-8 w-8 text-primary mb-4" />
        <p className="text-[10px] uppercase tracking-widest font-bold">Activating Safety Protocols</p>
      </div>
    </div>
  );

  if (!user) return null;

  const currentName = profileData?.displayName || user.displayName || "Protected User";

  const navItems = [
    { id: 'overview', label: 'Safety Overview', icon: LayoutDashboard },
    { id: 'register', label: 'Add Buddy Node', icon: Plus },
    { id: 'manage', label: 'Manage Buddies', icon: Cpu },
    { id: 'notifications', label: 'Safety Alerts', icon: Bell },
    { id: 'settings', label: 'Security Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-background">
      <aside className="w-full md:w-80 border-r bg-muted/5 order-1">
        <div className="sticky top-16 p-6 space-y-2">
          <div className="px-4 py-6 mb-4 flex items-center gap-4 border-b border-dashed">
            <Avatar className="h-10 w-10 rounded-none border border-primary">
              <AvatarImage src={profileData?.avatarUrl || user.photoURL || ""} alt={currentName} />
              <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold text-xs">
                {currentName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest truncate">{currentName}</p>
              <p className="text-[8px] text-muted-foreground uppercase font-mono truncate">{user.email}</p>
            </div>
          </div>

          <div className="mb-8 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Emergency Buddy</p>
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
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Active Safety Nodes</p>
                <p className="text-4xl font-headline font-bold">{devices?.length || 0}</p>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 order-2">
        <div className="max-w-4xl">
          <header className="mb-10">
            <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase mb-2">
              {navItems.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              {activeTab === 'overview' && `Protection status for ${currentName}. Active heartbeat and alerts.`}
              {activeTab === 'manage' && "Registry of your emergency buddies and safety nodes."}
              {activeTab === 'register' && "Pair a new emergency buddy or safety device to your profile."}
              {activeTab === 'notifications' && "Critical safety logs and heartbeat history."}
              {activeTab === 'settings' && "Configure security protocols and account privacy."}
            </p>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {[
                   { label: 'Secured', count: statusStats.online, color: 'bg-primary' },
                   { label: 'Inactive', count: statusStats.offline, color: 'bg-muted-foreground' },
                   { label: 'Warning', count: statusStats.error, color: 'bg-destructive' },
                 ].map((stat) => (
                   <Card key={stat.label} className="rounded-none border-none bg-muted/20 shadow-none">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className={cn("h-2 w-2", stat.color)} />
                           <span className="text-[10px] font-mono font-bold text-muted-foreground">
                             {statusStats.total > 0 ? ((stat.count / statusStats.total) * 100).toFixed(1) : 0}%
                           </span>
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold font-headline mt-1">{stat.count}</p>
                     </CardContent>
                   </Card>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-4">
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                        <Input 
                          placeholder="FILTER SAFETY NODES, IDS, OR PROTOCOLS..." 
                          className="pl-12 h-14 rounded-none border-none bg-muted/30 uppercase text-[10px] font-bold tracking-widest"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" /> Buddy Node Registry
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {filteredDevices.slice(0, 5).map((device: any) => (
                          <div key={device.id} className="p-4 bg-muted/20 border border-transparent hover:border-primary/20 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-2 w-2 rounded-none",
                                device.status === 'online' ? 'bg-primary' : 
                                device.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
                              )} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold uppercase">{device.name}</p>
                                  <span className="text-[8px] bg-muted px-1.5 py-0.5 font-bold uppercase opacity-70">{device.type}</span>
                                </div>
                                <p className="text-[9px] font-mono text-muted-foreground">ID: {device.id}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setViewingDevice(device); setIsViewDialogOpen(true); }} className="opacity-0 group-hover:opacity-100 uppercase text-[9px] font-bold">Inspect</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>

                 <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" /> Safety Demographics
                      </h3>
                      <div className="aspect-square bg-muted/10 p-4 border border-dashed flex items-center justify-center">
                        {statusStats.total > 0 ? (
                           <ChartContainer config={chartConfig} className="w-full h-full">
                              <PieChart>
                                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />)}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                              </PieChart>
                           </ChartContainer>
                        ) : <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Monitoring Inactive</p>}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <History className="h-4 w-4" /> Recent Safety Activity
                      </h3>
                      <div className="space-y-4">
                        {notifications?.slice(0, 3).map((notif: any) => (
                          <div key={notif.id} className="p-4 border-l-2 border-primary bg-muted/10">
                            <p className="text-[10px] font-bold uppercase mb-1">{notif.message}</p>
                            <p className="text-[9px] text-muted-foreground font-mono">
                              {notif.createdAt?.toDate?.() ? notif.createdAt.toDate().toLocaleTimeString() : "SYNCING..."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {devicesLoading ? (
                <div className="col-span-full py-12 flex flex-col items-center">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">Scanning Buddy Network...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="col-span-full py-20 border-2 border-dashed flex flex-col items-center justify-center text-center px-4">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-lg font-bold uppercase mb-2">No emergency buddies</p>
                  <p className="text-sm text-muted-foreground mb-6">Your safety network is currently unmonitored.</p>
                  <Button onClick={() => setActiveTab('register')} variant="outline" className="rounded-none uppercase font-bold text-[10px]">Onboard New Buddy</Button>
                </div>
              ) : (
                devices.map((device: any) => (
                  <Card key={device.id} className="border-none shadow-none bg-muted/30 hover:bg-muted/50 transition-colors group relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold tracking-tight uppercase">{device.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {device.id}</p>
                      </div>
                      <ShieldCheck className={cn("h-4 w-4", device.status === 'online' ? 'text-primary' : 'text-muted-foreground')} />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn("h-2 w-2 rounded-full", device.status === 'online' ? 'bg-primary animate-pulse' : 'bg-muted-foreground')} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Status: {device.status}</span>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" className="rounded-none text-[9px] uppercase font-bold" onClick={() => { setViewingDevice(device); setIsViewDialogOpen(true); }}>View</Button>
                         <Button variant="outline" size="sm" className="rounded-none text-[9px] uppercase font-bold" onClick={() => { setEditingDevice({...device}); setIsEditDialogOpen(true); }}>Edit</Button>
                         <Button variant="outline" size="sm" className="rounded-none text-[9px] uppercase font-bold text-destructive hover:bg-destructive" onClick={() => handleDeleteDevice(device)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'register' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="border-none shadow-none bg-muted/30 h-fit">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-bold tracking-widest">Buddy Credentials</CardTitle>
                  <CardDescription className="text-xs">Provide unique identifiers for your emergency equipment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterDevice} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-widest">Buddy Name</Label>
                      <Input id="name" placeholder="e.g. Personal SOS" className="rounded-none h-12" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deviceId" className="text-[10px] uppercase font-bold tracking-widest">Node ID</Label>
                      <Input id="deviceId" placeholder="e.g. SOS-X1" className="rounded-none h-12" value={formData.deviceId} onChange={(e) => setFormData({...formData, deviceId: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest">Category</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                          <SelectTrigger className="rounded-none h-12">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOS Beacon">SOS Beacon</SelectItem>
                            <SelectItem value="Fall Sensor">Fall Sensor</SelectItem>
                            <SelectItem value="GPS Tracker">GPS Tracker</SelectItem>
                            <SelectItem value="Panic Button">Panic Button</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest">State</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                          <SelectTrigger className="rounded-none h-12">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Armed</SelectItem>
                            <SelectItem value="offline">Inactive</SelectItem>
                            <SelectItem value="error">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {formData.type === 'Other' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest">Medical / Safety Data</Label>
                        <Textarea placeholder="Provide specific safety details..." className="rounded-none min-h-[100px]" value={formData.specialData} onChange={(e) => setFormData({...formData, specialData: e.target.value})} />
                      </div>
                    )}
                    <Button type="submit" className="w-full rounded-none h-14 uppercase font-bold tracking-widest" disabled={registerLoading}>
                      {registerLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Arm Safety Buddy"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="p-8 border-2 border-dashed bg-muted/10 h-fit">
                <h3 className="text-xs font-bold uppercase mb-4 tracking-[0.2em]">Protection Protocol</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">By registering a Buddy Node, you activate 24/7 monitoring for this device. Ensure the hardware is within proximity for emergency handshakes.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notificationsLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : notifications.length === 0 ? <p className="text-center py-20 text-muted-foreground uppercase text-xs">No active alerts</p> : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="p-4 border-b flex justify-between items-center hover:bg-muted/10">
                    <div>
                      <p className="text-sm font-bold uppercase">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{notif.createdAt?.toDate?.() ? notif.createdAt.toDate().toLocaleString() : "Syncing..."}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-12">
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interface Customization</h3>
                <Card className="border-none bg-muted/30 rounded-none">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase">Night Vision Protocol</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Toggle Dark Mode for low-light emergencies</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Integrity</h3>
                <Button variant="destructive" onClick={handleLogout} className="w-full h-14 rounded-none uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-3">
                  <LogOut className="h-4 w-4" /> Terminate Safety Session
                </Button>
              </section>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-none border-none">
          <DialogHeader><DialogTitle className="uppercase font-bold">Edit Buddy</DialogTitle></DialogHeader>
          {editingDevice && (
            <form onSubmit={handleUpdateDevice} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Buddy Name</Label>
                <Input className="rounded-none" value={editingDevice.name} onChange={(e) => setEditingDevice({...editingDevice, name: e.target.value})} required />
              </div>
              <DialogFooter><Button type="submit" className="rounded-none uppercase text-[10px] font-bold">Update Protocol</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="rounded-none border-none">
          <DialogHeader><DialogTitle className="uppercase font-bold">Buddy Details</DialogTitle></DialogHeader>
          {viewingDevice && (
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Identifier: <span className="text-foreground font-mono">{viewingDevice.id}</span></p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Protocol: <span className="text-foreground">{viewingDevice.type}</span></p>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="rounded-none w-full uppercase text-[10px] font-bold">Close Hub</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
