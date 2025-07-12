"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  MessageSquare,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Rating {
  _id: string;
  raterId: {
    _id: string;
    name: string;
    image?: string;
  };
  ratedUserId: {
    _id: string;
    name: string;
    image?: string;
  };
  swapRequestId: {
    _id: string;
    offeredSkill: string;
    wantedSkill: string;
  };
  rating: number;
  feedback: string;
  createdAt: string;
}

interface CompletedSwap {
  _id: string;
  requesterId: {
    _id: string;
    name: string;
    image?: string;
  };
  providerId: {
    _id: string;
    name: string;
    image?: string;
  };
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: "completed";
  createdAt: string;
}

export default function Ratings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [completedSwaps, setCompletedSwaps] = useState<CompletedSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<CompletedSwap | null>(null);
  const [newRating, setNewRating] = useState({
    rating: 5,
    feedback: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [ratingsResponse, swapsResponse] = await Promise.all([
        fetch("/api/ratings"),
        fetch("/api/swap-requests/completed"),
      ]);

      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        setRatings(ratingsData);
      }

      if (swapsResponse.ok) {
        const swapsData = await swapsResponse.json();
        setCompletedSwaps(swapsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedSwap) return;

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swapRequestId: selectedSwap._id,
          ratedUserId: selectedSwap.providerId._id,
          rating: newRating.rating,
          feedback: newRating.feedback,
        }),
      });

      if (response.ok) {
        setIsRatingDialogOpen(false);
        setSelectedSwap(null);
        setNewRating({ rating: 5, feedback: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const openRatingDialog = (swap: CompletedSwap) => {
    setSelectedSwap(swap);
    setIsRatingDialogOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ratings & Feedback</h1>
      </div>

      {/* Completed Swaps Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Completed Swaps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedSwaps.map((swap) => (
            <Card key={swap._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={swap.providerId.image}
                        alt={swap.providerId.name}
                      />
                      <AvatarFallback>
                        {swap.providerId.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {swap.providerId.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Provider</p>
                    </div>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Offered:
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {swap.offeredSkill}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Wanted:
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {swap.wantedSkill}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {swap.message}
                </p>

                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(swap.createdAt).toLocaleDateString()}
                </div>

                <Button
                  onClick={() => openRatingDialog(swap)}
                  className="w-full"
                  size="sm"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Rate Experience
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {completedSwaps.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No completed swaps yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete a skill swap to leave ratings and feedback
            </p>
          </div>
        )}
      </section>

      {/* Ratings Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Ratings</h2>
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating._id}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={rating.raterId.image}
                      alt={rating.raterId.name}
                    />
                    <AvatarFallback>
                      {rating.raterId.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{rating.raterId.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          rated {rating.ratedUserId.name}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {renderStars(rating.rating)}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">{rating.feedback}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>
                          Swap: {rating.swapRequestId.offeredSkill} ↔{" "}
                          {rating.swapRequestId.wantedSkill}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ratings.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No ratings yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ratings will appear here once users start rating their experiences
            </p>
          </div>
        )}
      </section>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Share your feedback about the skill swap with{" "}
              {selectedSwap?.providerId.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating({ ...newRating, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newRating.rating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={newRating.feedback}
                onChange={(e) =>
                  setNewRating({ ...newRating, feedback: e.target.value })
                }
                placeholder="Share your experience with this skill swap..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRatingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRating}>Submit Rating</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
