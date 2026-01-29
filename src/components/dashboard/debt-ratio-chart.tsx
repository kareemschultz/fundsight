"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Loan {
  id: string;
  originalAmount: string;
  currentBalance: string;
  monthlyPayment: string;
  interestRate: string;
  startDate: string;
}

interface DebtRatioChartProps {
  loans: Loan[];
  monthlyIncome: number;
}

export function DebtRatioChart({ loans, monthlyIncome }: DebtRatioChartProps) {
  const chartData = useMemo(() => {
    if (loans.length === 0 || monthlyIncome <= 0) return [];

    const totalMonthly = loans.reduce(
      (sum, l) => sum + parseFloat(l.monthlyPayment),
      0
    );
    const totalBalance = loans.reduce(
      (sum, l) => sum + parseFloat(l.currentBalance),
      0
    );

    // Project 24 months of debt ratio trends
    const data = [];
    let runningBalance = totalBalance;

    for (let month = 0; month <= 24; month++) {
      const debtToIncome =
        monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;
      const totalDebtRatio =
        monthlyIncome > 0
          ? (runningBalance / (monthlyIncome * 12)) * 100
          : 0;

      data.push({
        month: `M${month}`,
        dti: Math.max(0, debtToIncome),
        totalDebtRatio: Math.max(0, totalDebtRatio),
        balance: Math.max(0, runningBalance),
      });

      // Reduce balance by approximate principal portion
      const avgRate =
        loans.reduce((sum, l) => sum + parseFloat(l.interestRate), 0) /
        loans.length;
      const interest = runningBalance * (avgRate / 12);
      const principal = totalMonthly - interest;
      runningBalance -= Math.max(0, principal);
    }

    return data;
  }, [loans, monthlyIncome]);

  const formatPercent = (value: number) => `${value.toFixed(0)}%`;

  if (loans.length === 0 || monthlyIncome <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt-to-Income Trends</CardTitle>
          <CardDescription>
            Track how your debt ratio changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              Set your monthly income in Settings to see debt ratio trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt-to-Income Trends</CardTitle>
        <CardDescription>
          Projected debt-to-income ratio over the next 24 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={formatPercent} className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === "dti"
                    ? "Monthly DTI"
                    : "Total Debt / Annual Income",
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="dti"
                name="Monthly DTI"
                stroke="#f59e0b"
                fill="#fef3c7"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="totalDebtRatio"
                name="Debt / Annual Income"
                stroke="#ef4444"
                fill="#fee2e2"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span>
            🟡 Healthy DTI: below 36% | 🔴 High: above 50%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
