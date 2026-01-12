"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface Scenario {
  id: string;
  name: string;
  extraAmount: number;
  frequency: number;
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  monthsSaved: number;
  interestSaved: number;
}

export default function ScenariosPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [loading, setLoading] = useState(true);

  // Scenario inputs
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newExtraAmount, setNewExtraAmount] = useState("100000");
  const [newFrequency, setNewFrequency] = useState("6");

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
    if (value) {
      setSelectedLoanId(value);
      setScenarios([]); // Reset scenarios when loan changes
    }
  };

  const handleFrequencyChange = (value: string | null) => {
    if (value) setNewFrequency(value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GY", {
      style: "currency",
      currency: "GYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate baseline (no extra payments)
  const baseline = useMemo(() => {
    if (!selectedLoan) return null;

    const balance = parseFloat(selectedLoan.currentBalance);
    const monthlyRate = parseFloat(selectedLoan.interestRate) / 12;
    const regularPayment = parseFloat(selectedLoan.monthlyPayment);

    let remaining = balance;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < 360) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const principal = Math.min(regularPayment - interest, remaining);
      remaining -= principal;
      months++;
    }

    return {
      totalMonths: months,
      totalInterest,
      totalPaid: balance + totalInterest,
    };
  }, [selectedLoan]);

  // Calculate scenario
  const calculateScenario = (extraAmount: number, frequency: number) => {
    if (!selectedLoan || !baseline) return null;

    const balance = parseFloat(selectedLoan.currentBalance);
    const monthlyRate = parseFloat(selectedLoan.interestRate) / 12;
    const regularPayment = parseFloat(selectedLoan.monthlyPayment);

    let remaining = balance;
    let months = 0;
    let totalInterest = 0;

    while (remaining > 0 && months < 360) {
      const isExtraMonth = frequency > 0 && (months + 1) % frequency === 0;
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      const payment = regularPayment + (isExtraMonth ? extraAmount : 0);
      const principal = Math.min(payment - interest, remaining);
      remaining -= principal;
      months++;
    }

    return {
      totalMonths: months,
      totalInterest,
      totalPaid: balance + totalInterest,
      monthsSaved: baseline.totalMonths - months,
      interestSaved: baseline.totalInterest - totalInterest,
    };
  };

  const addScenario = () => {
    if (!newScenarioName.trim() || !selectedLoan) return;

    const extraAmount = parseFloat(newExtraAmount) || 0;
    const frequency = parseInt(newFrequency);
    const result = calculateScenario(extraAmount, frequency);

    if (!result) return;

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: newScenarioName,
      extraAmount,
      frequency,
      ...result,
    };

    setScenarios([...scenarios, newScenario]);
    setNewScenarioName("");
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  // Pre-built scenarios
  const addPresetScenario = (name: string, extraAmount: number, frequency: number) => {
    const result = calculateScenario(extraAmount, frequency);
    if (!result) return;

    setScenarios([
      ...scenarios,
      {
        id: Date.now().toString(),
        name,
        extraAmount,
        frequency,
        ...result,
      },
    ]);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Payment Scenarios</h1>
          <p className="text-muted-foreground">
            Compare different payment strategies
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Add a loan first to compare scenarios.
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
        <h1 className="text-3xl font-bold tracking-tight">Payment Scenarios</h1>
        <p className="text-muted-foreground">
          Compare different payment strategies and see the impact
        </p>
      </div>

      {/* Loan Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Loan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
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
        </CardContent>
      </Card>

      {/* Baseline */}
      {baseline && (
        <Card>
          <CardHeader>
            <CardTitle>Baseline (Regular Payments Only)</CardTitle>
            <CardDescription>
              What happens if you only make regular monthly payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Time to Payoff</p>
                <p className="text-2xl font-bold">{baseline.totalMonths} months</p>
                <p className="text-xs text-muted-foreground">
                  ({(baseline.totalMonths / 12).toFixed(1)} years)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(baseline.totalInterest)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount Paid</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(baseline.totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Scenarios</CardTitle>
          <CardDescription>
            Add common payment strategies with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetScenario("$50K Every 6 Months", 50000, 6)}
            >
              $50K / 6 months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetScenario("$100K Every 6 Months", 100000, 6)}
            >
              $100K / 6 months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetScenario("$200K Every 6 Months", 200000, 6)}
            >
              $200K / 6 months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetScenario("$50K Monthly", 50000, 1)}
            >
              $50K monthly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetScenario("$300K Annually", 300000, 12)}
            >
              $300K yearly
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Scenario Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Scenario</CardTitle>
          <CardDescription>
            Build your own payment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Scenario Name</Label>
              <Input
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="My Strategy"
              />
            </div>
            <div className="space-y-2">
              <Label>Extra Amount (GYD)</Label>
              <Input
                type="number"
                value={newExtraAmount}
                onChange={(e) => setNewExtraAmount(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={newFrequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every Month</SelectItem>
                  <SelectItem value="3">Every 3 Months</SelectItem>
                  <SelectItem value="6">Every 6 Months</SelectItem>
                  <SelectItem value="12">Once a Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={addScenario} className="w-full">
                Add Scenario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Comparison Table */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
            <CardDescription>
              See how different strategies compare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Extra Payment</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Payoff Time</TableHead>
                  <TableHead>Months Saved</TableHead>
                  <TableHead>Interest Saved</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.id}>
                    <TableCell className="font-medium">{scenario.name}</TableCell>
                    <TableCell>{formatCurrency(scenario.extraAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        Every {scenario.frequency} month{scenario.frequency > 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scenario.totalMonths} months
                      <span className="text-xs text-muted-foreground ml-1">
                        ({(scenario.totalMonths / 12).toFixed(1)} yrs)
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {scenario.monthsSaved} months
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(scenario.interestSaved)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScenario(scenario.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Best Scenario Highlight */}
      {scenarios.length > 0 && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Best Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const best = scenarios.reduce((prev, curr) =>
                curr.interestSaved > prev.interestSaved ? curr : prev
              );
              return (
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Strategy</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-200">
                      {best.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Saved</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(best.interestSaved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-200">
                      {best.monthsSaved} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Payoff Time</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-200">
                      {(best.totalMonths / 12).toFixed(1)} years
                    </p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
