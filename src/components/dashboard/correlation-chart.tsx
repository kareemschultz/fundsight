"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  id: string;
  amount: string;
  paymentType: string;
  paymentDate: string;
}

interface Loan {
  id: string;
  interestRate: string;
  originalAmount: string;
  currentBalance: string;
}

interface CorrelationChartProps {
  payments: Payment[];
  loan: Loan | null;
}

export function CorrelationChart({ payments, loan }: CorrelationChartProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const correlationData = useMemo(() => {
    if (!loan || payments.length === 0) return [];

    const extraPayments = payments.filter((p) => p.paymentType === "extra");

    return extraPayments.map((payment, index) => {
      const extraAmount = parseFloat(payment.amount);
      const monthlyRate = parseFloat(loan.interestRate) / 12 / 100;

      // Simplified calculation: interest saved ≈ extra payment * monthly rate * remaining months
      // Assuming average 24 months remaining
      const estimatedInterestSaved = extraAmount * monthlyRate * 24;

      return {
        extraPayment: extraAmount,
        interestSaved: estimatedInterestSaved,
        paymentNumber: index + 1,
      };
    });
  }, [payments, loan]);

  if (!loan || correlationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extra Payments Impact</CardTitle>
          <CardDescription>
            Correlation between extra payments and interest savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Make extra payments to see impact analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extra Payments Impact</CardTitle>
        <CardDescription>
          Visualizing how extra payments reduce your interest costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="extraPayment"
                name="Extra Payment"
                tickFormatter={formatCurrency}
                label={{
                  value: "Extra Payment Amount",
                  position: "insideBottom",
                  offset: -10,
                }}
                className="text-xs"
              />
              <YAxis
                type="number"
                dataKey="interestSaved"
                name="Interest Saved"
                tickFormatter={formatCurrency}
                label={{
                  value: "Interest Saved",
                  angle: -90,
                  position: "insideLeft",
                }}
                className="text-xs"
              />
              <ZAxis range={[100, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-semibold mb-1">
                          Payment #{data.paymentNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Extra: {formatCurrency(data.extraPayment)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Saved: {formatCurrency(data.interestSaved)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Extra Payments" data={correlationData} fill="#22c55e">
                {correlationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#22c55e" : "#16a34a"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>
            📊 Trend: Larger extra payments result in proportionally higher interest savings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
