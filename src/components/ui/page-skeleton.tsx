import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "./card";

interface PageSkeletonProps {
  title?: string;
  showStats?: boolean;
  showTable?: boolean;
  showForm?: boolean;
}

const PageSkeleton = ({
  title = "Loading...",
  showStats = false,
  showTable = false,
  showForm = false,
}: PageSkeletonProps) => {
  const shimmer = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
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

      {/* Stats Cards (if enabled) */}
      {showStats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
      )}

      {/* Form Skeleton (if enabled) */}
      {showForm && (
        <Card className="max-w-2xl">
          <CardHeader>
            <motion.div
              className="h-6 w-48 bg-muted rounded mb-2"
              variants={shimmer}
              animate="animate"
            />
            <motion.div
              className="h-4 w-64 bg-muted rounded"
              variants={shimmer}
              animate="animate"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <motion.div
                  className="h-4 w-32 bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
                <motion.div
                  className="h-10 w-full bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
              </div>
            ))}
            <motion.div
              className="h-10 w-32 bg-muted rounded"
              variants={shimmer}
              animate="animate"
            />
          </CardContent>
        </Card>
      )}

      {/* Table Skeleton (if enabled) */}
      {showTable && (
        <Card>
          <CardHeader>
            <motion.div
              className="h-6 w-48 bg-muted rounded"
              variants={shimmer}
              animate="animate"
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-border">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-4 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                ))}
              </div>
              {/* Table Rows */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4 py-3">
                  {[0, 1, 2, 3].map((j) => (
                    <motion.div
                      key={j}
                      className="h-4 bg-muted rounded"
                      variants={shimmer}
                      animate="animate"
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generic Content Cards (if no specific layout) */}
      {!showStats && !showTable && !showForm && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <motion.div
                  className="h-6 w-32 bg-muted rounded mb-2"
                  variants={shimmer}
                  animate="animate"
                />
                <motion.div
                  className="h-4 w-48 bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.div
                  className="h-32 bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
                <motion.div
                  className="h-4 w-full bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
                <motion.div
                  className="h-4 w-3/4 bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageSkeleton;
