
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
  DialogTrigger,
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
  ShieldAlert,
  PlusCircle,
  PlusSquare,
  Phone,
  Users,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, setDoc, collection, deleteDoc, serverTimestamp, addDoc, query, orderBy, limit } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TabType = 'overview' | 'manage-buddy' | 'manage-node' | 'notifications' | 'settings';

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
    phoneNumber: '',
    group: 'Friend',
    specialData: ''
  });

  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddBuddyDialogOpen, setIsAddBuddyDialogOpen] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
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

  const { data: notifications } = useCollection(notificationsQuery);

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
    let filtered = devices;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((d: any) => 
        d.name?.toLowerCase().includes(lowerQuery) || 
        d.id?.toLowerCase().includes(lowerQuery) ||
        d.type?.toLowerCase().includes(lowerQuery) ||
        d.status?.toLowerCase().includes(lowerQuery) ||
        d.phoneNumber?.toLowerCase().includes(lowerQuery) ||
        d.group?.toLowerCase().includes(lowerQuery)
      );
    }
    if (activeTab === 'manage-buddy') {
      filtered = filtered.filter((d: any) => d.category === 'buddy');
    } else if (activeTab === 'manage-node') {
      filtered = filtered.filter((d: any) => d.category === 'node');
    }
    return filtered;
  }, [devices, searchQuery, activeTab]);

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

  const handleRegisterDevice = (e: React.FormEvent, category: 'buddy' | 'node') => {
    e.preventDefault();
    if (!user || !db) return;
    setRegisterLoading(true);
    
    const finalId = formData.deviceId || `ID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const deviceRef = doc(db, "users", user.uid, "devices", finalId);
    
    const payload = {
      name: formData.name,
      id: finalId,
      status: 'online', 
      category: category,
      ownerId: user.uid,
      registeredAt: serverTimestamp(),
      ...(category === 'buddy' ? {
        phoneNumber: formData.phoneNumber,
        group: formData.group,
        specialData: formData.group === 'Others' ? formData.specialData : ''
      } : {
        type: formData.type,
        specialData: formData.specialData
      })
    };

    setDoc(deviceRef, payload, { merge: true })
      .then(() => {
        const label = category === 'buddy' ? 'Buddy' : 'Node';
        createNotification(`New ${label} registered: ${formData.name}`);
        setFormData({ name: '', deviceId: '', type: 'SOS Beacon', status: 'online', phoneNumber: '', group: 'Friend', specialData: '' });
        setIsAddBuddyDialogOpen(false);
        setIsAddNodeDialogOpen(false);
        toast({ title: "Protocol Activated", description: `${label} successfully added to your network.` });
      })
      .catch((error) => {
        toast({ variant: "destructive", title: "Registration Error", description: error.message });
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
        createNotification(`Updated registry for: ${editingDevice.name}`);
        setIsEditDialogOpen(false);
        setEditingDevice(null);
        toast({ title: "Registry Updated", description: "Changes saved to the encrypted network." });
      });
  };

  const handleDeleteDevice = (device: any) => {
    if (!user || !db) return;
    const deviceRef = doc(db, "users", user.uid, "devices", device.id);
    deleteDoc(deviceRef).then(() => {
      createNotification(`Removed from network: ${device.name}`);
      toast({ title: "Asset Purged", description: "Removed from your security profile." });
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
    { id: 'manage-buddy', label: 'Manage Buddy', icon: Smartphone },
    { id: 'manage-node', label: 'Manage Node', icon: Cpu },
    { id: 'notifications', label: 'Safety Alerts', icon: Bell },
    { id: 'settings', label: 'Security Settings', icon: Settings },
  ] as const;

  const BuddyRegistrationForm = ({ isModal = false }: { isModal?: boolean }) => (
    <div className={cn("grid grid-cols-1 gap-10", !isModal && "lg:grid-cols-2")}>
      <Card className="border-none shadow-none bg-muted/30 h-fit">
        {!isModal && (
          <CardHeader>
            <CardTitle className="text-sm uppercase font-bold tracking-widest">Buddy Credentials</CardTitle>
            <CardDescription className="text-xs">Enlist a trusted contact for emergency orchestration.</CardDescription>
          </CardHeader>
        )}
        <CardContent className={cn(isModal && "pt-6")}>
          <form onSubmit={(e) => handleRegisterDevice(e, 'buddy')} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="buddy-name" className="text-[10px] uppercase font-bold tracking-widest">Buddy Name</Label>
              <Input id="buddy-name" placeholder="e.g. Elvin" className="rounded-none h-12" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buddy-phone" className="text-[10px] uppercase font-bold tracking-widest">Phone Number</Label>
              <Input id="buddy-phone" placeholder="+1..." className="rounded-none h-12" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest">Group / Relationship</Label>
              <Select value={formData.group} onValueChange={(v) => setFormData({...formData, group: v})}>
                <SelectTrigger className="rounded-none h-12">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Close Friend">Close Friend</SelectItem>
                  <SelectItem value="Segurulo">Segurulo</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.group === 'Others' && (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest">Specific Group Details</Label>
                <Textarea placeholder="Define specific emergency role or group metadata..." className="rounded-none min-h-[80px]" value={formData.specialData} onChange={(e) => setFormData({...formData, specialData: e.target.value})} />
              </div>
            )}
            <Button type="submit" className="w-full rounded-none h-14 uppercase font-bold tracking-widest" disabled={registerLoading}>
              {registerLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Buddy"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

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

          <div className="mb-4 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Control Center</p>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground font-bold" 
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "" : "group-hover:text-primary")} />
                <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
              </div>
              {activeTab === item.id && <div className="h-1 w-1 bg-primary-foreground rotate-45" />}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 order-2 overflow-y-auto">
        <div className="max-w-4xl">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase mb-2">
                {navItems.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-muted-foreground text-sm tracking-wide">
                {activeTab === 'overview' && `Protection status for ${currentName}. Active heartbeat and alerts.`}
                {activeTab === 'manage-buddy' && "Manage your trusted emergency contacts and human safety network."}
                {activeTab === 'manage-node' && "Registry of your active hardware safety nodes and sensors."}
                {activeTab === 'notifications' && "Critical safety logs and heartbeat history."}
                {activeTab === 'settings' && "Configure security protocols and account privacy."}
              </p>
            </div>
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
                          placeholder="FILTER BY NAME, ID, PHONE, OR STATUS..." 
                          className="pl-12 h-14 rounded-none border-none bg-muted/30 uppercase text-[10px] font-bold tracking-widest"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" /> Comprehensive Network Registry
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {filteredDevices.slice(0, 10).map((device: any) => (
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
                                  <span className="text-[8px] bg-muted px-1.5 py-0.5 font-bold uppercase opacity-70">{device.category}</span>
                                  {device.group && <span className="text-[8px] border border-primary/20 px-1.5 py-0.5 font-bold uppercase">{device.group}</span>}
                                </div>
                                <p className="text-[9px] font-mono text-muted-foreground">ID: {device.id} {device.phoneNumber && `| Contact: ${device.phoneNumber}`}</p>
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
                        <PieChartIcon className="h-4 w-4" /> Status Demographics
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
                        ) : <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Network Inactive</p>}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <History className="h-4 w-4" /> Safety Heartbeats
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

          {activeTab === 'manage-buddy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {devicesLoading ? (
                <div className="col-span-full py-12 flex flex-col items-center">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">Scanning Contacts...</p>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="col-span-full py-20 border-2 border-dashed flex flex-col items-center justify-center text-center px-4">
                  <Smartphone className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-lg font-bold uppercase mb-2">No Buddies Enlisted</p>
                  <p className="text-sm text-muted-foreground mb-6">Your human safety network is currently unmonitored.</p>
                  <Button onClick={() => setIsAddBuddyDialogOpen(true)} variant="outline" className="rounded-none uppercase font-bold text-[10px]">Enlist Buddy</Button>
                </div>
              ) : (
                filteredDevices.map((device: any) => (
                  <Card key={device.id} className="border-none shadow-none bg-muted/30 hover:bg-muted/50 transition-colors group relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold tracking-tight uppercase">{device.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-mono">{device.group} | {device.phoneNumber}</p>
                      </div>
                      <Users className="h-4 w-4 text-primary" />
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

          {activeTab === 'manage-node' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {devicesLoading ? (
                <div className="col-span-full py-12 flex flex-col items-center">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">Scanning Network...</p>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="col-span-full py-20 border-2 border-dashed flex flex-col items-center justify-center text-center px-4">
                  <Cpu className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-lg font-bold uppercase mb-2">No Nodes Registered</p>
                  <p className="text-sm text-muted-foreground mb-6">No hardware safety nodes currently active.</p>
                  <Button onClick={() => setIsAddNodeDialogOpen(true)} variant="outline" className="rounded-none uppercase font-bold text-[10px]">Add Node</Button>
                </div>
              ) : (
                filteredDevices.map((device: any) => (
                  <Card key={device.id} className="border-none shadow-none bg-muted/30 hover:bg-muted/50 transition-colors group relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold tracking-tight uppercase">{device.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {device.id}</p>
                      </div>
                      <Cpu className="h-4 w-4 text-primary" />
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

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {!notifications || notifications.length === 0 ? (
                <p className="text-center py-20 text-muted-foreground uppercase text-xs font-bold tracking-widest">No active system alerts</p>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="p-4 border-b border-dashed flex justify-between items-center hover:bg-muted/10">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">{notif.message}</p>
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

      {/* Persistent Dialogs */}
      <Dialog open={isAddBuddyDialogOpen} onOpenChange={setIsAddBuddyDialogOpen}>
        <DialogContent className="rounded-none border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold">Enlist New Buddy</DialogTitle>
            <DialogDescription className="text-xs">Provide credentials for your emergency orchestration contact.</DialogDescription>
          </DialogHeader>
          <BuddyRegistrationForm isModal />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent className="rounded-none border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold">Arm New Node</DialogTitle>
            <DialogDescription className="text-xs">Provide identifiers for your emergency hardware asset.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleRegisterDevice(e, 'node')} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="modal-node-name" className="text-[10px] uppercase font-bold tracking-widest">Node Name</Label>
              <Input id="modal-node-name" placeholder="e.g. Primary SOS Beacon" className="rounded-none h-12" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-node-id" className="text-[10px] uppercase font-bold tracking-widest">Hardware ID</Label>
              <Input id="modal-node-id" placeholder="e.g. BEACON-01" className="rounded-none h-12" value={formData.deviceId} onChange={(e) => setFormData({...formData, deviceId: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest">Technical Data</Label>
              <Textarea placeholder="Provide specific safety details for this node..." className="rounded-none min-h-[100px]" value={formData.specialData} onChange={(e) => setFormData({...formData, specialData: e.target.value})} />
            </div>
            <Button type="submit" className="w-full rounded-none h-14 uppercase font-bold tracking-widest" disabled={registerLoading}>
              {registerLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Arm Node"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-none border-none">
          <DialogHeader><DialogTitle className="uppercase font-bold">Update Configuration</DialogTitle></DialogHeader>
          {editingDevice && (
            <form onSubmit={handleUpdateDevice} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Label</Label>
                <Input className="rounded-none" value={editingDevice.name} onChange={(e) => setEditingDevice({...editingDevice, name: e.target.value})} required />
              </div>
              {editingDevice.category === 'buddy' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Phone Number</Label>
                  <Input className="rounded-none" value={editingDevice.phoneNumber} onChange={(e) => setEditingDevice({...editingDevice, phoneNumber: e.target.value})} required />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">State</Label>
                <Select value={editingDevice.status} onValueChange={(v) => setEditingDevice({...editingDevice, status: v})}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Armed</SelectItem>
                    <SelectItem value="offline">Inactive</SelectItem>
                    <SelectItem value="error">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="submit" className="rounded-none uppercase text-[10px] font-bold w-full">Synchronize Changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="rounded-none border-none">
          <DialogHeader><DialogTitle className="uppercase font-bold">Asset Registry Information</DialogTitle></DialogHeader>
          {viewingDevice && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground">Registry Name</p>
                  <p className="text-xs font-bold uppercase">{viewingDevice.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground">Unique Hash ID</p>
                  <p className="text-xs font-mono">{viewingDevice.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground">Classification</p>
                  <p className="text-xs uppercase">{viewingDevice.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground">Protocol Type</p>
                  <p className="text-xs uppercase">{viewingDevice.type || viewingDevice.group || "N/A"}</p>
                </div>
                {viewingDevice.phoneNumber && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground">Contact Link</p>
                    <p className="text-xs font-bold">{viewingDevice.phoneNumber}</p>
                  </div>
                )}
                {viewingDevice.specialData && (
                  <div className="space-y-1 col-span-2 p-4 bg-muted/30 border border-dashed">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Encrypted Payload Data</p>
                    <p className="text-[10px] leading-relaxed">{viewingDevice.specialData}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="rounded-none w-full uppercase text-[10px] font-bold">Close Access Hub</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
