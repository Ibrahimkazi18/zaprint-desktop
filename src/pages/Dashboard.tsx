import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { PrintJob } from "@/types";
import { useToast } from "@/components/toast/useToast";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Dashboard() {
  console.log("Rendering dashboard");
  const { show } = useToast();

  // Mock queue data
  const [queue, setQueue] = useState<PrintJob[]>([
    {
      id: "job-001",
      customerName: "John Doe",
      jobType: "Document Print",
      status: "Printing",
      pages: 10,
      copies: 2,
      colorMode: "Color",
      paperSize: "A4",
      binding: "None",
      notes: "Urgent delivery",
      estimatedTime: "5 mins",
    },
    {
      id: "job-002",
      customerName: "Jane Smith",
      jobType: "Poster Print",
      status: "Queued",
      pages: 1,
      copies: 5,
      colorMode: "Color",
      paperSize: "A3",
      binding: "None",
      notes: "High quality gloss",
      estimatedTime: "20 mins",
    },
    {
      id: "job-003",
      customerName: "Alex Johnson",
      jobType: "Thesis Binding",
      status: "Queued",
      pages: 150,
      copies: 1,
      colorMode: "B&W",
      paperSize: "A4",
      binding: "Spiral",
      notes: "Include cover page",
      estimatedTime: "30 mins",
    },
  ]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...queue];
    [newQueue[index - 1], newQueue[index]] = [
      newQueue[index],
      newQueue[index - 1],
    ];
    setQueue(newQueue);
    show({
      title: "Queue Updated",
      variant: "success",
      description: `Moved ${newQueue[index - 1].customerName}'s job up`,
    });
  };

  const moveDown = (index: number) => {
    if (index === queue.length - 1) return;
    const newQueue = [...queue];
    [newQueue[index], newQueue[index + 1]] = [
      newQueue[index + 1],
      newQueue[index],
    ];
    setQueue(newQueue);
    show({
      title: "Queue Updated",
      variant: "success",
      description: `Moved ${newQueue[index + 1].customerName}'s job down`,
    });
  };

  const fetchQueue = async () => {
    show({
      title: "Refreshing Queue",
      variant: "loading",
      description: "Fetching latest print jobs...",
    });
    // Simulate API call
    setTimeout(() => {
      show({
        title: "Queue Refreshed",
        variant: "success",
        description: "Print queue is up to date",
      });
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Print Jobs Today</h3>
            <p className="text-3xl font-bold mt-4">12</p>
            <p className="text-sm text-muted-foreground mt-2">
              +3 from yesterday
            </p>
          </div>
          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Active Customers</h3>
            <p className="text-3xl font-bold mt-4">45</p>
            <p className="text-sm text-muted-foreground mt-2">Ready for more</p>
          </div>
          <div className="rounded-lg border dark:border-slate-700 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Shop Rating</h3>
            <p className="text-3xl font-bold mt-4">4.8 ★</p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on 120 reviews
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Queue Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ongoing Print Queue</h2>
            <Button variant="outline" onClick={fetchQueue}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Total Queued: {queue.length} | Estimated Total Wait: 55 mins
          </div>

          {queue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No jobs in queue. Relax! ☕
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Rearrange</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((job, index) => (
                  <TableRow
                    key={job.id}
                    className="hover:bg-muted/50 dark:border-slate-700 transition-colors"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.customerName}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "Printing"
                            ? "default"
                            : job.status === "Queued"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border dark:border-slate-700 border-input hover:bg-accent"
                          >
                            Show Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Job Details: {job.id}</DialogTitle>
                            <DialogDescription>
                              Detailed information for this print job.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4 text-background">
                            <p className="text-foreground">
                              <strong>Type:</strong> {job.jobType}
                            </p>
                            <p className="text-foreground">
                              <strong>Color Mode:</strong> {job.colorMode}
                            </p>
                            <p className="text-foreground">
                              <strong>Paper Size:</strong> {job.paperSize}
                            </p>
                            <p className="text-foreground">
                              <strong>Pages:</strong> {job.pages}
                            </p>
                            <p className="text-foreground">
                              <strong>Copies:</strong> {job.copies}
                            </p>
                            <p className="text-foreground">
                              <strong>Binding:</strong> {job.binding || "None"}
                            </p>
                            <p className="text-foreground">
                              <strong>Notes:</strong> {job.notes || "N/A"}
                            </p>
                            <p className="text-foreground">
                              <strong>Estimated Time:</strong>{" "}
                              {job.estimatedTime}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveDown(index)}
                        disabled={index === queue.length - 1}
                        className="h-8 w-8"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Separator className="my-8" />

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <ul className="space-y-4">
            <li className="flex items-center justify-between text-sm">
              <span>Job-001 started printing</span>
              <span className="text-muted-foreground">2 mins ago</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span>New job added by Jane Smith</span>
              <span className="text-muted-foreground">15 mins ago</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span>Shop rating updated to 4.8</span>
              <span className="text-muted-foreground">1 hour ago</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
