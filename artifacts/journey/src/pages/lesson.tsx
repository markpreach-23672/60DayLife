import { useGetLesson, useMarkDayComplete, useGetProgress, getGetProgressSummaryQueryKey, getGetProgressQueryKey, getGetNextLessonQueryKey } from "@workspace/api-client-react";
import { useRoute, useLocation, Link } from "wouter";
import { CheckCircle2, ChevronLeft, BookOpen, Brain, Target, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Lesson() {
  const [, params] = useRoute("/lesson/:day");
  const day = Number(params?.day);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lesson, isLoading: loadingLesson } = useGetLesson(day, {
    query: { enabled: !!day, queryKey: [`/api/lessons/${day}`] }
  });
  
  const { data: progress } = useGetProgress();
  const isCompleted = progress?.some(p => p.day === day);

  const markComplete = useMarkDayComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProgressSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetNextLessonQueryKey() });
        toast({ title: "Day completed!", description: "Great job taking time for God today." });
        setLocation("/dashboard");
      }
    }
  });

  if (loadingLesson) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lesson) return <div className="text-center py-20 text-muted-foreground">Lesson not found</div>;

  return (
    <article className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <header className="mb-12">
        <div className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3">
          Phase {lesson.phase}: {lesson.phaseName}
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
          Day {lesson.day}: {lesson.title}
        </h1>
        
        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-2xl">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3">
            <BookOpen className="w-5 h-5" />
            <span>{lesson.scriptureRef}</span>
          </div>
          <p className="text-xl font-serif leading-relaxed text-foreground italic">
            "{lesson.scriptureText}"
          </p>
        </div>
      </header>

      <div className="prose prose-lg prose-slate max-w-none text-foreground mb-16">
        {lesson.lessonText.split('\n\n').map((paragraph, i) => (
          <p key={i} className="leading-relaxed mb-6">{paragraph}</p>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 font-serif font-bold text-lg mb-3">
            <Brain className="w-5 h-5 text-secondary" /> Memory Hack
          </div>
          <p className="text-muted-foreground">{lesson.memoryHack}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 font-serif font-bold text-lg mb-3">
            <Target className="w-5 h-5 text-secondary" /> Today's Challenge
          </div>
          <p className="text-muted-foreground">{lesson.challenge}</p>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground rounded-2xl p-8 sm:p-10 text-center mb-12 shadow-lg">
        <HeartHandshake className="w-10 h-10 mx-auto mb-4 opacity-80" />
        <h3 className="font-serif font-bold text-2xl mb-4">Prayer Starter</h3>
        <p className="text-lg italic opacity-90 mb-0 max-w-xl mx-auto">
          "{lesson.prayerStarter}"
        </p>
      </div>

      <div className="flex justify-center border-t pt-10">
        {isCompleted ? (
          <div className="flex flex-col items-center text-primary">
            <CheckCircle2 className="w-12 h-12 mb-3" />
            <span className="font-bold text-lg">You've completed this day</span>
            <Button variant="link" asChild className="mt-2 text-muted-foreground">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <Button 
            size="lg" 
            className="rounded-full h-16 px-10 text-lg shadow-md"
            onClick={() => markComplete.mutate({ data: { day } })}
            disabled={markComplete.isPending}
          >
            {markComplete.isPending ? "Saving..." : "Mark Day Complete"}
          </Button>
        )}
      </div>
    </article>
  );
}