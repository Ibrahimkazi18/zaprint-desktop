import { Card, CardContent, CardHeader } from "./card";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-64 bg-muted rounded" />
        <div className="h-5 w-96 bg-muted rounded" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Financial Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-32 bg-muted rounded mb-3" />
              <div className="h-8 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-28 bg-muted rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Print Queue Skeleton */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
                <div className="h-9 w-24 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Printer Status Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
