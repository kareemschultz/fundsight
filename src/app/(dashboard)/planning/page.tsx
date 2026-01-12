"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Loan {
  id: string;
  vehicleDescription: string | null;
  currentBalance: string;
  interestRate: string;
  monthlyPayment: string;
  lender: { shortName: string } | null;
}

interface PaymentPlan {
  month: number;
  monthName: string;
  regularPayment: number;
  extraPayment: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  source: string;
}

export default function PlanningPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [loading, setLoading] = useState(true);

  // Planning parameters
  const [extraPaymentAmount, setExtraPaymentAmount] = useState("100000");
  const [paymentFrequency, setPaymentFrequency] = useState("6"); // Every 6 months
  const [startMonth, setStartMonth] = useState("1");

  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => {
        setLoans(data);
        if (data.length > 0) {
          setSelectedLoanId(data[0].id);
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

  const handleFrequencyChange = (value: string | null) => {
    if (value) setPaymentFrequency(value);
  };

  const handleStartMonthChange = (value: string | null) => {
    if (value) setStartMonth(value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GY", {
      style: "currency",
      currency: "GYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate 6-month payment plan
  const paymentPlan = useMemo(() => {
    if (!selectedLoan) return [];

    const balance = parseFloat(selectedLoan.currentBalance);
    const monthlyRate = parseFloat(selectedLoan.interestRate) / 12;
    const regularPayment = parseFloat(selectedLoan.monthlyPayment);
    const extraAmount = parseFloat(extraPaymentAmount) || 0;
    const frequency = parseInt(paymentFrequency);
    const start = parseInt(startMonth);

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const plan: PaymentPlan[] = [];
    let remaining = balance;
    const currentMonth = new Date().getMonth();

    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const actualMonth = i + 1;
      const isExtraMonth = (actualMonth - start) % frequency === 0 && actualMonth >= start;

      const interestPortion = remaining * monthlyRate;
      const extra = isExtraMonth ? extraAmount : 0;
      const totalPayment = regularPayment + extra;
      const principalPortion = Math.min(totalPayment - interestPortion, remaining);

      remaining = Math.max(0, remaining - principalPortion);

      plan.push({
        month: actualMonth,
        monthName: months[monthIndex],
        regularPayment,
        extraPayment: extra,
        totalPayment,
        principalPaid: principalPortion,
        interestPaid: interestPortion,
        remainingBalance: remaining,
        source: isExtraMonth ? "Gratuity" : "Salary",
      });

      if (remaining === 0) break;
    }

    return plan;
  }, [selectedLoan, extraPaymentAmount, paymentFrequency, startMonth]);

  // Calculate savings compared to regular payments
  const savings = useMemo(() => {
    if (!selectedLoan || paymentPlan.length === 0) return null;

    const balance = parseFloat(selectedLoan.currentBalance);
    const monthlyRate = parseFloat(selectedLoan.interestRate) / 12;
    const regularPayment = parseFloat(selectedLoan.monthlyPayment);

    // Calculate months to payoff without extra payments
    let regularRemaining = balance;
    let regularMonths = 0;
    let regularTotalInterest = 0;

    while (regularRemaining > 0 && regularMonths < 120) {
      const interest = regularRemaining * monthlyRate;
      regularTotalInterest += interest;
      const principal = Math.min(regularPayment - interest, regularRemaining);
      regularRemaining -= principal;
      regularMonths++;
    }

    // Calculate with extra payments
    let extraRemaining = balance;
    let extraMonths = 0;
    let extraTotalInterest = 0;
    const frequency = parseInt(paymentFrequency);
    const start = parseInt(startMonth);
    const extraAmount = parseFloat(extraPaymentAmount) || 0;

    while (extraRemaining > 0 && extraMonths < 120) {
      const month = extraMonths + 1;
      const isExtraMonth = (month - start) % frequency === 0 && month >= start;
      const interest = extraRemaining * monthlyRate;
      extraTotalInterest += interest;
      const payment = regularPayment + (isExtraMonth ? extraAmount : 0);
      const principal = Math.min(payment - interest, extraRemaining);
      extraRemaining -= principal;
      extraMonths++;
    }

    return {
      monthsSaved: regularMonths - extraMonths,
      interestSaved: regularTotalInterest - extraTotalInterest,
      regularPayoffMonths: regularMonths,
      extraPayoffMonths: extraMonths,
    };
  }, [selectedLoan, extraPaymentAmount, paymentFrequency, startMonth, paymentPlan]);

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
          <h1 className="text-3xl font-bold tracking-tight">Payment Planning</h1>
          <p className="text-muted-foreground">
            Create a 6-month payment strategy
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Add a loan first to start planning payments.
            </p>
            <Button onClick={() => window.location.href = "/loans/new"}>
              Add Loan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Planning</h1>
        <p className="text-muted-foreground">
          Optimize your 6-month payment strategy with gratuity
        </p>
      </div>

      {/* Loan Selection & Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Planning Parameters</CardTitle>
          <CardDescription>
            Configure your extra payment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Select Loan</Label>
              <Select value={selectedLoanId} onValueChange={handleLoanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.vehicleDescription || "Car Loan"} ({loan.lender?.shortName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Extra Payment Amount (GYD)</Label>
              <Input
                type="number"
                value={extraPaymentAmount}
                onChange={(e) => setExtraPaymentAmount(e.target.value)}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Frequency</Label>
              <Select value={paymentFrequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every Month</SelectItem>
                  <SelectItem value="3">Every 3 Months</SelectItem>
                  <SelectItem value="6">Every 6 Months (Gratuity)</SelectItem>
                  <SelectItem value="12">Once a Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Month</Label>
              <Select value={startMonth} onValueChange={handleStartMonthChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Month {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Summary */}
      {savings && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardDescription>Interest Saved</CardDescription>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                {formatCurrency(savings.interestSaved)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardDescription>Months Saved</CardDescription>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {savings.monthsSaved} months
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Regular Payoff</CardDescription>
              <CardTitle className="text-2xl">
                {savings.regularPayoffMonths} months
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>With Extra Payments</CardDescription>
              <CardTitle className="text-2xl">
                {savings.extraPayoffMonths} months
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* 6-Month Plan Table */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Payment Schedule</CardTitle>
          <CardDescription>
            Your optimized payment plan for the next 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Regular</TableHead>
                <TableHead>Extra</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentPlan.map((plan) => (
                <TableRow key={plan.month}>
                  <TableCell className="font-medium">{plan.monthName}</TableCell>
                  <TableCell>{formatCurrency(plan.regularPayment)}</TableCell>
                  <TableCell>
                    {plan.extraPayment > 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{formatCurrency(plan.extraPayment)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(plan.totalPayment)}
                  </TableCell>
                  <TableCell>{formatCurrency(plan.principalPaid)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(plan.interestPaid)}
                  </TableCell>
                  <TableCell>{formatCurrency(plan.remainingBalance)}</TableCell>
                  <TableCell>
                    <Badge variant={plan.extraPayment > 0 ? "default" : "secondary"}>
                      {plan.source}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Current Loan Info */}
      {selectedLoan && (
        <Card>
          <CardHeader>
            <CardTitle>Current Loan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold">
                  {formatCurrency(parseFloat(selectedLoan.currentBalance))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-xl font-bold">
                  {formatCurrency(parseFloat(selectedLoan.monthlyPayment))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-xl font-bold">
                  {(parseFloat(selectedLoan.interestRate) * 100).toFixed(2)}% APR
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lender</p>
                <p className="text-xl font-bold">
                  {selectedLoan.lender?.shortName || "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
