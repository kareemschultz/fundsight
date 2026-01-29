"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Loan {
  id: string;
  vehicleDescription: string | null;
  originalAmount: string;
  currentBalance: string;
  monthlyPayment: string;
  startDate: string;
  lender: { shortName: string } | null;
}

interface MultiLoanChartProps {
  loans: Loan[];
}

const CHART_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export function MultiLoanChart({ loans }: MultiLoanChartProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const chartData = useMemo(() => {
    if (loans.length === 0) return [];

    // Create timeline data for all loans
    // For simplicity, we'll project based on current balance
    // and typical 5-year amortization

    const months = Array.from({ length: 60 }, (_, i) => i); // 60 months (5 years)

    return months.map((month) => {
      const dataPoint: Record<string, number> = { month };

      loans.forEach((loan) => {
        const currentBalance = parseFloat(loan.currentBalance);
        const monthlyPayment = parseFloat(loan.monthlyPayment || "0");

        // Simple linear amortization projection
        const monthsPassed = Math.floor(
          (new Date().getTime() - new Date(loan.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        // Calculate projected balance at this month
        const projectedBalance = Math.max(
          0,
          currentBalance - (monthlyPayment * 0.8 * (month - monthsPassed)) // 80% goes to principal (simplified)
        );

        const loanKey = loan.lender?.shortName || `Loan ${loan.id.slice(0, 8)}`;
        dataPoint[loanKey] = projectedBalance;
      });

      return dataPoint;
    });
  }, [loans]);

  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Loan Comparison</CardTitle>
          <CardDescription>
            Compare payoff projections across all your loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Add loans to see comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Loan Comparison</CardTitle>
        <CardDescription>
          Projected payoff timeline for all active loans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                label={{ value: "Months from Now", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis
                tickFormatter={formatCurrency}
                label={{ value: "Balance", angle: -90, position: "insideLeft" }}
                className="text-xs"
              />
              <Tooltip
                formatter={(value: number) => [
                  new Intl.NumberFormat("en-GY", {
                    style: "currency",
                    currency: "GYD",
                    minimumFractionDigits: 0,
                  }).format(value),
                  "Balance",
                ]}
              />
              <Legend />
              {loans.map((loan, index) => {
                const loanKey = loan.lender?.shortName || `Loan ${loan.id.slice(0, 8)}`;
                return (
                  <Line
                    key={loan.id}
                    type="monotone"
                    dataKey={loanKey}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
