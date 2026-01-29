"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Insight {
  id: string;
  category: "strategy" | "warning" | "milestone" | "tip" | "optimization";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

export function DashboardWidgets() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((data) => {
        setInsights(data.insights || []);
      })
      .catch(() => {
        // Silently fail — insights are non-critical
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryColor = (category: Insight["category"]) => {
    switch (category) {
      case "warning":
        return "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "strategy":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "milestone":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "tip":
        return "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "optimization":
        return "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
      default:
        return "";
    }
  };

  const getPriorityBadge = (priority: Insight["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-[10px]">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-[10px]">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-[10px]">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>💡 AI Financial Insights</CardTitle>
          <CardDescription>
            Personalized recommendations based on your financial data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 AI Financial Insights</CardTitle>
        <CardDescription>
          Personalized recommendations based on your financial data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.slice(0, 6).map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg border p-4 ${getCategoryColor(insight.category)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl shrink-0">{insight.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold truncate">
                      {insight.title}
                    </h4>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
