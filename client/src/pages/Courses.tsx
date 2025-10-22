import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Home as HomeIcon, MessageCircle, User, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { allLessons } from "@/data/lessons";

export default function Courses() {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'english' | 'japanese'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [activeTab, setActiveTab] = useState("courses");

  const filteredLessons = allLessons.filter((lesson) => {
    const languageMatch = selectedLanguage === 'all' || lesson.language === selectedLanguage;
    const levelMatch = selectedLevel === 'all' || lesson.level === selectedLevel;
    return languageMatch && levelMatch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">All Courses</h1>
          <div className="w-10 h-10" />
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search courses..."
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
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLanguage === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedLanguage('english')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLanguage === 'english'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => setSelectedLanguage('japanese')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLanguage === 'japanese'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            🇯🇵 Japanese
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLevel === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            All Levels
          </button>
          <button
            onClick={() => setSelectedLevel('beginner')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLevel === 'beginner'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setSelectedLevel('intermediate')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLevel === 'intermediate'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setSelectedLevel('advanced')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedLevel === 'advanced'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredLessons.map((lesson) => (
            <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
              <Card className="bg-white border border-border p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-2xl">
                    {lesson.language === 'english' ? '🇺🇸' : '🇯🇵'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lesson.level === 'beginner'
                          ? 'bg-green-100 text-green-800'
                          : lesson.level === 'intermediate'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📚 {lesson.vocabulary.length} words</span>
                      <span>❓ {lesson.quiz.length} questions</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex items-center justify-around py-3 px-6">
          <button
            onClick={() => setLocation("/")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Courses</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
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

