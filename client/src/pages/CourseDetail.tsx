import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share2, User } from "lucide-react";
import { useLocation } from "wouter";

export default function CourseDetail() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <span className="text-sm opacity-80">Introduce</span>
          <h1 className="text-3xl font-bold mt-1">Basic what is PHP?</h1>
        </div>

        {/* Illustration Card */}
        <Card className="bg-white/10 border-0 backdrop-blur-sm p-8 rounded-3xl mb-6">
          <div className="flex items-center justify-center">
            {/* Illustration placeholder */}
            <div className="w-48 h-48 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-24 h-24 text-white/40" />
            </div>
          </div>
        </Card>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="w-1 h-1 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-t-3xl p-6 min-h-[40vh]">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Introduce
          </span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">Basic training</h2>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          Hypertext Preprocessor is a scripting language that can be embedded or integrated into HTML.
        </p>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Get started
        </Button>
      </div>
    </div>
  );
}

