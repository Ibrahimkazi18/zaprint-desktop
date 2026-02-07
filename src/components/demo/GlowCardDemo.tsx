import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Users, TrendingUp, Star, Zap, Activity } from "lucide-react";

export function GlowCardDemo() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-10 p-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Interactive Glow Cards
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-8">
        {/* Blue Glow Card - Dashboard Stats */}
        <GlowCard glowColor="blue" size="md">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Active Jobs
                </h3>
                <p className="text-sm text-gray-300">Real-time tracking</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold text-white mb-2">24</div>
              <div className="flex items-center text-green-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from yesterday
              </div>
            </div>
            <Badge variant="success" className="self-start">
              Online
            </Badge>
          </div>
        </GlowCard>

        {/* Purple Glow Card - Customer Stats */}
        <GlowCard glowColor="purple" size="md">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Customers</h3>
                <p className="text-sm text-gray-300">Total registered</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold text-white mb-2">1,247</div>
              <div className="flex items-center text-purple-400 text-sm">
                <Star className="h-4 w-4 mr-1" />
                4.9 average rating
              </div>
            </div>
            <Button variant="outline" size="sm" className="self-start">
              View All
            </Button>
          </div>
        </GlowCard>

        {/* Green Glow Card - Printer Status */}
        <GlowCard glowColor="green" size="md">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Printer className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Printers</h3>
                <p className="text-sm text-gray-300">System status</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white">HP LaserJet</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Canon Pixma</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Epson EcoTank</span>
                <Badge variant="warning">Maintenance</Badge>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Orange Glow Card - Performance */}
        <GlowCard glowColor="orange" size="md">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Performance
                </h3>
                <p className="text-sm text-gray-300">System metrics</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">CPU Usage</span>
                <span className="text-white">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Memory</span>
                <span className="text-white">62%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: "62%" }}
                ></div>
              </div>
            </div>
            <Badge variant="info" className="self-start">
              Optimal
            </Badge>
          </div>
        </GlowCard>
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Move your mouse around to see the interactive glow effect!
        </p>
      </div>
    </div>
  );
}

export default GlowCardDemo;
