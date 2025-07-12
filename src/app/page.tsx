"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Star,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Exchange Skills, <span className="text-primary">Grow Together</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with people who have the skills you need and offer your
            expertise in return. Build meaningful relationships while learning
            and teaching.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {session ? (
            <>
              <Link href="/swap-requests">
                <Button size="lg" className="text-lg px-8">
                  Browse Requests
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  View Profile
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary" />
            <CardTitle>Connect</CardTitle>
            <CardDescription>
              Find people with the skills you need and connect with them
              directly.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-primary" />
            <CardTitle>Exchange</CardTitle>
            <CardDescription>
              Propose skill swaps and negotiate terms that work for both
              parties.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-8 w-8 text-primary" />
            <CardTitle>Grow</CardTitle>
            <CardDescription>
              Learn new skills, build your network, and get rated for your
              expertise.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">1,200+</div>
            <div className="text-muted-foreground">Skill Swaps</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4.8</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-muted-foreground">Skills Available</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Ready to Start Swapping Skills?</h2>
        <p className="text-muted-foreground">
          Join our community and start exchanging skills today.
        </p>
        <Link href={session ? "/swap-requests" : "/auth/signin"}>
          <Button size="lg" className="text-lg px-8">
            {session ? "Browse Requests" : "Sign Up Now"}
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
