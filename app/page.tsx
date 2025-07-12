"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Search,
  MessageSquare,
  Star,
  Trophy,
  Globe,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register the GSAP ScrollTrigger plugin once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Define the shape of our story content and move it outside the component
interface StoryItem {
  Icon: ElementType;
  title: string;
  description: string;
}

const storyContent: StoryItem[] = [
  {
    Icon: Search,
    title: "1. Discover & Find",
    description:
      "Begin by exploring a vast marketplace of skills. Use our powerful search and filtering tools to find exactly what you need.",
  },
  {
    Icon: MessageSquare,
    title: "2. Connect & Swap",
    description:
      "Once you find a match, send a swap request. Communicate securely through our platform to agree on the terms of your exchange.",
  },
  {
    Icon: Star,
    title: "3. Rate & Review",
    description:
      "After the swap is complete, share your experience. Your feedback helps build a trustworthy and reliable community for everyone.",
  },
  {
    Icon: Globe,
    title: "4. Join the Community",
    description:
      "You are now part of a global network! Continue learning, sharing, and connecting with passionate individuals from all over the world.",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- State for the Storytelling Section ---
  const [activeIndex, setActiveIndex] = useState(0);

  // --- Typed Refs for Animation Targets ---
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const storySectionRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const pinnedContentRef = useRef<HTMLDivElement>(null);

  // Effect to redirect logged-in users
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Main effect for all GSAP animations
  useEffect(() => {
    if (status !== "loading") {
      const ctx = gsap.context(() => {
        // 1. Hero Title Animation
        if (heroTitleRef.current) {
          const words =
            heroTitleRef.current.textContent?.trim().split(/\s+/) ?? [];
          heroTitleRef.current.innerHTML = words
            .map((word) => `<span class="word inline-block">${word}</span>`)
            .join(" ");
          gsap.from(".word", {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2,
          });
        }

        // 2. Stats Section Animation
        if (statsSectionRef.current) {
          gsap.from(statsSectionRef.current.children, {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsSectionRef.current,
              start: "top 85%",
            },
          });
        }

        // 3. Storytelling Section Animation
        if (storySectionRef.current) {
          ScrollTrigger.create({
            trigger: storySectionRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: ".story-pinned-container",
            anticipatePin: 1,
          });

          const storySteps = gsap.utils.toArray<HTMLDivElement>(".story-step");
          storySteps.forEach((step, index) => {
            ScrollTrigger.create({
              trigger: step,
              start: "top center",
              end: "bottom center",
              onEnter: () => setActiveIndex(index),
              onEnterBack: () => setActiveIndex(index),
              toggleClass: { targets: step, className: "is-active" },
            });
          });
        }

        // 4. CTA Section Animation
        if (ctaSectionRef.current) {
          gsap.from(ctaSectionRef.current, {
            opacity: 0,
            scale: 0.9,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 90%",
            },
          });
        }
      });
      // Cleanup function
      return () => ctx.revert();
    }
  }, [status]);

  // Effect to animate the pinned content when activeIndex changes
  useEffect(() => {
    if (pinnedContentRef.current) {
      gsap.fromTo(
        pinnedContentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [activeIndex]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (status === "authenticated") return null;

  const { Icon, title, description } = storyContent[activeIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillSwap</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            ref={heroTitleRef}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Exchange Skills,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">
              Build Knowledge
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with a global community to swap skills, learn new expertise,
            and grow together. Your knowledge is valuable—share it and discover
            something new.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 transition-transform duration-300 hover:scale-105"
              >
                Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 transition-transform duration-300 hover:scale-105"
              >
                Browse Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={statsSectionRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { label: "Active Users", value: "10K+", Icon: Users },
              { label: "Skills Available", value: "500+", Icon: Trophy },
              { label: "Successful Swaps", value: "25K+", Icon: MessageSquare },
            ].map(({ label, value, Icon }, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {value}
                </div>
                <div className="text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How SkillSwap Works - Storytelling Section */}
      <section ref={storySectionRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="story-pinned-container h-screen flex flex-col justify-center">
            <div
              key={activeIndex}
              ref={pinnedContentRef}
              className="text-left max-w-md"
            >
              <div className="mb-6 w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Icon className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
              <p className="text-xl text-gray-600">{description}</p>
            </div>
          </div>
          <div className="story-steps-container">
            {storyContent.map((feature, index) => (
              <div
                key={index}
                className="story-step min-h-screen flex items-center transition-all duration-300 opacity-40"
              >
                <Card className="border-0 shadow-lg w-full bg-white">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaSectionRef}
        className="py-20 bg-gradient-to-r from-purple-600 to-purple-800"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of learners and experts sharing knowledge every day.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 transition-transform duration-300 hover:scale-105"
            >
              Join the Community <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SS</span>
                </div>
                <span className="text-xl font-bold">SkillSwap</span>
              </div>
              <p className="text-gray-400">
                Building bridges between learners and experts worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SkillSwap Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
