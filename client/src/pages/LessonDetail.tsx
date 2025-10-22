import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Home as HomeIcon, MessageCircle, Play } from "lucide-react";
import { allLessons } from "@/data/lessons";

export default function LessonDetail() {
  const [, params] = useRoute("/lesson/:id");
  const [, setLocation] = useLocation();
  const lessonId = params?.id;
  const lesson = allLessons.find((l) => l.id === lessonId);
  const [currentTab, setCurrentTab] = useState<"vocabulary" | "quiz">("vocabulary");

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-purple-900 pb-20">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation("/courses")}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="text-white mb-6">
          <p className="text-sm opacity-80 mb-2">{lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}</p>
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <p className="opacity-90">{lesson.description}</p>
        </div>

        {/* Illustration Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl h-48 flex items-center justify-center mb-6">
          <div className="text-center text-white">
            <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-80">Lesson Illustration</p>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-t-3xl min-h-[50vh] p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setCurrentTab("vocabulary")}
            className={`pb-3 px-4 font-medium transition-colors ${
              currentTab === "vocabulary"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            Vocabulary ({lesson.vocabulary.length})
          </button>
          <button
            onClick={() => setCurrentTab("quiz")}
            className={`pb-3 px-4 font-medium transition-colors ${
              currentTab === "quiz"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            Quiz ({lesson.quiz.length})
          </button>
        </div>

        {/* Vocabulary Tab */}
        {currentTab === "vocabulary" && (
          <div className="space-y-4">
            {lesson.vocabulary.map((vocab, index) => (
              <Card key={index} className="p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{vocab.word}</h3>
                    <p className="text-muted-foreground mb-2">{vocab.meaning}</p>
                    {vocab.example && (
                      <p className="text-sm italic text-muted-foreground">
                        Example: {vocab.example}
                      </p>
                    )}
                  </div>
                  <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-white" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quiz Tab */}
        {currentTab === "quiz" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-primary mb-2">Ready to test your knowledge?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete the quiz to earn points and track your progress
              </p>
              <Button 
                onClick={() => setLocation(`/quiz/${lesson.id}`)}
                className="w-full bg-primary text-white"
              >
                Start Quiz
              </Button>
            </div>

            {lesson.quiz && lesson.quiz.map((q, index) => (
              <Card key={index} className="p-4 border border-border">
                <p className="font-medium mb-3">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options?.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
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
            onClick={() => setLocation("/courses")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Courses</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
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
