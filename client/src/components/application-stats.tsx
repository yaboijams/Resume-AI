import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Send, Calendar, X, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ApplicationStats {
  total: number;
  applied: number;
  interviewing: number;
  rejected: number;
  hired: number;
}

export function ApplicationStats() {
  const { data: stats, isLoading } = useQuery<ApplicationStats>({
    queryKey: ["/api/job-applications/stats"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Application Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="loading-shimmer h-8 w-12 rounded mx-auto mb-2"></div>
                <div className="loading-shimmer h-4 w-16 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Application Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No application data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      label: "Applied",
      value: stats.applied,
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Interviewing", 
      value: stats.interviewing,
      icon: Calendar,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "Hired",
      value: stats.hired,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400", 
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: X,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Application Stats
          </div>
          <Badge variant="secondary">{stats.total} Total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item) => (
            <div key={item.label} className={`rounded-lg p-4 ${item.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {stats.total > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response Rate</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {Math.round(((stats.interviewing + stats.hired) / stats.applied) * 100) || 0}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
