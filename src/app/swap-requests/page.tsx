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
import { Plus, Search, Star, Calendar, MapPin } from "lucide-react";

interface SwapRequest {
  _id: string;
  requesterId: {
    _id: string;
    name: string;
    image?: string;
    rating: number;
    totalRatings: number;
  };
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}

export default function SwapRequests() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    offeredSkill: "",
    wantedSkill: "",
    message: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchRequests();
    }
  }, [status, router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/swap-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const response = await fetch("/api/swap-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRequest),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewRequest({ offeredSkill: "", wantedSkill: "", message: "" });
        fetchRequests();
      }
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/swap-requests/${requestId}/accept`, {
        method: "PUT",
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.offeredSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.wantedSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Swap Requests</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Swap Request</DialogTitle>
              <DialogDescription>
                Propose a skill swap with another user
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="offeredSkill">Skill I Can Offer</Label>
                <Input
                  id="offeredSkill"
                  value={newRequest.offeredSkill}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      offeredSkill: e.target.value,
                    })
                  }
                  placeholder="e.g., Web Development"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wantedSkill">Skill I Want to Learn</Label>
                <Input
                  id="wantedSkill"
                  value={newRequest.wantedSkill}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      wantedSkill: e.target.value,
                    })
                  }
                  placeholder="e.g., Graphic Design"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newRequest.message}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, message: e.target.value })
                  }
                  placeholder="Describe what you're looking for and how you can help..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRequest}>Create Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by skill or user name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={request.requesterId.image}
                    alt={request.requesterId.name}
                  />
                  <AvatarFallback>
                    {request.requesterId.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {request.requesterId.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    {request.requesterId.rating.toFixed(1)} (
                    {request.requesterId.totalRatings})
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Offering:
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {request.offeredSkill}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Wants:
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {request.wantedSkill}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">
                {request.message}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
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
                  {request.status}
                </Badge>
              </div>

              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAcceptRequest(request._id)}
                  >
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No swap requests found</p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search terms
            </p>
          )}
        </div>
      )}
    </div>
  );
}
