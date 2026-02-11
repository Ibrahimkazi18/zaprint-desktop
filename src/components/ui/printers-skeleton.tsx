import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "./card";

const PrintersSkeleton = () => {
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Skeleton */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeIn}
      >
        <div className="space-y-2">
          <motion.div
            className="h-9 w-48 bg-muted rounded"
            variants={shimmer}
            animate="animate"
          />
          <motion.div
            className="h-5 w-80 bg-muted rounded"
            variants={shimmer}
            animate="animate"
          />
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-32 bg-muted rounded"
            variants={shimmer}
            animate="animate"
          />
          <motion.div
            className="h-10 w-32 bg-muted rounded"
            variants={shimmer}
            animate="animate"
          />
        </div>
      </motion.div>

      {/* Stats Cards Skeleton */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} custom={i + 1} variants={fadeIn}>
            <Card>
              <CardHeader className="pb-3">
                <motion.div
                  className="h-4 w-24 bg-muted rounded mb-2"
                  variants={shimmer}
                  animate="animate"
                />
                <motion.div
                  className="h-8 w-12 bg-muted rounded"
                  variants={shimmer}
                  animate="animate"
                />
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Printer Cards Grid Skeleton */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div key={i} custom={i + 5} variants={fadeIn}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-10 h-10 bg-muted rounded-lg"
                      variants={shimmer}
                      animate="animate"
                    />
                    <div className="space-y-2">
                      <motion.div
                        className="h-5 w-32 bg-muted rounded"
                        variants={shimmer}
                        animate="animate"
                      />
                      <motion.div
                        className="h-4 w-24 bg-muted rounded"
                        variants={shimmer}
                        animate="animate"
                      />
                    </div>
                  </div>
                  <motion.div
                    className="h-6 w-16 bg-muted rounded-full"
                    variants={shimmer}
                    animate="animate"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Box */}
                <motion.div
                  className="h-16 bg-muted rounded-lg"
                  variants={shimmer}
                  animate="animate"
                />

                {/* Services */}
                <div className="space-y-2">
                  <motion.div
                    className="h-4 w-32 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[0, 1, 2].map((j) => (
                      <motion.div
                        key={j}
                        className="h-6 w-16 bg-muted rounded"
                        variants={shimmer}
                        animate="animate"
                      />
                    ))}
                  </div>
                </div>

                {/* Paper Sizes */}
                <div className="space-y-2">
                  <motion.div
                    className="h-4 w-24 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[0, 1, 2, 3].map((j) => (
                      <motion.div
                        key={j}
                        className="h-6 w-12 bg-muted rounded"
                        variants={shimmer}
                        animate="animate"
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <motion.div
                    className="h-9 flex-1 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                  <motion.div
                    className="h-9 flex-1 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                  <motion.div
                    className="h-9 w-9 bg-muted rounded"
                    variants={shimmer}
                    animate="animate"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PrintersSkeleton;
