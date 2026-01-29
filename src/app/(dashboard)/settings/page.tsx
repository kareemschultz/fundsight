"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
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
  const [nextGratuityDate, setNextGratuityDate] = useState("");

  // Preferences
  const [currency, setCurrency] = useState("GYD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    paymentReminders: true,
    milestoneAlerts: true,
    financialInsights: true,
    gratuityReminders: true,
    systemNotifications: true,
  });

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }

    // Load financial profile
    fetch("/api/users/financial-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setMonthlyIncome(data.monthlyIncome || "");
          setEmergencyFund(data.emergencyFund || "");
          setTargetExtraPayment(data.targetExtraPayment || "");
          setExpectedGratuity(data.expectedGratuity || "");
          setNextGratuityDate(data.nextGratuityDate || "");
        }
      })
      .catch(() => {});

    // Load notification preferences
    fetch("/api/notifications/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setNotifPrefs({
            paymentReminders: data.paymentReminders ?? true,
            milestoneAlerts: data.milestoneAlerts ?? true,
            financialInsights: data.financialInsights ?? true,
            gratuityReminders: data.gratuityReminders ?? true,
            systemNotifications: data.systemNotifications ?? true,
          });
        }
      })
      .catch(() => {});
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
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        update({ name });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
      }
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
      const res = await fetch("/api/users/financial-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: parseFloat(monthlyIncome.replace(/,/g, "")) || 0,
          emergencyFund: parseFloat(emergencyFund.replace(/,/g, "")) || 0,
          targetExtraPayment:
            parseFloat(targetExtraPayment.replace(/,/g, "")) || 0,
          expectedGratuity:
            parseFloat(expectedGratuity.replace(/,/g, "")) || 0,
          ...(nextGratuityDate ? { nextGratuityDate } : {}),
        }),
      });

      if (res.ok) {
        setSuccess("Financial profile updated!");
      } else {
        setError("Failed to update financial profile");
      }
    } catch {
      setError("Failed to update financial profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifPrefsUpdate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifPrefs),
      });

      if (res.ok) {
        setSuccess("Notification preferences saved!");
      } else {
        setError("Failed to save notification preferences");
      }
    } catch {
      setError("Failed to save notification preferences");
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
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                Set your financial details for better payment planning and AI
                insights
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
                      onChange={(e) =>
                        setMonthlyIncome(
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      placeholder="500,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency">
                      Emergency Fund (GYD)
                    </Label>
                    <Input
                      id="emergency"
                      type="text"
                      value={emergencyFund}
                      onChange={(e) =>
                        setEmergencyFund(
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      placeholder="1,000,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extra">
                      Target Extra Payment (GYD)
                    </Label>
                    <Input
                      id="extra"
                      type="text"
                      value={targetExtraPayment}
                      onChange={(e) =>
                        setTargetExtraPayment(
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      placeholder="100,000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Amount you want to save for extra payments
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gratuity">
                      Expected Gratuity (GYD)
                    </Label>
                    <Input
                      id="gratuity"
                      type="text"
                      value={expectedGratuity}
                      onChange={(e) =>
                        setExpectedGratuity(
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      placeholder="500,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gratuityDate">
                      Next Gratuity Date
                    </Label>
                    <Input
                      id="gratuityDate"
                      type="date"
                      value={nextGratuityDate}
                      onChange={(e) =>
                        setNextGratuityDate(e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      When do you expect your next gratuity?
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when payments are due
                  </p>
                </div>
                <Switch
                  checked={notifPrefs.paymentReminders}
                  onCheckedChange={(checked) =>
                    setNotifPrefs((prev) => ({
                      ...prev,
                      paymentReminders: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Milestone Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Celebrate when you reach payoff milestones
                  </p>
                </div>
                <Switch
                  checked={notifPrefs.milestoneAlerts}
                  onCheckedChange={(checked) =>
                    setNotifPrefs((prev) => ({
                      ...prev,
                      milestoneAlerts: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Financial Insights</Label>
                  <p className="text-xs text-muted-foreground">
                    AI-powered tips and strategy suggestions
                  </p>
                </div>
                <Switch
                  checked={notifPrefs.financialInsights}
                  onCheckedChange={(checked) =>
                    setNotifPrefs((prev) => ({
                      ...prev,
                      financialInsights: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Gratuity Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Alerts when your gratuity is approaching
                  </p>
                </div>
                <Switch
                  checked={notifPrefs.gratuityReminders}
                  onCheckedChange={(checked) =>
                    setNotifPrefs((prev) => ({
                      ...prev,
                      gratuityReminders: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Updates about FundSight features and maintenance
                  </p>
                </div>
                <Switch
                  checked={notifPrefs.systemNotifications}
                  onCheckedChange={(checked) =>
                    setNotifPrefs((prev) => ({
                      ...prev,
                      systemNotifications: checked,
                    }))
                  }
                />
              </div>

              <Button
                onClick={handleNotifPrefsUpdate}
                disabled={loading}
              >
                {loading ? "Saving…" : "Save Notification Preferences"}
              </Button>
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
                  <Select
                    value={currency}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GYD">
                        GYD - Guyanese Dollar
                      </SelectItem>
                      <SelectItem value="USD">
                        USD - US Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={dateFormat}
                    onValueChange={handleDateFormatChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">
                        MM/DD/YYYY
                      </SelectItem>
                      <SelectItem value="DD/MM/YYYY">
                        DD/MM/YYYY
                      </SelectItem>
                      <SelectItem value="YYYY-MM-DD">
                        YYYY-MM-DD
                      </SelectItem>
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
