import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CourseDetail from "./pages/CourseDetail";
import Flashcard from "./pages/Flashcard";
import Courses from "./pages/Courses";
import LessonDetail from "./pages/LessonDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/course/:id"} component={CourseDetail} />
      <Route path={"/courses"} component={Courses} />
      <Route path={"/lesson/:id"} component={LessonDetail} />
      <Route path={"/flashcard"} component={Flashcard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
