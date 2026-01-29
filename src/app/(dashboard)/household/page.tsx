"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HouseholdMember {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string };
}

interface SharedLoan {
  id: string;
  sharedAt: string;
  sharedBy: { id: string; name: string };
  loan: {
    id: string;
    vehicleDescription: string | null;
    originalAmount: string;
    currentBalance: string;
    interestRate: string;
    monthlyPayment: string;
    isActive: boolean;
    lender: { name: string; shortName: string } | null;
    payments: Array<{ amount: string }>;
  };
}

interface Household {
  id: string;
  name: string;
  inviteCode: string;
  myRole: string;
  memberCount: number;
  loanCount: number;
  members: HouseholdMember[];
  loans: SharedLoan[];
  createdAt: string;
}

interface UserLoan {
  id: string;
  vehicleDescription: string | null;
  originalAmount: string;
  currentBalance: string;
  lender: { shortName: string } | null;
}

export default function HouseholdPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [userLoans, setUserLoans] = useState<UserLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create household
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Join household
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Share loan
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GY", {
      style: "currency",
      currency: "GYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const fetchData = useCallback(async () => {
    try {
      const [householdRes, loansRes] = await Promise.all([
        fetch("/api/households"),
        fetch("/api/loans"),
      ]);
      const [householdData, loansData] = await Promise.all([
        householdRes.json(),
        loansRes.json(),
      ]);
      setHouseholds(Array.isArray(householdData) ? householdData : []);
      setUserLoans(Array.isArray(loansData) ? loansData : []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess("Household created! Share the invite code with family members.");
      setNewName("");
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const joinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/households/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Joined "${data.household.name}" successfully!`);
      setInviteCode("");
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  const shareLoan = async () => {
    if (!selectedHouseholdId || !selectedLoanId) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `/api/households/${selectedHouseholdId}/loans`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loanId: selectedLoanId }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess("Loan shared with household!");
      setSelectedLoanId("");
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to share loan");
    }
  };

  const updateRole = async (householdId: string, memberId: string, role: string) => {
    try {
      const res = await fetch(`/api/households/${householdId}/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const unshareLoan = async (householdId: string, loanId: string) => {
    try {
      const res = await fetch(
        `/api/households/${householdId}/loans?loanId=${loanId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to unshare");
      fetchData();
    } catch {
      setError("Failed to unshare loan");
    }
  };

  const removeMember = async (householdId: string, memberId: string) => {
    try {
      const res = await fetch(
        `/api/households/${householdId}/members?memberId=${memberId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove");
      fetchData();
    } catch {
      setError("Failed to remove member");
    }
  };

  const deleteHousehold = async (id: string) => {
    if (!confirm("Are you sure? This will remove all members and shared loans.")) return;
    try {
      const res = await fetch(`/api/households/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSuccess("Household deleted");
      fetchData();
    } catch {
      setError("Failed to delete household");
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      contributor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return (
      <Badge variant="secondary" className={colors[role] || ""}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Household</h1>
        <p className="text-muted-foreground">
          Manage shared finances with family or team members
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={households.length > 0 ? "overview" : "create"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create / Join</TabsTrigger>
          {households.length > 0 && (
            <TabsTrigger value="share">Share Loans</TabsTrigger>
          )}
        </TabsList>

        {/* Create / Join Tab */}
        <TabsContent value="create">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create a Household</CardTitle>
                <CardDescription>
                  Start a new household and invite family members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Household Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., The Smiths, My Family"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={creating} className="w-full">
                    {creating ? "Creating…" : "Create Household"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join a Household</CardTitle>
                <CardDescription>
                  Enter an invite code to join an existing household
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={joinHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Invite Code</Label>
                    <Input
                      id="code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g., ABC12345"
                      className="font-mono tracking-widest text-center text-lg"
                      maxLength={8}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={joining} className="w-full">
                    {joining ? "Joining…" : "Join Household"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Share Loans Tab */}
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share a Loan</CardTitle>
              <CardDescription>
                Share one of your loans with a household so members can view it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Select Household</Label>
                  <Select value={selectedHouseholdId} onValueChange={(v: string | null) => { if (v) setSelectedHouseholdId(v); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose household" />
                    </SelectTrigger>
                    <SelectContent>
                      {households
                        .filter((h) => h.myRole !== "viewer")
                        .map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Loan</Label>
                  <Select value={selectedLoanId} onValueChange={(v: string | null) => { if (v) setSelectedLoanId(v); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose loan" />
                    </SelectTrigger>
                    <SelectContent>
                      {userLoans.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.vehicleDescription || "Car Loan"}{" "}
                          ({l.lender?.shortName || "Unknown"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={shareLoan}
                    disabled={!selectedHouseholdId || !selectedLoanId}
                    className="w-full"
                  >
                    Share Loan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {households.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-2">
                  You haven&apos;t joined any households yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Create one or join using an invite code.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {households.map((household) => (
                <Card key={household.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {household.name}
                          {getRoleBadge(household.myRole)}
                        </CardTitle>
                        <CardDescription>
                          {household.memberCount} member{household.memberCount !== 1 && "s"} ·{" "}
                          {household.loanCount} shared loan{household.loanCount !== 1 && "s"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Invite Code</p>
                          <p className="font-mono text-sm font-semibold tracking-widest">
                            {household.inviteCode}
                          </p>
                        </div>
                        {household.myRole === "admin" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteHousehold(household.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Members */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Members</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            {household.myRole === "admin" && (
                              <TableHead className="text-right">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {household.members.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell className="font-medium">{m.user.name}</TableCell>
                              <TableCell className="text-muted-foreground">{m.user.email}</TableCell>
                              <TableCell>{getRoleBadge(m.role)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(m.joinedAt).toLocaleDateString()}
                              </TableCell>
                              {household.myRole === "admin" && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Select
                                      value={m.role}
                                      onValueChange={(v: string | null) => { if (v) updateRole(household.id, m.id, v); }}
                                    >
                                      <SelectTrigger className="w-32 h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="contributor">Contributor</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => removeMember(household.id, m.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Shared Loans - Financial Overview */}
                    {household.loans.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Family Financial Overview
                        </h3>
                        {/* Summary cards */}
                        <div className="grid gap-3 sm:grid-cols-3 mb-4">
                          <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                              <p className="text-xs text-muted-foreground">
                                Total Outstanding
                              </p>
                              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(
                                  household.loans.reduce(
                                    (sum, hl) =>
                                      sum + parseFloat(hl.loan.currentBalance),
                                    0
                                  )
                                )}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                              <p className="text-xs text-muted-foreground">
                                Total Original
                              </p>
                              <p className="text-xl font-bold">
                                {formatCurrency(
                                  household.loans.reduce(
                                    (sum, hl) =>
                                      sum + parseFloat(hl.loan.originalAmount),
                                    0
                                  )
                                )}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4 pb-3 px-4">
                              <p className="text-xs text-muted-foreground">
                                Monthly Payments
                              </p>
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(
                                  household.loans.reduce(
                                    (sum, hl) =>
                                      sum + parseFloat(hl.loan.monthlyPayment),
                                    0
                                  )
                                )}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Vehicle</TableHead>
                              <TableHead>Lender</TableHead>
                              <TableHead>Balance</TableHead>
                              <TableHead>Monthly</TableHead>
                              <TableHead>Shared By</TableHead>
                              {household.myRole !== "viewer" && (
                                <TableHead className="text-right">Actions</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {household.loans.map((hl) => (
                              <TableRow key={hl.id}>
                                <TableCell className="font-medium">
                                  {hl.loan.vehicleDescription || "Car Loan"}
                                </TableCell>
                                <TableCell>
                                  {hl.loan.lender?.shortName || "—"}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(parseFloat(hl.loan.currentBalance))}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(parseFloat(hl.loan.monthlyPayment))}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {hl.sharedBy.name}
                                </TableCell>
                                {household.myRole !== "viewer" && (
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => unshareLoan(household.id, hl.loan.id)}
                                    >
                                      Unshare
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
