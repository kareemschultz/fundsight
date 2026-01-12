"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Loan {
  id: string;
  vehicleDescription: string | null;
  currentBalance: string;
  lender: { shortName: string } | null;
}

interface Payment {
  id: string;
  paymentDate: string;
  amount: string;
  paymentType: string;
  source: string;
  notes: string | null;
  loan: {
    vehicleDescription: string | null;
    lender: { shortName: string } | null;
  };
}

export default function TrackerPage() {
  const searchParams = useSearchParams();
  const preselectedLoanId = searchParams.get("loan");

  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [loanId, setLoanId] = useState(preselectedLoanId || "");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"regular" | "extra">("regular");
  const [source, setSource] = useState<string>("salary");
  const [notes, setNotes] = useState("");

  // Handlers for Base UI Select components (handle nullable values)
  const handleLoanChange = (value: string | null) => {
    if (value) setLoanId(value);
  };
  const handlePaymentTypeChange = (value: string | null) => {
    if (value === "regular" || value === "extra") setPaymentType(value);
  };
  const handleSourceChange = (value: string | null) => {
    if (value) setSource(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GY", {
      style: "currency",
      currency: "GYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchData = async () => {
    try {
      const [loansRes, paymentsRes] = await Promise.all([
        fetch("/api/loans"),
        fetch("/api/payments"),
      ]);

      const loansData = await loansRes.json();
      const paymentsData = await paymentsRes.json();

      setLoans(loansData);
      setPayments(paymentsData);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (preselectedLoanId) {
      setLoanId(preselectedLoanId);
    }
  }, [preselectedLoanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId,
          paymentDate,
          amount: parseFloat(amount),
          paymentType,
          source,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to record payment");
        return;
      }

      setSuccess("Payment recorded successfully!");
      setDialogOpen(false);

      // Reset form
      setAmount("");
      setPaymentType("regular");
      setSource("salary");
      setNotes("");

      // Refresh data
      fetchData();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Tracker</h1>
          <p className="text-muted-foreground">
            Record and view your loan payments
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button disabled={loans.length === 0}>Record Payment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Enter the details of your payment
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="loan">Loan</Label>
                <Select value={loanId} onValueChange={handleLoanChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map((loan) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {loan.vehicleDescription || "Car Loan"} (
                        {loan.lender?.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (GYD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="111222"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Type</Label>
                  <Select
                    value={paymentType}
                    onValueChange={handlePaymentTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="extra">Extra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={source} onValueChange={handleSourceChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="gratuity">Gratuity</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Recording..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {loans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Add a loan first before recording payments.
            </p>
            <a href="/loans/new" className={buttonVariants()}>
              Add Loan
            </a>
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              No payments recorded yet.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              Record Your First Payment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              All your recorded payments across all loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {payment.loan?.vehicleDescription || "Car Loan"}
                      <span className="text-muted-foreground text-xs ml-1">
                        ({payment.loan?.lender?.shortName})
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(parseFloat(payment.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.paymentType === "extra" ? "default" : "secondary"
                        }
                      >
                        {payment.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{payment.source}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {payment.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
