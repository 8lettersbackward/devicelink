"use client";

import { useUser, useDatabase, useRtdb, useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Zap,
  PlusCircle,
  Pencil,
  PlusSquare,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ref, set, push, remove, update } from "firebase/database";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type TabType = 'buddies' | 'nodes' | 'notifications' | 'settings';

const DEFAULT_BUDDY_GROUPS = ["Family", "Friend", "Close Friend"];

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { auth } = useFirebase();
  const rtdb = useDatabase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('buddies');
  const [hasMounted, setHasMounted] = useState(false);

  const [registerLoading, setRegisterLoading] = useState(false);
  const [buddyForm, setBuddyForm] = useState({
    name: '',
    phoneNumber: '',
    groups: [] as string[]
  });

  const [nodeForm, setNodeForm] = useState({
    nodeName: '',
    hardwareId: '',
    targetGroups: [] as string[]
  });

  const [isAddBuddyDialogOpen, setIsAddBuddyDialogOpen] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [isEditBuddyDialogOpen, setIsEditBuddyDialogOpen] = useState(false);
  const [isEditNodeDialogOpen, setIsEditNodeDialogOpen] = useState(false);
  const [isViewItemDialogOpen, setIsViewItemDialogOpen] = useState(false);
  const [isManageGroupsDialogOpen, setIsManageGroupsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [itemToView, setItemToView] = useState<any>(null);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const currentName = useMemo(() => {
    if (!user?.email) return "User";
    return user.email.split('@')[0];
  }, [user]);

  useEffect(() => {
    setHasMounted(true);
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const profileRef = useMemo(() => user ? ref(rtdb, `users/${user.uid}/profile`) : null, [rtdb, user]);
  const { data: profileData } = useRtdb(profileRef);

  const groupsRef = useMemo(() => user ? ref(rtdb, `users/${user.uid}/buddyGroups`) : null, [rtdb, user]);
  const { data: customGroupsData } = useRtdb(groupsRef);

  const buddiesRef = useMemo(() => user ? ref(rtdb, `users/${user.uid}/buddies`) : null, [rtdb, user]);
  const { data: buddiesData } = useRtdb(buddiesRef);

  const nodesRef = useMemo(() => user ? ref(rtdb, `users/${user.uid}/nodes`) : null, [rtdb, user]);
  const { data: nodesData } = useRtdb(nodesRef);

  const notificationsRef = useMemo(() => user ? ref(rtdb, `users/${user.uid}/notifications`) : null, [rtdb, user]);
  const { data: notificationsData } = useRtdb(notificationsRef);

  const sosSystemRef = useMemo(() => ref(rtdb, "sosSystem"), [rtdb]);
  const { data: sosStatus } = useRtdb(sosSystemRef);

  const buddyGroups = useMemo(() => {
    const customNames = customGroupsData ? Object.values(customGroupsData).map((g: any) => g.name) : [];
    return Array.from(new Set([...DEFAULT_BUDDY_GROUPS, ...customNames]));
  }, [customGroupsData]);

  const buddies = useMemo(() => {
    if (!buddiesData) return [];
    return Object.entries(buddiesData).map(([id, val]: [string, any]) => ({ ...val, id }));
  }, [buddiesData]);

  const nodes = useMemo(() => {
    if (!nodesData) return [];
    return Object.entries(nodesData).map(([id, val]: [string, any]) => ({ ...val, id }));
  }, [nodesData]);

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    return Object.entries(notificationsData)
      .map(([id, val]: [string, any]) => ({ ...val, id }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [notificationsData]);

  const handleRegisterBuddy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rtdb) return;
    setRegisterLoading(true);
    const buddyId = `BUDDY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const payload = { ...buddyForm, id: buddyId, registeredAt: Date.now() };
    set(ref(rtdb, `users/${user.uid}/buddies/${buddyId}`), payload)
      .then(() => {
        setIsAddBuddyDialogOpen(false);
        setBuddyForm({ name: '', phoneNumber: '', groups: [] });
        toast({ title: "Buddy Registered" });
      })
      .finally(() => setRegisterLoading(false));
  };

  const handleUpdateBuddy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rtdb || !itemToEdit) return;
    setRegisterLoading(true);
    update(ref(rtdb, `users/${user.uid}/buddies/${itemToEdit.id}`), itemToEdit)
      .then(() => {
        setIsEditBuddyDialogOpen(false);
        setItemToEdit(null);
        toast({ title: "Buddy Updated" });
      })
      .finally(() => setRegisterLoading(false));
  };

  const handleRegisterNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rtdb) return;
    setRegisterLoading(true);
    const nodeId = nodeForm.hardwareId || `NODE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const payload = { ...nodeForm, id: nodeId, status: 'online', registeredAt: Date.now() };
    set(ref(rtdb, `users/${user.uid}/nodes/${nodeId}`), payload)
      .then(() => {
        setIsAddNodeDialogOpen(false);
        setNodeForm({ nodeName: '', hardwareId: '', targetGroups: [] });
        toast({ title: "Node Armed" });
      })
      .finally(() => setRegisterLoading(false));
  };

  const handleUpdateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rtdb || !itemToEdit) return;
    setRegisterLoading(true);
    update(ref(rtdb, `users/${user.uid}/nodes/${itemToEdit.id}`), itemToEdit)
      .then(() => {
        setIsEditNodeDialogOpen(false);
        setItemToEdit(null);
        toast({ title: "Node Updated" });
      })
      .finally(() => setRegisterLoading(false));
  };

  const triggerNodeAlert = (node: any) => {
    if (!user || !rtdb) return;

    const isCurrentlyActive = sosStatus?.sosTrigger === true;

    if (isCurrentlyActive) {
      update(ref(rtdb, "sosSystem"), {
        sosTrigger: false,
        timestamp: Date.now(),
      });
      return;
    }

    const broadcastSOS = async (lat?: number, lng?: number) => {
      const now = Date.now();
      update(ref(rtdb, "sosSystem"), {
        sosTrigger: true,
        sender: user.email || "Unknown",
        nodename: node.nodeName,
        timestamp: now,
        triggeredByNode: node.id,
        latitude: lat || profileData?.latitude || null,
        longitude: lng || profileData?.longitude || null,
      });
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => broadcastSOS(pos.coords.latitude, pos.coords.longitude),
        () => broadcastSOS(),
        { timeout: 5000 }
      );
    } else broadcastSOS();
  };

  if (userLoading || !hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { id: 'buddies', label: 'Manage Buddies', icon: Smartphone },
    { id: 'nodes', label: 'Manage Nodes', icon: Cpu },
    { id: 'notifications', label: 'Safety Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-background">
      <aside className="w-full md:w-80 border-r border-indigo-900/30 bg-background order-1">
        <div className="sticky top-16 p-6 space-y-2">
          <div className="px-4 py-6 mb-4 flex items-center gap-4 border-b border-indigo-900/20">
            <Avatar className="h-12 w-12 rounded-full border-2 border-accent">
              <AvatarFallback className="rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {currentName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold uppercase tracking-widest truncate text-foreground">{currentName}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono truncate">{user.email}</p>
            </div>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 transition-all rounded-md",
                activeTab === item.id 
                  ? "bg-secondary text-foreground font-bold shadow-lg" 
                  : "hover:bg-card/40 text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-accent" : "text-muted-foreground")} />
                <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 order-2 bg-background/50">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'buddies' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Button onClick={() => setIsAddBuddyDialogOpen(true)} className="bg-primary hover:bg-secondary uppercase font-bold text-[10px] gap-2 h-12">
                  <UserPlus className="h-4 w-4" /> Enlist Buddy
                </Button>
                <Button onClick={() => setIsManageGroupsDialogOpen(true)} variant="outline" className="border-border hover:bg-card uppercase font-bold text-[10px] gap-2 h-12">
                  <Layers className="h-4 w-4" /> Protocols
                </Button>
              </div>

              {buddies.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-indigo-900/30 bg-card/10 flex flex-col items-center justify-center text-center rounded-xl">
                  <Smartphone className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">No Buddy Enlisted</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {buddies.map(buddy => (
                    <Card key={buddy.id} className="bg-card border-none shadow-2xl">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xl font-bold uppercase text-foreground">{buddy.name}</p>
                            <p className="text-[10px] font-mono text-accent">{buddy.phoneNumber}</p>
                          </div>
                          <Badge className="bg-accent text-accent-foreground text-[8px] uppercase font-bold">ACTIVE</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-1">
                          {buddy.groups?.map((g: string) => (
                            <Badge key={g} variant="outline" className="border-accent/30 text-[8px] uppercase font-bold text-accent">{g}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-indigo-900/20">
                          <Button variant="ghost" size="sm" className="text-[8px] uppercase font-bold hover:bg-background" onClick={() => { setItemToView(buddy); setIsViewItemDialogOpen(true); }}><Eye className="h-3 w-3 mr-1" /> View</Button>
                          <Button variant="ghost" size="sm" className="text-[8px] uppercase font-bold hover:bg-background" onClick={() => { setItemToEdit(buddy); setIsEditBuddyDialogOpen(true); }}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                          <Button variant="ghost" size="sm" className="text-[8px] uppercase font-bold hover:text-destructive" onClick={() => { setItemToDelete({ ...buddy, type: 'buddy' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="space-y-6">
              <Button onClick={() => setIsAddNodeDialogOpen(true)} className="bg-primary hover:bg-secondary uppercase font-bold text-[10px] gap-2 h-12">
                <PlusSquare className="h-4 w-4" /> Arm Node
              </Button>

              {nodes.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-indigo-900/30 bg-card/10 flex flex-col items-center justify-center text-center rounded-xl">
                  <Cpu className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">No Nodes Armed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nodes.map(node => (
                    <Card key={node.id} className="bg-card border-none shadow-2xl">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xl font-bold uppercase text-foreground">{node.nodeName}</p>
                          <div className={cn("h-3 w-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(76,201,240,0.5)]", node.status === 'online' ? 'bg-accent' : 'bg-destructive')} />
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground">ID: {node.hardwareId}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Target groups:</p>
                          <div className="flex flex-wrap gap-1">
                            {node.targetGroups?.map((g: string) => (
                              <Badge key={g} className="bg-indigo-900/30 text-muted-foreground text-[8px] uppercase font-bold">{g}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-indigo-900/20">
                          <Button 
                            variant={sosStatus?.sosTrigger && sosStatus?.triggeredByNode === node.id ? "destructive" : "default"} 
                            size="sm" 
                            className={cn(
                              "text-[8px] uppercase font-bold gap-2 flex-1",
                              !(sosStatus?.sosTrigger && sosStatus?.triggeredByNode === node.id) && "bg-accent text-accent-foreground hover:bg-accent/80"
                            )} 
                            onClick={() => triggerNodeAlert(node)}
                          >
                            <Zap className="h-3 w-3" /> 
                            {sosStatus?.sosTrigger && sosStatus?.triggeredByNode === node.id ? "Reset SOS" : "Trigger SOS"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-[8px] uppercase font-bold hover:bg-background" onClick={() => { setItemToEdit(node); setIsEditNodeDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="text-[8px] uppercase font-bold hover:text-destructive" onClick={() => { setItemToDelete({ ...node, type: 'node' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
               <header className="mb-2">
                <h2 className="text-4xl font-headline font-bold tracking-tighter uppercase text-foreground">Safety Alerts</h2>
              </header>
              <ScrollArea className="h-[550px] border border-indigo-900/20 p-6 rounded-xl bg-card shadow-inner">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 text-muted-foreground">
                    <Bell className="h-16 w-16 mb-4" />
                    <p className="text-[12px] font-bold uppercase tracking-widest">No Alerts In Queue</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="mb-6 pb-6 border-b border-indigo-900/20 last:border-0 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold uppercase text-foreground">{n.message}</p>
                        <Badge variant="outline" className="border-accent/30 text-accent text-[8px] font-mono">{hasMounted ? new Date(n.createdAt).toLocaleTimeString() : '...'}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">
                        {hasMounted ? new Date(n.createdAt).toLocaleDateString() : 'Loading...'}
                      </p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md space-y-6">
              <Card className="bg-card border-none shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground">User Terminal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-background/50 border border-indigo-900/20 rounded-md">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Assigned ID</p>
                    <p className="text-[10px] font-mono text-accent truncate">{user.uid}</p>
                  </div>
                </CardContent>
              </Card>
              <Button variant="destructive" onClick={() => signOut(auth).then(() => router.push("/login"))} className="w-full uppercase font-bold h-16 tracking-[0.2em] gap-2 shadow-2xl">
                <LogOut className="h-4 w-4" /> Terminate Session
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isAddBuddyDialogOpen} onOpenChange={setIsAddBuddyDialogOpen}>
        <DialogContent className="bg-background border-indigo-900/30">
          <DialogHeader><DialogTitle className="uppercase font-bold text-foreground">Enlist Buddy</DialogTitle></DialogHeader>
          <form onSubmit={handleRegisterBuddy} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</Label>
              <Input value={buddyForm.name} onChange={e => setBuddyForm({...buddyForm, name: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</Label>
              <Input value={buddyForm.phoneNumber} onChange={e => setBuddyForm({...buddyForm, phoneNumber: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Protocol Groups</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-indigo-900/20 rounded-md bg-input/10">
                {buddyGroups.map(g => (
                  <div key={g} className="flex items-center gap-3">
                    <Checkbox checked={buddyForm.groups.includes(g)} onCheckedChange={() => {
                      const updated = buddyForm.groups.includes(g) ? buddyForm.groups.filter(x => x !== g) : [...buddyForm.groups, g];
                      setBuddyForm({...buddyForm, groups: updated});
                    }} className="border-accent data-[state=checked]:bg-accent" />
                    <span className="text-[10px] uppercase font-bold text-foreground">{g}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary uppercase font-bold tracking-widest" disabled={registerLoading}>
              {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Buddy"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBuddyDialogOpen} onOpenChange={setIsEditBuddyDialogOpen}>
        <DialogContent className="bg-background border-indigo-900/30">
          <DialogHeader><DialogTitle className="uppercase font-bold text-foreground">Edit Buddy</DialogTitle></DialogHeader>
          {itemToEdit && (
            <form onSubmit={handleUpdateBuddy} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</Label>
                <Input value={itemToEdit.name} onChange={e => setItemToEdit({...itemToEdit, name: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</Label>
                <Input value={itemToEdit.phoneNumber} onChange={e => setItemToEdit({...itemToEdit, phoneNumber: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Protocol Groups</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border border-indigo-900/20 rounded-md bg-input/10">
                  {buddyGroups.map(g => (
                    <div key={g} className="flex items-center gap-3">
                      <Checkbox checked={itemToEdit.groups?.includes(g)} onCheckedChange={() => {
                        const groups = itemToEdit.groups || [];
                        const updated = groups.includes(g) ? groups.filter((x: string) => x !== g) : [...groups, g];
                        setItemToEdit({...itemToEdit, groups: updated});
                      }} className="border-accent data-[state=checked]:bg-accent" />
                      <span className="text-[10px] uppercase font-bold text-foreground">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary uppercase font-bold tracking-widest" disabled={registerLoading}>
                {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Buddy"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent className="bg-background border-indigo-900/30">
          <DialogHeader><DialogTitle className="uppercase font-bold text-foreground">Arm Node</DialogTitle></DialogHeader>
          <form onSubmit={handleRegisterNode} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Node Name</Label>
              <Input value={nodeForm.nodeName} onChange={e => setNodeForm({...nodeForm, nodeName: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Hardware ID</Label>
              <Input value={nodeForm.hardwareId} onChange={e => setNodeForm({...nodeForm, hardwareId: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Target Alert Groups</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-indigo-900/20 rounded-md bg-input/10">
                {buddyGroups.map(g => (
                  <div key={g} className="flex items-center gap-3">
                    <Checkbox checked={nodeForm.targetGroups.includes(g)} onCheckedChange={() => {
                      const updated = nodeForm.targetGroups.includes(g) ? nodeForm.targetGroups.filter(x => x !== g) : [...nodeForm.targetGroups, g];
                      setNodeForm({...nodeForm, targetGroups: updated});
                    }} className="border-accent data-[state=checked]:bg-accent" />
                    <span className="text-[10px] uppercase font-bold text-foreground">{g}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary uppercase font-bold tracking-widest" disabled={registerLoading}>
              {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Arm Hardware"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditNodeDialogOpen} onOpenChange={setIsEditNodeDialogOpen}>
        <DialogContent className="bg-background border-indigo-900/30">
          <DialogHeader><DialogTitle className="uppercase font-bold text-foreground">Edit Node</DialogTitle></DialogHeader>
          {itemToEdit && (
            <form onSubmit={handleUpdateNode} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Node Name</Label>
                <Input value={itemToEdit.nodeName} onChange={e => setItemToEdit({...itemToEdit, nodeName: e.target.value})} className="bg-input border-indigo-900/20 focus:border-secondary h-12" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Hardware ID</Label>
                <Input value={itemToEdit.hardwareId} disabled className="bg-input/50 opacity-50 h-12 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Target Alert Groups</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border border-indigo-900/20 rounded-md bg-input/10">
                  {buddyGroups.map(g => (
                    <div key={g} className="flex items-center gap-3">
                      <Checkbox checked={itemToEdit.targetGroups?.includes(g)} onCheckedChange={() => {
                        const groups = itemToEdit.targetGroups || [];
                        const updated = groups.includes(g) ? groups.filter((x: string) => x !== g) : [...groups, g];
                        setItemToEdit({...itemToEdit, targetGroups: updated});
                      }} className="border-accent data-[state=checked]:bg-accent" />
                      <span className="text-[10px] uppercase font-bold text-foreground">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary uppercase font-bold tracking-widest" disabled={registerLoading}>
                {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Node"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewItemDialogOpen} onOpenChange={setIsViewItemDialogOpen}>
        <DialogContent className="bg-background border-indigo-900/30">
          <DialogHeader><DialogTitle className="uppercase font-bold text-foreground">Asset Overview</DialogTitle></DialogHeader>
          {itemToView && (
            <div className="space-y-4 pt-4">
               <div className="p-6 bg-card border-none rounded-xl shadow-2xl">
                  <p className="text-[10px] uppercase font-bold text-accent mb-2">Asset Identity</p>
                  <p className="text-2xl font-bold uppercase text-foreground">{itemToView.name || itemToView.nodeName}</p>
                  <p className="text-xs font-mono mt-2 text-muted-foreground">{itemToView.phoneNumber || itemToView.hardwareId}</p>
               </div>
               <div className="p-6 bg-card border-none rounded-xl shadow-2xl">
                  <p className="text-[10px] uppercase font-bold text-accent mb-2">Assigned Protocols</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(itemToView.groups || itemToView.targetGroups || []).map((g: string) => (
                      <Badge key={g} className="bg-secondary text-foreground text-[10px] uppercase font-bold py-1 px-3">{g}</Badge>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isManageGroupsDialogOpen} onOpenChange={setIsManageGroupsDialogOpen}>
        <DialogContent className="bg-background border-indigo-900/30">
          <DialogHeader><DialogTitle className="uppercase font-bold text-foreground">Manage Protocols</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex gap-2">
              <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="NEW PROTOCOL GROUP" className="bg-input border-indigo-900/20 focus:border-secondary h-12 uppercase text-[10px] font-bold tracking-widest" />
              <Button onClick={() => {
                if (!user || !newGroupName) return;
                push(ref(rtdb, `users/${user.uid}/buddyGroups`), { name: newGroupName });
                setNewGroupName("");
              }} className="bg-primary hover:bg-secondary h-12 w-12 p-0"><PlusCircle className="h-5 w-5" /></Button>
            </div>
            <ScrollArea className="h-64 border border-indigo-900/20 p-4 rounded-md bg-input/5">
              <div className="space-y-2">
                {buddyGroups.map(g => (
                  <div key={g} className="p-4 bg-card border-none flex justify-between items-center rounded-lg shadow-md">
                    <span className="text-[10px] uppercase font-bold text-foreground">{g}</span>
                    {!DEFAULT_BUDDY_GROUPS.includes(g) && (
                      <Button variant="ghost" size="sm" className="hover:text-destructive" onClick={() => {
                        const gId = Object.entries(customGroupsData || {}).find(([k, v]: any) => v.name === g)?.[0];
                        if (gId) remove(ref(rtdb, `users/${user.uid}/buddyGroups/${gId}`));
                      }}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-indigo-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-bold text-foreground">Purge Asset?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs uppercase text-muted-foreground/60">This action is permanent and final.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              if (!user || !itemToDelete) return;
              const path = itemToDelete.type === 'buddy' ? `users/${user.uid}/buddies/${itemToDelete.id}` : `users/${user.uid}/nodes/${itemToDelete.id}`;
              remove(ref(rtdb, path)).then(() => {
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
              });
            }} className="text-[10px] font-bold uppercase bg-destructive text-destructive-foreground hover:bg-destructive/90 px-8 h-12">Purge</AlertDialogAction>
            <AlertDialogCancel className="text-[10px] font-bold uppercase border-indigo-900/30 h-12 px-8">Abort</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}