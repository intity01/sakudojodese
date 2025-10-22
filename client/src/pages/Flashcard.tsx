import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, BookOpen, Home as HomeIcon, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { allLessons } from "@/data/lessons";

export default function Flashcard() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const allVocabulary = allLessons.flatMap((lesson) => lesson.vocabulary);
  const currentCard = allVocabulary[currentIndex];
  const progress = allVocabulary.length > 0 ? Math.round(((currentIndex + 1) / allVocabulary.length) * 100) : 0;

  const handleNext = () => {
    if (currentIndex < allVocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No flashcards available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-purple-900 pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation("/courses")}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Flashcards</h1>
          <div className="w-10 h-10" />
        </div>

        <div className="mt-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Card {currentIndex + 1} of {allVocabulary.length}</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{width: `${progress}%`}}
            />
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <Card 
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-80 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 cursor-pointer"
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">{isFlipped ? "BACK" : "FRONT"}</p>
            {!isFlipped ? (
              <>
                <h2 className="text-5xl font-bold mb-4">{currentCard.word}</h2>
                <p className="text-2xl text-muted-foreground">{currentCard.meaning}</p>
                <button className="mt-6 w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto">
                  <Volume2 className="w-6 h-6 text-white" />
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-4">{currentCard.meaning}</h2>
                {currentCard.example && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">Example:</p>
                    <p className="text-lg italic">{currentCard.example}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <p className="absolute bottom-6 text-sm text-muted-foreground">Click to flip</p>
        </Card>
      </div>

      <div className="px-6 flex gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1 h-14 bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 disabled:opacity-50"
        >
          ← Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === allVocabulary.length - 1}
          className="flex-1 h-14 bg-white text-primary hover:bg-white/90 disabled:opacity-50"
        >
          Next →
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex items-center justify-around py-3 px-6">
          <button onClick={() => setLocation("/")} className="flex flex-col items-center gap-1 text-muted-foreground">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => setLocation("/courses")} className="flex flex-col items-center gap-1 text-muted-foreground">
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
