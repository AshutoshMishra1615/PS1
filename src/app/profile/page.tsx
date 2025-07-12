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
import { Edit, Save, X, Plus, Star } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
  skills: {
    offered: string[];
    wanted: string[];
  };
  rating: number;
  totalRatings: number;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newOfferedSkill, setNewOfferedSkill] = useState("");
  const [newWantedSkill, setNewWantedSkill] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const addOfferedSkill = () => {
    if (newOfferedSkill.trim() && profile) {
      setProfile({
        ...profile,
        skills: {
          ...profile.skills,
          offered: [...profile.skills.offered, newOfferedSkill.trim()],
        },
      });
      setNewOfferedSkill("");
    }
  };

  const addWantedSkill = () => {
    if (newWantedSkill.trim() && profile) {
      setProfile({
        ...profile,
        skills: {
          ...profile.skills,
          wanted: [...profile.skills.wanted, newWantedSkill.trim()],
        },
      });
      setNewWantedSkill("");
    }
  };

  const removeOfferedSkill = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: {
          ...profile.skills,
          offered: profile.skills.offered.filter((_, i) => i !== index),
        },
      });
    }
  };

  const removeWantedSkill = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: {
          ...profile.skills,
          wanted: profile.skills.wanted.filter((_, i) => i !== index),
        },
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm">
                    {profile.rating.toFixed(1)} ({profile.totalRatings} ratings)
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    placeholder="Your location"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.bio && <p className="text-sm">{profile.bio}</p>}
                {profile.location && (
                  <p className="text-sm text-muted-foreground">
                    {profile.location}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Manage your offered and wanted skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Offered Skills */}
            <div>
              <h4 className="font-semibold mb-3">Skills I Can Offer</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.skills.offered.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeOfferedSkill(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newOfferedSkill}
                    onChange={(e) => setNewOfferedSkill(e.target.value)}
                    placeholder="Add a skill you can offer"
                    onKeyPress={(e) => e.key === "Enter" && addOfferedSkill()}
                  />
                  <Button onClick={addOfferedSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Wanted Skills */}
            <div>
              <h4 className="font-semibold mb-3">Skills I Want to Learn</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.skills.wanted.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeWantedSkill(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newWantedSkill}
                    onChange={(e) => setNewWantedSkill(e.target.value)}
                    placeholder="Add a skill you want to learn"
                    onKeyPress={(e) => e.key === "Enter" && addWantedSkill()}
                  />
                  <Button onClick={addWantedSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
