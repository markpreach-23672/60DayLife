import { useGetAdminStats, useGetAdminUsers, useGetAdminActivity, useSendTestEmail } from "@workspace/api-client-react";
import { Users, CheckCircle, BarChart3, Activity, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Admin() {
  const { data: stats, isLoading: loadingStats } = useGetAdminStats();
  const { data: users, isLoading: loadingUsers } = useGetAdminUsers();
  const { data: activity, isLoading: loadingActivity } = useGetAdminActivity();
  const sendEmail = useSendTestEmail();
  const { toast } = useToast();

  const handleTestEmail = () => {
    sendEmail.mutate(
      { data: { email: "test@example.com", day: 1 } },
      {
        onSuccess: () => toast({ title: "Email sent" }),
        onError: () => toast({ title: "Failed to send email", variant: "destructive" })
      }
    );
  };

  if (loadingStats || loadingUsers || loadingActivity) {
    return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!stats || !users || !activity) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-foreground">Admin Dashboard</h1>
        <Button onClick={handleTestEmail} variant="outline" disabled={sendEmail.isPending}>
          <Mail className="w-4 h-4 mr-2" />
          {sendEmail.isPending ? "Sending..." : "Send Test Email"}
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days Complete</CardTitle>
            <BarChart3 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageDaysCompleted)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead className="text-right">Days Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="font-medium">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell>
                          {u.isComplete ? "Completed" : `Phase ${u.currentPhase}`}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {u.daysCompleted}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activity.map(event => (
                  <div key={event.id} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{event.userName || event.userEmail}</span>{" "}
                        {event.detail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.occurredAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="text-sm text-muted-foreground">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}