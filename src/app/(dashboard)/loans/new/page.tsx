"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Lender {
  id: string;
  name: string;
  shortName: string;
  defaultRate: string | null;
}

export default function NewLoanPage() {
  const router = useRouter();
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [lenderId, setLenderId] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [termMonths, setTermMonths] = useState("");

  // Fetch lenders on mount
  useEffect(() => {
    fetch("/api/lenders")
      .then((res) => res.json())
      .then((data) => setLenders(data))
      .catch(() => setError("Failed to load lenders"));
  }, []);

  // Auto-fill interest rate when lender is selected
  const handleLenderChange = (value: string | null) => {
    if (value) {
      setLenderId(value);
      const lender = lenders.find((l) => l.id === value);
      if (lender?.defaultRate && !interestRate) {
        setInterestRate(lender.defaultRate);
      }
    }
  };

  // Sync current balance with original amount if not set
  const handleOriginalAmountChange = (value: string) => {
    setOriginalAmount(value);
    if (!currentBalance) {
      setCurrentBalance(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lenderId: lenderId || null,
          vehicleDescription,
          originalAmount: parseFloat(originalAmount),
          currentBalance: parseFloat(currentBalance || originalAmount),
          interestRate: parseFloat(interestRate) / 100, // Convert percentage to decimal
          monthlyPayment: parseFloat(monthlyPayment),
          startDate,
          termMonths: termMonths ? parseInt(termMonths) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create loan");
        return;
      }

      router.push(`/loans/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Loan</h1>
        <p className="text-muted-foreground">
          Enter your car loan details to start tracking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>
            Fill in the information from your loan agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Lender Selection */}
            <div className="space-y-2">
              <Label htmlFor="lender">Lender / Bank</Label>
              <Select value={lenderId} onValueChange={handleLenderChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your lender" />
                </SelectTrigger>
                <SelectContent className="min-w-[400px]">
                  {lenders.map((lender) => (
                    <SelectItem key={lender.id} value={lender.id}>
                      <div className="flex flex-col py-1">
                        <span className="font-semibold">{lender.shortName}</span>
                        <span className="text-muted-foreground text-xs">{lender.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Description */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Description</Label>
              <Input
                id="vehicle"
                name="vehicle"
                placeholder="e.g., BMW X1 2019…"
                autoComplete="off"
                value={vehicleDescription}
                onChange={(e) => setVehicleDescription(e.target.value)}
              />
            </div>

            {/* Amount Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="originalAmount">Original Loan Amount (GYD)</Label>
                <Input
                  id="originalAmount"
                  name="originalAmount"
                  type="number"
                  inputMode="numeric"
                  placeholder="5,000,000…"
                  autoComplete="off"
                  value={originalAmount}
                  onChange={(e) => handleOriginalAmountChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Current Balance (GYD)</Label>
                <Input
                  id="currentBalance"
                  name="currentBalance"
                  type="number"
                  inputMode="numeric"
                  placeholder="Same as original if new…"
                  autoComplete="off"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyPayment">Monthly Payment (GYD)</Label>
                <Input
                  id="monthlyPayment"
                  name="monthlyPayment"
                  type="number"
                  inputMode="numeric"
                  placeholder="111,222…"
                  autoComplete="off"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="12…"
                  autoComplete="off"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date & Term */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Loan Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  autoComplete="off"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termMonths">Loan Term (months)</Label>
                <Input
                  id="termMonths"
                  name="termMonths"
                  type="number"
                  inputMode="numeric"
                  placeholder="60…"
                  autoComplete="off"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create Loan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
