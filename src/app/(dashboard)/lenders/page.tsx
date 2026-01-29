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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LenderStats {
  avgRating: string;
  totalReviews: number;
}

interface Lender {
  id: string;
  name: string;
  shortName: string;
  defaultRate: string | null;
  country: string;
}

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  experienceType: string;
  helpfulCount: number;
  createdAt: string;
  user: { id: string; name: string };
  hasVoted: boolean;
  isOwn: boolean;
}

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [lenderStatsMap, setLenderStatsMap] = useState<Record<string, LenderStats>>({});
  const [selectedLenderId, setSelectedLenderId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review form
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [experienceType, setExperienceType] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  const fetchLenders = useCallback(async () => {
    try {
      const res = await fetch("/api/lenders");
      const data = await res.json();
      setLenders(data);

      // Fetch stats for each lender
      const statsMap: Record<string, LenderStats> = {};
      await Promise.all(
        data.map(async (lender: Lender) => {
          try {
            const statsRes = await fetch(`/api/lenders/${lender.id}/reviews`);
            const statsData = await statsRes.json();
            if (statsData.stats) {
              statsMap[lender.id] = statsData.stats;
            }
          } catch {
            // Ignore individual stat failures
          }
        })
      );
      setLenderStatsMap(statsMap);
    } catch {
      setError("Failed to load lenders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLenders();
  }, [fetchLenders]);

  const fetchReviews = async (lenderId: string) => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/lenders/${lenderId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
      if (data.stats) {
        setLenderStatsMap((prev) => ({ ...prev, [lenderId]: data.stats }));
      }
    } catch {
      setError("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  const selectLender = (id: string) => {
    setSelectedLenderId(id);
    setError("");
    setSuccess("");
    setRating(0);
    setReviewText("");
    setExperienceType("general");
    fetchReviews(id);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLenderId || rating === 0) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/lenders/${selectedLenderId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reviewText: reviewText || undefined, experienceType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const data = await res.json();
      setSuccess(data.message);
      setRating(0);
      setReviewText("");
      fetchReviews(selectedLenderId);
      fetchLenders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const voteReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      if (selectedLenderId) fetchReviews(selectedLenderId);
    } catch {
      setError("Failed to vote");
    }
  };

  const deleteReview = async () => {
    if (!selectedLenderId) return;
    try {
      const res = await fetch(`/api/lenders/${selectedLenderId}/reviews`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess("Review deleted");
      fetchReviews(selectedLenderId);
      fetchLenders();
    } catch {
      setError("Failed to delete review");
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`text-xl transition-colors ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } ${star <= value ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getRatingColor = (avg: number) => {
    if (avg >= 4) return "text-green-600 dark:text-green-400";
    if (avg >= 3) return "text-yellow-600 dark:text-yellow-400";
    if (avg >= 2) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const experienceLabels: Record<string, string> = {
    application: "Loan Application",
    repayment: "Repayment Experience",
    customer_service: "Customer Service",
    general: "General",
  };

  const selectedLender = lenders.find((l) => l.id === selectedLenderId);

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
        <h1 className="text-3xl font-bold tracking-tight">Lenders</h1>
        <p className="text-muted-foreground">
          Browse lenders and see community ratings and reviews
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

      {/* Lender Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lenders.map((lender) => {
          const stats = lenderStatsMap[lender.id];
          const avgRating = stats ? parseFloat(stats.avgRating) : 0;
          const isSelected = selectedLenderId === lender.id;

          return (
            <Card
              key={lender.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => selectLender(lender.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {lender.shortName.charAt(0)}
                  </div>
                  {stats && stats.totalReviews > 0 && (
                    <span className={`text-2xl font-bold ${getRatingColor(avgRating)}`}>
                      {avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{lender.shortName}</CardTitle>
                <CardDescription className="text-xs">{lender.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats && stats.totalReviews > 0 ? (
                    <>
                      {renderStars(Math.round(avgRating))}
                      <p className="text-xs text-muted-foreground">
                        {stats.totalReviews} review{stats.totalReviews !== 1 && "s"}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reviews yet</p>
                  )}
                  {lender.defaultRate && (
                    <p className="text-xs">
                      Default Rate:{" "}
                      <span className="font-medium">{lender.defaultRate}%</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Lender Details */}
      {selectedLender && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedLender.name}</CardTitle>
              <CardDescription>
                {selectedLender.shortName} · {selectedLender.country}
                {selectedLender.defaultRate && ` · Default Rate: ${selectedLender.defaultRate}%`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Rating Distribution */}
              {reviews.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-semibold">Rating Distribution</h3>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const starCount = reviews.filter((r) => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (starCount / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-8">{star} ★</span>
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground w-8">{starCount}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Write Review Form */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Write a Review</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Rating</Label>
                    {renderStars(rating, true)}
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Type</Label>
                    <Select value={experienceType} onValueChange={(v) => { if (v) setExperienceType(v); }}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="application">Loan Application</SelectItem>
                        <SelectItem value="repayment">Repayment</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Review (optional)</Label>
                    <Input
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      maxLength={2000}
                    />
                  </div>
                  <Button type="submit" disabled={submitting || rating === 0}>
                    {submitting ? "Submitting…" : "Submit Review"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <p className="text-muted-foreground">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to review this lender!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <Badge variant="secondary" className="text-xs">
                            {experienceLabels[review.experienceType] || review.experienceType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.isOwn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive text-xs"
                              onClick={deleteReview}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                      {review.reviewText && (
                        <p className="text-sm">{review.reviewText}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {review.user.name} ·{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${review.hasVoted ? "text-blue-600" : ""}`}
                          onClick={() => voteReview(review.id)}
                        >
                          👍 Helpful ({review.helpfulCount})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
