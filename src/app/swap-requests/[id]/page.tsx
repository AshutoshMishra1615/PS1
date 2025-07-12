"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Star,
  Calendar,
  MessageSquare,
  Check,
  X,
  Send,
} from "lucide-react";
import Link from "next/link";

interface SwapRequest {
  _id: string;
  requesterId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    rating: number;
    totalRatings: number;
    bio?: string;
    location?: string;
  };
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}

export default function SwapRequestDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<SwapRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState({
    message: "",
    action: "accept" as "accept" | "reject",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && requestId) {
      fetchRequest();
    }
  }, [status, requestId, router]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/swap-requests/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        router.push("/swap-requests");
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      router.push("/swap-requests");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    try {
      const endpoint =
        response.action === "accept"
          ? `/api/swap-requests/${requestId}/accept`
          : `/api/swap-requests/${requestId}/reject`;

      const apiResponse = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: response.message }),
      });

      if (apiResponse.ok) {
        setIsResponseDialogOpen(false);
        setResponse({ message: "", action: "accept" });
        fetchRequest();
      }
    } catch (error) {
      console.error("Error responding to request:", error);
    }
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
          <p className="mt-2 text-muted-foreground">
            Loading request details...
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Request not found</p>
        <Link href="/swap-requests">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>
    );
  }

  const isRequester = session?.user?.email === request.requesterId.email;
  const canRespond = !isRequester && request.status === "pending";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/swap-requests">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Swap Request Details</h1>
          <p className="text-muted-foreground">
            Request from {request.requesterId.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Exchange */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Exchange</CardTitle>
              <CardDescription>
                What's being offered and requested
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Offering
                  </Label>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {request.offeredSkill}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Wants to Learn
                  </Label>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {request.wantedSkill}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Message from {request.requesterId.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{request.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      request.status === "pending"
                        ? "secondary"
                        : request.status === "accepted"
                        ? "default"
                        : request.status === "completed"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {canRespond && (
                <div className="flex gap-2">
                  <Dialog
                    open={isResponseDialogOpen}
                    onOpenChange={setIsResponseDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Accept Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Accept Swap Request</DialogTitle>
                        <DialogDescription>
                          Send a message to {request.requesterId.name} to
                          confirm the swap
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="response-message">
                            Message (Optional)
                          </Label>
                          <Textarea
                            id="response-message"
                            value={response.message}
                            onChange={(e) =>
                              setResponse({
                                ...response,
                                message: e.target.value,
                              })
                            }
                            placeholder="Add a message to confirm the swap..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsResponseDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleResponse}>Accept Request</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isResponseDialogOpen}
                    onOpenChange={setIsResponseDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Decline Swap Request</DialogTitle>
                        <DialogDescription>
                          Send a message to {request.requesterId.name}{" "}
                          explaining why you're declining
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="decline-message">
                            Message (Optional)
                          </Label>
                          <Textarea
                            id="decline-message"
                            value={response.message}
                            onChange={(e) =>
                              setResponse({
                                ...response,
                                message: e.target.value,
                              })
                            }
                            placeholder="Explain why you're declining this request..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsResponseDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setResponse({ ...response, action: "reject" });
                            handleResponse();
                          }}
                        >
                          Decline Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {isRequester && request.status === "pending" && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Waiting for response from other users...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - User Profile */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {request.requesterId.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={request.requesterId.image}
                    alt={request.requesterId.name}
                  />
                  <AvatarFallback>
                    {request.requesterId.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{request.requesterId.name}</h3>
                  <div className="flex items-center">
                    {renderStars(request.requesterId.rating)}
                    <span className="ml-1 text-sm text-muted-foreground">
                      ({request.requesterId.totalRatings})
                    </span>
                  </div>
                </div>
              </div>

              {request.requesterId.bio && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Bio
                  </Label>
                  <p className="text-sm mt-1">{request.requesterId.bio}</p>
                </div>
              )}

              {request.requesterId.location && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Location
                  </Label>
                  <p className="text-sm mt-1">{request.requesterId.location}</p>
                </div>
              )}

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Member since {new Date(request.createdAt).getFullYear()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
