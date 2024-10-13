"use client";
import Typewriter from "typewriter-effect";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Leaf,
  Users,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sun,
  Sprout,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 lg:py-32 bg-gradient-to-b from-green-50 to-green-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <Leaf className="h-16 w-16 text-green-600 animate-bounce" />
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-6xl/none text-green-800">
                  <Typewriter
                    options={{
                      strings: ["Support Farmers", "Shape The Future"],
                      autoStart: true,
                      loop: true,
                    }}
                  />
                  
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl lg:text-2xl">
                  Connect with farmers through our lending platform, for
                  transparent and secure transaction. We make decentralized
                  finance simple and accessible for everyone, everywhere to
                  bring a billion people onchain, creating a global economy that
                  drives innovation and freedom. Powered by Base
                  <span className="inline-flex items-baseline">
                    <Image
                      src="/base.svg"
                      alt="Base"
                      className="self-center w-4 h-4 rounded-full mx-1 sm:w-5 sm:h-5 md:w-5 md:h-5"
                    />
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-lg h-12 px-6"
                  >
                    Start Investing <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-16">
              Why Choose <span className="text-green-600">AgroFund</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Direct Connection</h3>
                  <p className="text-gray-600">
                    Connect investors directly with farmers who need capital for
                    their crops.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <TrendingUp className="h-12 w-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">
                    Yield-Based Returns
                  </h3>
                  <p className="text-gray-600">
                    Earn investment returns based on successful harvests from
                    our partner farmers.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <ShieldCheck className="h-12 w-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Secure Investment</h3>
                  <p className="text-gray-600">
                    Transparent and secure system to protect both investors and
                    farmers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-16">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Users,
                  title: "Connect Your Wallet",
                  description:
                    "Connect your wallet use Smartwallet Powered by Coinbase to easily connect",
                },
                {
                  icon: Sprout,
                  title: "Choose Projects",
                  description:
                    "Browse and select agricultural projects to fund",
                },
                {
                  icon: DollarSign,
                  title: "Invest",
                  description:
                    "Make your investment and track project progress",
                },
                {
                  icon: Sun,
                  title: "Receive Returns",
                  description: "Earn returns when the harvest is successful",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-16">
              Success Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "AgroFund helped me secure the capital I needed to improve my harvest. Thank you!",
                  author: "Udin Kurniawan",
                  role: "Rice Farmer",
                },
                {
                  quote:
                    "An investment thats both profitable and socially impactful. Proud to support local farmers.",
                  author: "Salim Maulana",
                  role: "Investor",
                },
                {
                  quote:
                    "User-friendly platform with full transparency. I can easily track my investments.",
                  author: "Sarah Nilam",
                  role: "Investor",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-green-50">
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 italic">
                      {testimonial.quote}
                    </p>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-green-600">{testimonial.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 lg:py-32 bg-green-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Help Farmers?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl">
                  Join now and start investing in the future of agriculture.
                </p>
              </div>
              <div className="w-full max-w-md space-y-4">
                <Link href="/projects">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 h-12 px-8"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
