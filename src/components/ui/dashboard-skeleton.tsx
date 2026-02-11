import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "./card";

const DashboardSkeleton = () => {
  const shimmer = {
    animate: {
      background: [
        "hsl(var(--muted))",
        "hsl(var(--muted) / 0.7)",
        "hsl(var(--muted))",
      ],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  const pulse = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [0.98, 1, 0.98],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeIn}
        className="space-y-2"
      >
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
      </motion.div>

      {/* Stats Grid Skeleton */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} custom={i + 1} variants={fadeIn}>
            <motion.div variants={pulse} animate="animate">
              <Card>
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
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Financial Cards Skeleton */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2].map((i) => (
          <motion.div key={i} custom={i + 5} variants={fadeIn}>
            <motion.div variants={pulse} animate="animate">
              <Card>
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
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Print Queue Skeleton */}
        <motion.div
          className="lg:col-span-2"
          custom={8}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={pulse} animate="animate">
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
          </motion.div>
        </motion.div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Printer Status Skeleton */}
          <motion.div
            custom={9}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={pulse} animate="animate">
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
            </motion.div>
          </motion.div>

          {/* Recent Activity Skeleton */}
          <motion.div
            custom={10}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={pulse} animate="animate">
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
