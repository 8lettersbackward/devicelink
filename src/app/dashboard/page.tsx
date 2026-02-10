
"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Activity, 
  Settings, 
  Plus, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Mail,
  Calendar
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-muted rounded"></div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Welcome back, {user.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground">Your minimal workspace is ready.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">+12%</span>
            </div>
            <h3 className="text-2xl font-bold">24</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed Tasks</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">-3%</span>
            </div>
            <h3 className="text-2xl font-bold">12h</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Time Spent</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">+24%</span>
            </div>
            <h3 className="text-2xl font-bold">84%</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Productivity Score</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">New</span>
            </div>
            <h3 className="text-2xl font-bold">5</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Messages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none h-auto p-0 space-x-8">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-0 font-medium">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-0 font-medium">Projects</TabsTrigger>
          <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-0 font-medium">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Keep track of your latest movements.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Updated project "Minimalist Redesign"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
                <CardDescription>Meetings and deadlines for the week.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                   {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded bg-secondary/30 flex items-center justify-center text-xs font-bold group-hover:bg-secondary transition-colors">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Project Review Sync</p>
                          <p className="text-xs text-muted-foreground">May 2{i}, 10:00 AM</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Join</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="projects">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                       <CardTitle className="text-base font-bold">Workspace {i}</CardTitle>
                       <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary font-bold uppercase">Active</span>
                    </div>
                    <CardDescription>A brief description of this minimalist workspace project.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center -space-x-2">
                      {[1, 2, 3].map(avatar => (
                        <div key={avatar} className="h-8 w-8 rounded-full border-2 border-background bg-muted" />
                      ))}
                      <div className="h-8 w-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">+2</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
