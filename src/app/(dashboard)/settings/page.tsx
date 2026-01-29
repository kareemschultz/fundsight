"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile settings
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  // Financial profile
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [emergencyFund, setEmergencyFund] = useState("");
  const [targetExtraPayment, setTargetExtraPayment] = useState("");
  const [expectedGratuity, setExpectedGratuity] = useState("");

  // Preferences
  const [currency, setCurrency] = useState("GYD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleCurrencyChange = (value: string | null) => {
    if (value) setCurrency(value);
  };

  const handleDateFormatChange = (value: string | null) => {
    if (value) setDateFormat(value);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // In a real app, this would call an API to update the profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess("Profile updated successfully!");
      update({ name });
    } catch {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // In a real app, this would call an API to update financial profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess("Financial profile updated!");
    } catch {
      setError("Failed to update financial profile");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyInput = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Profile</CardTitle>
              <CardDescription>
                Set your financial details for better payment planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFinancialUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income (GYD)</Label>
                    <Input
                      id="income"
                      type="text"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(formatCurrencyInput(e.target.value))}
                      placeholder="500,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Fund (GYD)</Label>
                    <Input
                      id="emergency"
                      type="text"
                      value={emergencyFund}
                      onChange={(e) => setEmergencyFund(formatCurrencyInput(e.target.value))}
                      placeholder="1,000,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extra">Target Extra Payment (GYD)</Label>
                    <Input
                      id="extra"
                      type="text"
                      value={targetExtraPayment}
                      onChange={(e) => setTargetExtraPayment(formatCurrencyInput(e.target.value))}
                      placeholder="100,000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Amount you want to save for extra payments
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gratuity">Expected Gratuity (GYD)</Label>
                    <Input
                      id="gratuity"
                      type="text"
                      value={expectedGratuity}
                      onChange={(e) => setExpectedGratuity(formatCurrencyInput(e.target.value))}
                      placeholder="500,000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your expected bi-annual gratuity
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Save Financial Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Customize how information is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GYD">GYD - Guyanese Dollar</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button disabled={loading}>
                {loading ? "Saving…" : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
