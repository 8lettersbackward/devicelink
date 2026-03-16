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
        latitude: lat || null,
        longitude: lng || null,
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#12086F] to-[#2B35AF]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { id: 'buddies', label: 'Buddies', icon: Smartphone },
    { id: 'nodes', label: 'Nodes', icon: Cpu },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Setup', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#12086F] to-[#2B35AF]">
      <aside className="w-full md:w-72 bg-transparent p-6 order-1">
        <div className="glass-card rounded-[32px] p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <Avatar className="h-14 w-14 rounded-2xl border-2 border-accent/30">
              <AvatarFallback className="rounded-2xl bg-primary/20 text-accent font-bold text-xl">
                {currentName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-bold tracking-tight text-white truncate">{currentName}</p>
              <p className="text-[10px] text-accent/80 font-mono truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2 pt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 transition-all rounded-2xl",
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "hover:bg-white/5 text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-white" : "text-muted-foreground")} />
                <span className="text-xs font-bold tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 order-2">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'buddies' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Buddy Hub</h1>
                <div className="flex gap-3">
                  <Button onClick={() => setIsAddBuddyDialogOpen(true)} className="bg-primary hover:bg-secondary rounded-2xl h-12 px-6 font-bold text-xs">
                    <UserPlus className="h-4 w-4 mr-2" /> Enlist
                  </Button>
                  <Button onClick={() => setIsManageGroupsDialogOpen(true)} variant="ghost" className="glass-card hover:bg-white/5 rounded-2xl h-12 px-6 font-bold text-xs text-white">
                    <Layers className="h-4 w-4 mr-2" /> Protocols
                  </Button>
                </div>
              </div>

              {buddies.length === 0 ? (
                <Card className="glass-card border-none rounded-[32px] p-24 text-center">
                  <Smartphone className="h-16 w-16 text-accent/20 mx-auto mb-6" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Active Personnel</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buddies.map(buddy => (
                    <Card key={buddy.id} className="glass-card border-none rounded-[32px] overflow-hidden group">
                      <CardHeader className="p-6 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-bold text-white">{buddy.name}</p>
                            <p className="text-xs font-mono text-accent/60">{buddy.phoneNumber}</p>
                          </div>
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] rounded-lg">ACTIVE</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 space-y-6">
                        <div className="flex flex-wrap gap-1.5">
                          {buddy.groups?.map((g: string) => (
                            <Badge key={g} variant="outline" className="bg-white/5 border-white/10 text-[9px] text-muted-foreground px-2 py-0.5 rounded-lg">{g}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs hover:bg-white/10 flex-1" onClick={() => { setItemToView(buddy); setIsViewItemDialogOpen(true); }}><Eye className="h-3.5 w-3.5 mr-2" /> View</Button>
                          <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs hover:bg-white/10 flex-1" onClick={() => { setItemToEdit(buddy); setIsEditBuddyDialogOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</Button>
                          <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs hover:bg-destructive/10 text-destructive" onClick={() => { setItemToDelete({ ...buddy, type: 'buddy' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Hardware Hub</h1>
                <Button onClick={() => setIsAddNodeDialogOpen(true)} className="bg-primary hover:bg-secondary rounded-2xl h-12 px-6 font-bold text-xs">
                  <PlusSquare className="h-4 w-4 mr-2" /> Arm Hardware
                </Button>
              </div>

              {nodes.length === 0 ? (
                <Card className="glass-card border-none rounded-[32px] p-24 text-center">
                  <Cpu className="h-16 w-16 text-accent/20 mx-auto mb-6" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Linked Systems</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nodes.map(node => (
                    <Card key={node.id} className="glass-card border-none rounded-[32px] overflow-hidden group">
                      <CardHeader className="p-6 pb-2">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold text-white">{node.nodeName}</p>
                          <div className={cn("h-3 w-3 rounded-full shadow-[0_0_12px_rgba(76,201,240,0.5)]", node.status === 'online' ? 'bg-accent animate-pulse' : 'bg-muted')} />
                        </div>
                        <p className="text-xs font-mono text-muted-foreground/60">ID: {node.hardwareId}</p>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 space-y-6">
                        <div className="flex flex-wrap gap-1.5">
                          {node.targetGroups?.map((g: string) => (
                            <Badge key={g} className="bg-white/5 border-white/10 text-muted-foreground text-[9px] rounded-lg">{g}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-white/5">
                          <Button 
                            variant={sosStatus?.sosTrigger && sosStatus?.triggeredByNode === node.id ? "destructive" : "default"} 
                            className={cn(
                              "h-11 rounded-2xl text-[10px] font-bold flex-1 tracking-widest uppercase",
                              !(sosStatus?.sosTrigger && sosStatus?.triggeredByNode === node.id) && "bg-accent text-accent-foreground hover:bg-accent/80"
                            )} 
                            onClick={() => triggerNodeAlert(node)}
                          >
                            <Zap className="h-4 w-4 mr-2" /> 
                            {sosStatus?.sosTrigger && sosStatus?.triggeredByNode === node.id ? "Reset SOS" : "Trigger SOS"}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-white/10" onClick={() => { setItemToEdit(node); setIsEditNodeDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">Safety Ledger</h1>
              <Card className="glass-card border-none rounded-[32px] overflow-hidden">
                <ScrollArea className="h-[600px] p-8">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 opacity-20 text-muted-foreground">
                      <Bell className="h-20 w-20 mb-6" />
                      <p className="text-sm font-bold uppercase tracking-[0.2em]">Queue Clear</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="mb-8 pb-8 border-b border-white/5 last:border-0 last:mb-0">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-base font-bold text-white">{n.message}</p>
                          <Badge variant="outline" className="border-accent/20 text-accent text-[10px] font-mono px-3 rounded-lg">{hasMounted ? new Date(n.createdAt).toLocaleTimeString() : '...'}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 font-mono uppercase">
                          {hasMounted ? new Date(n.createdAt).toLocaleDateString() : 'Loading...'}
                        </p>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md space-y-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">System Config</h1>
              <Card className="glass-card border-none rounded-[32px] p-8 space-y-8">
                <div className="space-y-4">
                  <div className="p-6 bg-white/5 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Global Terminal ID</p>
                    <p className="text-xs font-mono text-white/80 truncate">{user.uid}</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => signOut(auth).then(() => router.push("/login"))} className="w-full h-14 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase">
                  <LogOut className="h-4 w-4 mr-2" /> Terminate Session
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isAddBuddyDialogOpen} onOpenChange={setIsAddBuddyDialogOpen}>
        <DialogContent className="glass-card border-none rounded-[32px] max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold text-white">Enlist Buddy</DialogTitle></DialogHeader>
          <form onSubmit={handleRegisterBuddy} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Identity</Label>
              <Input value={buddyForm.name} onChange={e => setBuddyForm({...buddyForm, name: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Comms</Label>
              <Input value={buddyForm.phoneNumber} onChange={e => setBuddyForm({...buddyForm, phoneNumber: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocols</Label>
              <div className="grid grid-cols-2 gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                {buddyGroups.map(g => (
                  <div key={g} className="flex items-center gap-3">
                    <Checkbox checked={buddyForm.groups.includes(g)} onCheckedChange={() => {
                      const updated = buddyForm.groups.includes(g) ? buddyForm.groups.filter(x => x !== g) : [...buddyForm.groups, g];
                      setBuddyForm({...buddyForm, groups: updated});
                    }} className="rounded-md border-white/20 data-[state=checked]:bg-accent" />
                    <span className="text-[11px] font-bold text-white/70">{g}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary rounded-2xl font-bold text-xs uppercase tracking-widest" disabled={registerLoading}>
              {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Agent"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBuddyDialogOpen} onOpenChange={setIsEditBuddyDialogOpen}>
        <DialogContent className="glass-card border-none rounded-[32px] max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold text-white">Modify Buddy</DialogTitle></DialogHeader>
          {itemToEdit && (
            <form onSubmit={handleUpdateBuddy} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Identity</Label>
                <Input value={itemToEdit.name} onChange={e => setItemToEdit({...itemToEdit, name: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Comms</Label>
                <Input value={itemToEdit.phoneNumber} onChange={e => setItemToEdit({...itemToEdit, phoneNumber: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocols</Label>
                <div className="grid grid-cols-2 gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                  {buddyGroups.map(g => (
                    <div key={g} className="flex items-center gap-3">
                      <Checkbox checked={itemToEdit.groups?.includes(g)} onCheckedChange={() => {
                        const groups = itemToEdit.groups || [];
                        const updated = groups.includes(g) ? groups.filter((x: string) => x !== g) : [...groups, g];
                        setItemToEdit({...itemToEdit, groups: updated});
                      }} className="rounded-md border-white/20 data-[state=checked]:bg-accent" />
                      <span className="text-[11px] font-bold text-white/70">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary rounded-2xl font-bold text-xs uppercase tracking-widest" disabled={registerLoading}>
                {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync Hub"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent className="glass-card border-none rounded-[32px] max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold text-white">Arm Node</DialogTitle></DialogHeader>
          <form onSubmit={handleRegisterNode} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Node ID</Label>
              <Input value={nodeForm.nodeName} onChange={e => setNodeForm({...nodeForm, nodeName: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hardware Signature</Label>
              <Input value={nodeForm.hardwareId} onChange={e => setNodeForm({...nodeForm, hardwareId: e.target.value})} className="bg-white/5 border-white/10 rounded-2xl h-14" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alert Protocols</Label>
              <div className="grid grid-cols-2 gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                {buddyGroups.map(g => (
                  <div key={g} className="flex items-center gap-3">
                    <Checkbox checked={nodeForm.targetGroups.includes(g)} onCheckedChange={() => {
                      const updated = nodeForm.targetGroups.includes(g) ? nodeForm.targetGroups.filter(x => x !== g) : [...nodeForm.targetGroups, g];
                      setNodeForm({...nodeForm, targetGroups: updated});
                    }} className="rounded-md border-white/20 data-[state=checked]:bg-accent" />
                    <span className="text-[11px] font-bold text-white/70">{g}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-primary hover:bg-secondary rounded-2xl font-bold text-xs uppercase tracking-widest" disabled={registerLoading}>
              {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageGroupsDialogOpen} onOpenChange={setIsManageGroupsDialogOpen}>
        <DialogContent className="glass-card border-none rounded-[32px] max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold text-white">Protocol Hub</DialogTitle></DialogHeader>
          <div className="space-y-8 pt-6">
            <div className="flex gap-3">
              <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="PROTOCOL NAME" className="bg-white/5 border-white/10 rounded-2xl h-14 text-xs font-bold tracking-widest" />
              <Button onClick={() => {
                if (!user || !newGroupName) return;
                push(ref(rtdb, `users/${user.uid}/buddyGroups`), { name: newGroupName });
                setNewGroupName("");
              }} className="bg-primary hover:bg-secondary h-14 w-14 rounded-2xl p-0"><PlusCircle className="h-6 w-6" /></Button>
            </div>
            <ScrollArea className="h-72 p-1">
              <div className="space-y-3">
                {buddyGroups.map(g => (
                  <div key={g} className="p-5 bg-white/5 rounded-2xl flex justify-between items-center group/item hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-white/90">{g}</span>
                    {!DEFAULT_BUDDY_GROUPS.includes(g) && (
                      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-destructive/20 text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={() => {
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
        <AlertDialogContent className="glass-card border-none rounded-[32px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white">Purge Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">This asset will be permanently erased from the safety hub.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 border-white/10">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!user || !itemToDelete) return;
              const path = itemToDelete.type === 'buddy' ? `users/${user.uid}/buddies/${itemToDelete.id}` : `users/${user.uid}/nodes/${itemToDelete.id}`;
              remove(ref(rtdb, path)).then(() => {
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
              });
            }} className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest bg-destructive hover:bg-destructive/90">Purge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}