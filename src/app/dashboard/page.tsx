
"use client";

import { useUser, useFirestore, useCollection, useFirebase } from "@/firebase";
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
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, setDoc, collection, deleteDoc, serverTimestamp, addDoc, query, orderBy, limit } from "firebase/firestore";
import { signOut, verifyBeforeUpdateEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

type TabType = 'register' | 'manage' | 'notifications' | 'settings';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { auth } = useFirebase();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('manage');
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Registration form state
  const [registerLoading, setRegisterLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    type: 'Sensor',
    status: 'online',
    specialData: ''
  });

  // Edit/View state
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Settings state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Initializations
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setNewEmail(user.email || "");
    }
    // Set initial theme
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, [user, userLoading, router]);

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
          description: `A verification email has been sent to ${newEmail}. Please confirm to complete the change.`
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message
        });
      })
      .finally(() => setEmailLoading(false));
  };

  const handleLogout = () => {
    signOut(auth).then(() => router.push("/login"));
  };

  // Fetch devices
  const devicesQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "devices");
  }, [db, user]);

  const { data: devices, loading: devicesLoading } = useCollection(devicesQuery);

  // Fetch notifications
  const notificationsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [db, user]);

  const { data: notifications, loading: notificationsLoading } = useCollection(notificationsQuery);

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
        createNotification(`New device authorized: ${formData.name} (ID: ${formData.deviceId})`);
        setFormData({ name: '', deviceId: '', type: 'Sensor', status: 'online', specialData: '' });
        setActiveTab('manage');
        toast({
          title: "Device Registered",
          description: "Hardware node successfully authorized."
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: error.message
        });
      })
      .finally(() => {
        setRegisterLoading(false);
      });
  };

  const handleUpdateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !editingDevice) return;

    const deviceRef = doc(db, "users", user.uid, "devices", editingDevice.id);
    const { id, ...updateData } = editingDevice;
    
    setDoc(deviceRef, updateData, { merge: true })
      .then(() => {
        createNotification(`Device configuration updated: ${editingDevice.name}`);
        setIsEditDialogOpen(false);
        setEditingDevice(null);
        toast({
          title: "Device Updated",
          description: "Node configuration saved."
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Update Error",
          description: error.message
        });
      });
  };

  const handleDeleteDevice = (device: any) => {
    if (!user || !db) return;
    const deviceRef = doc(db, "users", user.uid, "devices", device.id);
    deleteDoc(deviceRef)
      .then(() => {
        createNotification(`Device removed from network: ${device.name}`);
        toast({
          title: "Device Deleted",
          description: "Hardware node disconnected and purged."
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Deletion Error",
          description: error.message
        });
      });
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (!user || !db) return;
    const notificationRef = doc(db, "users", user.uid, "notifications", notificationId);
    deleteDoc(notificationRef);
  };

  if (userLoading) return (
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
      {/* Left Side Navigation */}
      <aside className="w-full md:w-80 border-r bg-muted/5 order-1">
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
                <p className="text-4xl font-headline font-bold">{devices?.length || 0}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 order-2">
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
              {devicesLoading ? (
                <div className="col-span-full py-12 flex flex-col items-center">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">Scanning Network...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="col-span-full py-20 border-2 border-dashed flex flex-col items-center justify-center text-center px-4">
                  <Smartphone className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-lg font-bold uppercase mb-2">No active nodes</p>
                  <p className="text-sm text-muted-foreground mb-6">Your device registry is currently empty.</p>
                  <Button onClick={() => setActiveTab('register')} variant="outline" className="rounded-none uppercase font-bold text-[10px]">Initialize New Device</Button>
                </div>
              ) : (
                devices.map((device: any) => (
                  <Card key={device.id} className="border-none shadow-none bg-muted/30 hover:bg-muted/50 transition-colors group relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold tracking-tight uppercase">{device.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {device.id}</p>
                      </div>
                      <div className="flex items-center gap-1">
                         <Activity className={cn("h-4 w-4", device.status === 'error' ? 'text-destructive' : 'text-primary')} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          device.status === 'online' ? 'bg-primary animate-pulse' : 
                          device.status === 'offline' ? 'bg-muted-foreground' : 'bg-destructive'
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Status: {device.status}</span>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="h-8 px-3 rounded-none text-[9px] uppercase font-bold tracking-widest"
                           onClick={() => { setViewingDevice(device); setIsViewDialogOpen(true); }}
                         >
                           <Eye className="h-3 w-3 mr-2" /> View
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="h-8 px-3 rounded-none text-[9px] uppercase font-bold tracking-widest"
                           onClick={() => { setEditingDevice({...device}); setIsEditDialogOpen(true); }}
                         >
                           <Edit className="h-3 w-3 mr-2" /> Edit
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="h-8 px-3 rounded-none text-[9px] uppercase font-bold tracking-widest text-destructive hover:bg-destructive hover:text-destructive-foreground"
                           onClick={() => handleDeleteDevice(device)}
                         >
                           <Trash2 className="h-3 w-3" />
                         </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground">
                          <span>Type: {device.type}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
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
                  <CardTitle className="text-sm uppercase font-bold tracking-widest">Device Details</CardTitle>
                  <CardDescription className="text-xs">Provide the unique hardware identifiers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterDevice} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-widest">Device Name</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Master Terminal" 
                        className="rounded-none bg-background border-none h-12"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deviceId" className="text-[10px] uppercase font-bold tracking-widest">Device ID</Label>
                      <Input 
                        id="deviceId" 
                        placeholder="e.g. NODE-X-01" 
                        className="rounded-none bg-background border-none h-12"
                        value={formData.deviceId}
                        onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest">Type</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                          <SelectTrigger className="rounded-none bg-background border-none h-12">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sensor">Sensor</SelectItem>
                            <SelectItem value="Actuator">Actuator</SelectItem>
                            <SelectItem value="Gateway">Gateway</SelectItem>
                            <SelectItem value="Display">Display</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest">Initial Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                          <SelectTrigger className="rounded-none bg-background border-none h-12">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.type === 'Other' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="specialData" className="text-[10px] uppercase font-bold tracking-widest">Special Data / Info</Label>
                        <Textarea 
                          id="specialData" 
                          placeholder="Provide specific details about this hardware node..." 
                          className="rounded-none bg-background border-none min-h-[100px]"
                          value={formData.specialData}
                          onChange={(e) => setFormData({...formData, specialData: e.target.value})}
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full rounded-none h-14 uppercase font-bold tracking-widest text-sm" disabled={registerLoading}>
                      {registerLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Device"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed bg-muted/10">
                  <h3 className="text-xs font-bold uppercase mb-4 tracking-[0.2em]">Registration Protocol</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: Smartphone, title: "Hardware Handshake", desc: "Ensure device is powered and broadcasting." },
                      { icon: ShieldCheck, title: "Secure Handshake", desc: "Encryption keys are generated on-the-fly." },
                    ].map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <step.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase">{step.title}</p>
                          <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notificationsLoading ? (
                <div className="py-12 flex flex-col items-center">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">Retrieving Logs...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-20 border-2 border-dashed flex flex-col items-center justify-center text-center">
                   <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                   <p className="text-sm font-bold uppercase text-muted-foreground">System logs clear</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="p-4 border-b flex justify-between items-center group cursor-pointer hover:bg-muted/10">
                    <div className="flex gap-4 items-center">
                      <div className="h-2 w-2 bg-primary rounded-none" />
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Timestamp: {notif.createdAt?.toDate?.() ? notif.createdAt.toDate().toLocaleString() : "Syncing..."}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 uppercase text-[10px] font-bold"
                    >
                      Archive
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Appearance Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <Activity className="h-4 w-4 text-muted-foreground" />
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interface Customization</h3>
                </div>
                <Card className="border-none shadow-none bg-muted/30 rounded-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold uppercase">Dark Mode Protocol</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Toggle between monochrome themes</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <Switch 
                          checked={theme === 'dark'} 
                          onCheckedChange={toggleTheme}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Account Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <Mail className="h-4 w-4 text-muted-foreground" />
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Personal Credentials</h3>
                </div>
                <Card className="border-none shadow-none bg-muted/30 rounded-none">
                  <CardContent className="p-6">
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-update" className="text-[10px] font-bold uppercase tracking-widest">Master Email</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="email-update"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="bg-background border-none rounded-none h-12"
                            required
                          />
                          <Button 
                            type="submit" 
                            disabled={emailLoading || newEmail === user.email}
                            className="rounded-none h-12 uppercase font-bold text-[10px] px-6"
                          >
                            {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Verification email will be sent for confirmation.</p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </section>

              {/* Security/Logout Section */}
              <section className="space-y-4 pt-6 border-t border-dashed">
                <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Session Integrity</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="w-full h-14 rounded-none uppercase font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                  >
                    <LogOut className="h-4 w-4" /> Terminate Active Session
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">Warning: This will disconnect the current browser interface from the hub.</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-background rounded-none border-none">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest font-bold">Edit Device</DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground">Modify active node configuration</DialogDescription>
          </DialogHeader>
          {editingDevice && (
            <form onSubmit={handleUpdateDevice} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest">Device Name</Label>
                <Input 
                  className="rounded-none bg-muted/30 border-none"
                  value={editingDevice.name}
                  onChange={(e) => setEditingDevice({...editingDevice, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Type</Label>
                  <Select value={editingDevice.type} onValueChange={(v) => setEditingDevice({...editingDevice, type: v})}>
                    <SelectTrigger className="rounded-none bg-muted/30 border-none">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sensor">Sensor</SelectItem>
                      <SelectItem value="Actuator">Actuator</SelectItem>
                      <SelectItem value="Gateway">Gateway</SelectItem>
                      <SelectItem value="Display">Display</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Status</Label>
                  <Select value={editingDevice.status} onValueChange={(v) => setEditingDevice({...editingDevice, status: v})}>
                    <SelectTrigger className="rounded-none bg-muted/30 border-none">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingDevice.type === 'Other' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Special Data</Label>
                  <Textarea 
                    className="rounded-none bg-muted/30 border-none min-h-[80px]"
                    value={editingDevice.specialData || ''}
                    onChange={(e) => setEditingDevice({...editingDevice, specialData: e.target.value})}
                  />
                </div>
              )}
              
              <DialogFooter className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-none uppercase text-[10px] font-bold">Cancel</Button>
                <Button type="submit" className="rounded-none uppercase text-[10px] font-bold px-8">Update Node</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md bg-background rounded-none border-none">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest font-bold">Node Details</DialogTitle>
          </DialogHeader>
          {viewingDevice && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Device Name</p>
                  <p className="text-sm font-bold uppercase tracking-tight">{viewingDevice.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      viewingDevice.status === 'online' ? 'bg-primary' : 
                      viewingDevice.status === 'offline' ? 'bg-muted-foreground' : 'bg-destructive'
                    )} />
                    <p className="text-sm font-bold uppercase tracking-tight">{viewingDevice.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Identifier</p>
                  <p className="text-[10px] font-mono">{viewingDevice.id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Type</p>
                  <p className="text-sm font-bold uppercase tracking-tight">{viewingDevice.type}</p>
                </div>
              </div>

              {viewingDevice.specialData && (
                <div className="p-4 bg-muted/20 border border-dashed">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-2">
                    <Info className="h-3 w-3" /> Custom Metadata
                  </p>
                  <p className="text-xs font-medium leading-relaxed">{viewingDevice.specialData}</p>
                </div>
              )}

              <div className="pt-4 border-t border-dashed">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Authorized Since</p>
                <p className="text-[10px] font-mono">
                  {viewingDevice.registeredAt?.toDate?.() ? viewingDevice.registeredAt.toDate().toLocaleString() : "N/A"}
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="rounded-none w-full uppercase text-[10px] font-bold">Close Portal</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
