"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  notes: string | null;
  loan: { vehicleDescription: string | null } | null;
}

export default function ReportsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/loans").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ])
      .then(([loansData, paymentsData]) => {
        setLoans(loansData);
        setPayments(paymentsData);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const filteredPayments =
      selectedLoanId === "all"
        ? payments
        : payments.filter((p) => p.loan?.vehicleDescription === loans.find((l) => l.id === selectedLoanId)?.vehicleDescription);

    const totalPaid = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const regularPayments = filteredPayments.filter((p) => p.paymentType === "regular");
    const extraPayments = filteredPayments.filter((p) => p.paymentType === "extra");
    const totalRegular = regularPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalExtra = extraPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Payment sources breakdown
    const sources: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      const source = p.source || "other";
      sources[source] = (sources[source] || 0) + parseFloat(p.amount);
    });

    // Loans summary
    const selectedLoans = selectedLoanId === "all" ? loans : loans.filter((l) => l.id === selectedLoanId);
    const totalOriginal = selectedLoans.reduce((sum, l) => sum + parseFloat(l.originalAmount), 0);
    const totalBalance = selectedLoans.reduce((sum, l) => sum + parseFloat(l.currentBalance), 0);
    const totalProgress = totalOriginal > 0 ? ((totalOriginal - totalBalance) / totalOriginal) * 100 : 0;

    return {
      totalPaid,
      totalRegular,
      totalExtra,
      regularCount: regularPayments.length,
      extraCount: extraPayments.length,
      sources,
      totalOriginal,
      totalBalance,
      totalProgress,
      loanCount: selectedLoans.length,
    };
  }, [loans, payments, selectedLoanId]);

  // Export functions
  const exportPaymentsCSV = () => {
    setExporting(true);

    const filteredPayments =
      selectedLoanId === "all"
        ? payments
        : payments.filter((p) => p.loan?.vehicleDescription === loans.find((l) => l.id === selectedLoanId)?.vehicleDescription);

    const headers = ["Date", "Loan", "Amount (GYD)", "Type", "Source", "Notes"];
    const rows = filteredPayments.map((p) => [
      formatDate(p.paymentDate),
      p.loan?.vehicleDescription || "Unknown",
      parseFloat(p.amount).toString(),
      p.paymentType,
      p.source,
      p.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    downloadCSV(csv, `payments-${new Date().toISOString().split("T")[0]}.csv`);

    setExporting(false);
  };

  const exportLoansCSV = () => {
    setExporting(true);

    const selectedLoans = selectedLoanId === "all" ? loans : loans.filter((l) => l.id === selectedLoanId);

    const headers = [
      "Vehicle",
      "Lender",
      "Original Amount (GYD)",
      "Current Balance (GYD)",
      "Interest Rate (%)",
      "Monthly Payment (GYD)",
      "Start Date",
      "Progress (%)",
    ];

    const rows = selectedLoans.map((l) => {
      const progress = ((parseFloat(l.originalAmount) - parseFloat(l.currentBalance)) / parseFloat(l.originalAmount)) * 100;
      return [
        l.vehicleDescription || "Car Loan",
        l.lender?.shortName || "Unknown",
        parseFloat(l.originalAmount).toString(),
        parseFloat(l.currentBalance).toString(),
        (parseFloat(l.interestRate) * 100).toFixed(2),
        parseFloat(l.monthlyPayment).toString(),
        formatDate(l.startDate),
        progress.toFixed(1),
      ];
    });

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    downloadCSV(csv, `loans-${new Date().toISOString().split("T")[0]}.csv`);

    setExporting(false);
  };

  const exportSummaryCSV = () => {
    setExporting(true);

    const headers = ["Metric", "Value"];
    const rows = [
      ["Report Date", new Date().toLocaleDateString()],
      ["Total Loans", summary.loanCount.toString()],
      ["Original Loan Amount", formatCurrency(summary.totalOriginal)],
      ["Current Balance", formatCurrency(summary.totalBalance)],
      ["Overall Progress", `${summary.totalProgress.toFixed(1)}%`],
      ["Total Payments Made", (summary.regularCount + summary.extraCount).toString()],
      ["Total Amount Paid", formatCurrency(summary.totalPaid)],
      ["Regular Payments", formatCurrency(summary.totalRegular)],
      ["Extra Payments", formatCurrency(summary.totalExtra)],
      ...Object.entries(summary.sources).map(([source, amount]) => [
        `Payments from ${source.charAt(0).toUpperCase() + source.slice(1)}`,
        formatCurrency(amount),
      ]),
    ];

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    downloadCSV(csv, `summary-${new Date().toISOString().split("T")[0]}.csv`);

    setExporting(false);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
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
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Export and analyze your loan data</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Add a loan to generate reports.</p>
            <Button onClick={() => (window.location.href = "/loans/new")}>Add Loan</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Export and analyze your loan data</p>
        </div>
        <div className="w-64">
          <Select value={selectedLoanId} onValueChange={handleLoanChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select loan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loans</SelectItem>
              {loans.map((loan) => (
                <SelectItem key={loan.id} value={loan.id}>
                  {loan.vehicleDescription || "Car Loan"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Loans</CardDescription>
            <CardTitle className="text-2xl">{summary.loanCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall Progress</CardDescription>
            <CardTitle className="text-2xl">{summary.totalProgress.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalPaid)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining Balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.totalBalance)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download your loan data in CSV format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={exportSummaryCSV} disabled={exporting}>
              Export Summary Report
            </Button>
            <Button variant="outline" onClick={exportLoansCSV} disabled={exporting}>
              Export Loan Details
            </Button>
            <Button variant="outline" onClick={exportPaymentsCSV} disabled={exporting}>
              Export Payment History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Sources Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Sources</CardTitle>
          <CardDescription>Breakdown of payments by source</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(summary.sources).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(summary.sources)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, amount]) => (
                    <TableRow key={source}>
                      <TableCell className="font-medium">
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                      <TableCell className="text-right">
                        {((amount / summary.totalPaid) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No payment data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Loans Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Loans Overview</CardTitle>
          <CardDescription>Summary of all tracked loans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(selectedLoanId === "all" ? loans : loans.filter((l) => l.id === selectedLoanId)).map(
                (loan) => {
                  const progress =
                    ((parseFloat(loan.originalAmount) - parseFloat(loan.currentBalance)) /
                      parseFloat(loan.originalAmount)) *
                    100;
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">
                        {loan.vehicleDescription || "Car Loan"}
                      </TableCell>
                      <TableCell>{loan.lender?.shortName || "Unknown"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(loan.originalAmount))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(loan.currentBalance))}
                      </TableCell>
                      <TableCell className="text-right">{progress.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={progress >= 100 ? "default" : "secondary"}>
                          {progress >= 100 ? "Paid Off" : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest 10 payments recorded</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .sort(
                    (a, b) =>
                      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
                  )
                  .slice(0, 10)
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{payment.loan?.vehicleDescription || "Unknown"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(parseFloat(payment.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.paymentType === "extra" ? "default" : "secondary"}>
                          {payment.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.source.charAt(0).toUpperCase() + payment.source.slice(1)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
