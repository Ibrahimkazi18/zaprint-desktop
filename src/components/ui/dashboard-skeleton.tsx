import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "./card";

const DashboardSkeleton = () => {
  // Simplified shimmer - only opacity animation
  const shimmer = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <motion.div
          className="h-9 w-64 bg-muted rounded"
          variants={shimmer}
          animate="animate"
        />
        <motion.div
          className="h-5 w-96 bg-muted rounded"
          variants={shimmer}
          animate="animate"
        />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <motion.div
                className="h-4 w-24 bg-muted rounded mb-2"
                variants={shimmer}
                animate="animate"
              />
              <motion.div
                className="h-8 w-16 bg-muted rounded"
                variants={shimmer}
                animate="animate"
              />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Financial Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <motion.div
                className="h-4 w-32 bg-muted rounded mb-3"
                variants={shimmer}
                animate="animate"
              />
              <motion.div
                className="h-8 w-24 bg-muted rounded mb-2"
                variants={shimmer}
                animate="animate"
              />
              <motion.div
                className="h-3 w-28 bg-muted rounded"
                variants={shimmer}
                animate="animate"
              />
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
                  <motion.div
                    className="h-6 w-32 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                  <motion.div
                    className="h-4 w-48 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                </div>
                <motion.div
                  className="h-9 w-24 bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-16 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
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
              <motion.div
                className="h-6 w-32 bg-muted rounded"
                variants={shimmer}
                animate="animate"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="h-20 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card>
            <CardHeader>
              <motion.div
                className="h-6 w-36 bg-muted rounded"
                variants={shimmer}
                animate="animate"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-muted mt-2"
                      variants={shimmer}
                      animate="animate"
                    />
                    <div className="flex-1 space-y-2">
                      <motion.div
                        className="h-4 w-full bg-muted rounded"
                        variants={shimmer}
                        animate="animate"
                      />
                      <motion.div
                        className="h-3 w-20 bg-muted rounded"
                        variants={shimmer}
                        animate="animate"
                      />
                    </div>
                  </div>
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
