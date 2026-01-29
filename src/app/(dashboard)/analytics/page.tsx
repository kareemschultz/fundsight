"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { MultiLoanChart } from "@/components/dashboard/multi-loan-chart";
import { CorrelationChart } from "@/components/dashboard/correlation-chart";
import { DebtRatioChart } from "@/components/dashboard/debt-ratio-chart";

interface Loan {
  id: string;
  vehicleDescription: string | null;
  originalAmount: string;
  currentBalance: string;
  interestRate: string;
  monthlyPayment: string;
  startDate: string;
  lender: { shortName: string; name: string } | null;
}

interface Payment {
  id: string;
  paymentDate: string;
  amount: string;
  paymentType: string;
  source: string;
}

export default function AnalyticsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/loans").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/users/financial-profile")
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([loansData, paymentsData, profileData]) => {
        setLoans(loansData);
        setPayments(paymentsData);
        if (loansData.length > 0) {
          setSelectedLoanId(loansData[0].id);
        }
        if (profileData?.monthlyIncome) {
          setMonthlyIncome(parseFloat(profileData.monthlyIncome));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedLoan = useMemo(
    () => loans.find((l) => l.id === selectedLoanId),
    [loans, selectedLoanId]
  );

  const handleLoanChange = (value: string | null) => {
    if (value) setSelectedLoanId(value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GY", {
      style: "currency",
      currency: "GYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  // Calculate financial health score
  const healthScore = useMemo(() => {
    if (!selectedLoan) return null;

    const original = parseFloat(selectedLoan.originalAmount);
    const current = parseFloat(selectedLoan.currentBalance);
    const progress = ((original - current) / original) * 100;

    const progressScore = Math.min(progress, 100) * 0.4;
    const paymentConsistency = payments.length > 0 ? 30 : 0;
    const extraPayments = payments.filter(
      (p) => p.paymentType === "extra"
    ).length;
    const extraScore = Math.min(extraPayments * 10, 30);

    const total = progressScore + paymentConsistency + extraScore;

    let rating = "Poor";
    let color = "text-red-500";
    if (total >= 80) {
      rating = "Excellent";
      color = "text-green-500";
    } else if (total >= 60) {
      rating = "Good";
      color = "text-blue-500";
    } else if (total >= 40) {
      rating = "Fair";
      color = "text-yellow-500";
    }

    return { score: Math.round(total), rating, color };
  }, [selectedLoan, payments]);

  // Payoff projection data
  const payoffProjection = useMemo(() => {
    if (!selectedLoan) return [];

    const balance = parseFloat(selectedLoan.currentBalance);
    const monthlyRate = parseFloat(selectedLoan.interestRate) / 12;
    const regularPayment = parseFloat(selectedLoan.monthlyPayment);

    const data = [];
    let regularBalance = balance;
    let extraBalance = balance;

    for (
      let month = 0;
      month <= 60 && (regularBalance > 0 || extraBalance > 0);
      month++
    ) {
      data.push({
        month,
        regular: Math.round(Math.max(0, regularBalance)),
        withExtra: Math.round(Math.max(0, extraBalance)),
      });

      if (regularBalance > 0) {
        const interest = regularBalance * monthlyRate;
        regularBalance -= regularPayment - interest;
      }

      if (extraBalance > 0) {
        const interest = extraBalance * monthlyRate;
        const extraPayment = month % 6 === 0 ? 100000 : 0;
        extraBalance -= regularPayment + extraPayment - interest;
      }
    }

    return data;
  }, [selectedLoan]);

  // Payment breakdown by source
  const paymentsBySource = useMemo(() => {
    const sources: Record<string, number> = {};
    payments.forEach((p) => {
      const source = p.source || "other";
      sources[source] = (sources[source] || 0) + parseFloat(p.amount);
    });

    const colors: Record<string, string> = {
      salary: "#3b82f6",
      gratuity: "#22c55e",
      bonus: "#f59e0b",
      investment: "#8b5cf6",
      savings: "#06b6d4",
      other: "#6b7280",
    };

    return Object.entries(sources).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name] || "#6b7280",
    }));
  }, [payments]);

  // Monthly payment trend
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { regular: number; extra: number }> = {};

    payments.forEach((p) => {
      const date = new Date(p.paymentDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!months[key]) {
        months[key] = { regular: 0, extra: 0 };
      }

      const amount = parseFloat(p.amount);
      if (p.paymentType === "extra") {
        months[key].extra += amount;
      } else {
        months[key].regular += amount;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month: month.split("-")[1] + "/" + month.split("-")[0].slice(2),
        regular: data.regular,
        extra: data.extra,
        total: data.regular + data.extra,
      }));
  }, [payments]);

  // Interest vs Principal breakdown
  const interestVsPrincipal = useMemo(() => {
    if (!selectedLoan) return { principal: 0, interest: 0 };

    const original = parseFloat(selectedLoan.originalAmount);
    const current = parseFloat(selectedLoan.currentBalance);
    const totalPaid = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const principalPaid = original - current;
    const interestPaid = totalPaid - principalPaid;

    return {
      principal: Math.max(0, principalPaid),
      interest: Math.max(0, interestPaid),
    };
  }, [selectedLoan, payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Visualize your loan progress and payment patterns
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Add a loan to see analytics.
            </p>
            <Button
              onClick={() => (window.location.href = "/loans/new")}
            >
              Add Loan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Visualize your loan progress and payment patterns
          </p>
        </div>
        <div className="w-64">
          <Select value={selectedLoanId} onValueChange={handleLoanChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select loan" />
            </SelectTrigger>
            <SelectContent>
              {loans.map((loan) => (
                <SelectItem key={loan.id} value={loan.id}>
                  {loan.vehicleDescription || "Car Loan"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Multi-Loan</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Score & Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            {healthScore && (
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Financial Health Score</CardDescription>
                  <CardTitle
                    className={`text-4xl ${healthScore.color}`}
                  >
                    {healthScore.score}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={healthScore.score} className="h-2" />
                  <p
                    className={`text-sm mt-2 font-medium ${healthScore.color}`}
                  >
                    {healthScore.rating}
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedLoan && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Loan Progress</CardDescription>
                    <CardTitle className="text-2xl">
                      {(
                        ((parseFloat(selectedLoan.originalAmount) -
                          parseFloat(selectedLoan.currentBalance)) /
                          parseFloat(selectedLoan.originalAmount)) *
                        100
                      ).toFixed(1)}
                      %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={
                        ((parseFloat(selectedLoan.originalAmount) -
                          parseFloat(selectedLoan.currentBalance)) /
                          parseFloat(selectedLoan.originalAmount)) *
                        100
                      }
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Principal Paid</CardDescription>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                      {formatCurrency(interestVsPrincipal.principal)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Interest Paid</CardDescription>
                    <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">
                      {formatCurrency(interestVsPrincipal.interest)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>

          {/* Payoff Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payoff Projection</CardTitle>
              <CardDescription>
                Compare regular payments vs adding $100K every 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={payoffProjection}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(m) => `M${m}`}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={formatShortCurrency}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        formatCurrency(value)
                      }
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="regular"
                      name="Regular Payments"
                      stroke="#f59e0b"
                      fill="#fef3c7"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="withExtra"
                      name="With Extra Payments"
                      stroke="#22c55e"
                      fill="#dcfce7"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Payment Sources Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Sources</CardTitle>
                <CardDescription>
                  Where your payments come from
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsBySource.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentsBySource}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {paymentsBySource.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) =>
                            formatCurrency(value)
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No payment data yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Payment Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Payment Trend</CardTitle>
                <CardDescription>
                  Regular vs extra payments over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyTrend.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis
                          tickFormatter={formatShortCurrency}
                          className="text-xs"
                        />
                        <Tooltip
                          formatter={(value: number) =>
                            formatCurrency(value)
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="regular"
                          name="Regular"
                          fill="#3b82f6"
                          stackId="a"
                        />
                        <Bar
                          dataKey="extra"
                          name="Extra"
                          fill="#22c55e"
                          stackId="a"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No payment data yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interest vs Principal */}
          <Card>
            <CardHeader>
              <CardTitle>Interest vs Principal Breakdown</CardTitle>
              <CardDescription>
                How much of your payments went to principal vs interest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Principal Paid</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(interestVsPrincipal.principal)}
                    </span>
                  </div>
                  <Progress
                    value={
                      (interestVsPrincipal.principal /
                        (interestVsPrincipal.principal +
                          interestVsPrincipal.interest +
                          1)) *
                      100
                    }
                    className="h-3 bg-orange-200 dark:bg-orange-900"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Interest Paid</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {formatCurrency(interestVsPrincipal.interest)}
                    </span>
                  </div>
                  <Progress
                    value={
                      (interestVsPrincipal.interest /
                        (interestVsPrincipal.principal +
                          interestVsPrincipal.interest +
                          1)) *
                      100
                    }
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Loan Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <MultiLoanChart loans={loans} />
          <CorrelationChart
            payments={payments}
            loan={selectedLoan || null}
          />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <DebtRatioChart loans={loans} monthlyIncome={monthlyIncome} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
