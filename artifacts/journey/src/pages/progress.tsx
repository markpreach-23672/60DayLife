import { useGetProgress, useGetLessons } from "@workspace/api-client-react";
import { CheckCircle2, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Progress() {
  const { data: progress, isLoading: loadingProgress } = useGetProgress();
  const { data: lessons, isLoading: loadingLessons } = useGetLessons();

  if (loadingProgress || loadingLessons) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({length: 15}).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!progress || !lessons) return null;

  const completedDays = new Set(progress.map(p => p.day));
  const maxCompleted = Math.max(0, ...Array.from(completedDays));
  
  // Group lessons by phase
  const phases = [1, 2, 3, 4].map(phaseNum => ({
    phaseNum,
    name: lessons.find(l => l.phase === phaseNum)?.phaseName || `Phase ${phaseNum}`,
    lessons: lessons.filter(l => l.phase === phaseNum)
  }));

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <header className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground">Journey Map</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your path through the 60 days.
        </p>
      </header>

      <div className="space-y-16">
        {phases.map((phase) => (
          <section key={phase.phaseNum}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20 text-secondary font-bold font-serif">
                {phase.phaseNum}
              </div>
              <h2 className="text-2xl font-serif font-bold">{phase.name}</h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {phase.lessons.map(lesson => {
                const isComplete = completedDays.has(lesson.day);
                const isAvailable = lesson.day <= maxCompleted + 1; // Can do today or previous

                if (isComplete) {
                  return (
                    <Link key={lesson.day} href={`/lesson/${lesson.day}`} className="group aspect-square rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center p-2 shadow-sm transition-transform hover:scale-105 border-2 border-primary">
                      <CheckCircle2 className="w-6 h-6 mb-1 opacity-80" />
                      <span className="font-bold text-lg leading-none">{lesson.day}</span>
                    </Link>
                  );
                }

                if (isAvailable) {
                  return (
                    <Link key={lesson.day} href={`/lesson/${lesson.day}`} className="group aspect-square rounded-2xl bg-card hover:bg-muted border-2 border-primary/20 flex flex-col items-center justify-center p-2 shadow-sm transition-colors cursor-pointer">
                      <span className="font-bold text-2xl text-primary leading-none mb-1">{lesson.day}</span>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Today</span>
                    </Link>
                  );
                }

                return (
                  <div key={lesson.day} className="aspect-square rounded-2xl bg-muted/50 border-2 border-transparent flex flex-col items-center justify-center p-2 text-muted-foreground/50">
                    <Lock className="w-5 h-5 mb-1 opacity-50" />
                    <span className="font-bold text-lg leading-none">{lesson.day}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}