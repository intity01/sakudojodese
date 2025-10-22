import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, GraduationCap, Home as HomeIcon, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Hi,</p>
            <h1 className="text-2xl font-bold">Kathryn</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 bg-muted border-0"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Get Started Card */}
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-0 p-6 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">
                What would you
                <br />
                like to learn
                <br />
                today?
              </h2>
              <Button size="sm" className="bg-white text-primary hover:bg-white/90 mt-2">
                Get started
              </Button>
            </div>
            <div className="w-24 h-24 flex items-center justify-center">
              <GraduationCap className="w-20 h-20 text-primary" />
            </div>
          </div>
        </Card>

        {/* For You Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">For you</h3>
            <Link href="/courses">
              <a className="text-sm text-primary">See all</a>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Course Card 1 */}
            <Link href="/course/php-basics">
            <Card className="bg-accent border-0 p-4 text-accent-foreground cursor-pointer hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Introduce</span>
                <h4 className="font-semibold text-sm leading-tight">
                  Basic what is PHP?
                </h4>
                <p className="text-xs opacity-80">
                  PHP is widely used program for dynamic websites.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs">30 min</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
            </Link>

            {/* Join Class Card */}
            <Card className="bg-white border border-border p-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Join your class</h4>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary" />
                  <div className="w-6 h-6 rounded-full bg-accent" />
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    +12
                  </div>
                </div>
              </div>
            </Card>

            {/* Article Card */}
            <Card className="bg-white border border-border p-4 col-span-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Article</span>
                <h4 className="font-semibold text-sm">Tips for better teamwork</h4>
              </div>
            </Card>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex items-center justify-around py-3 px-6">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => window.location.href="/courses"}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "courses" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Courses</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "chat" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "menu" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

