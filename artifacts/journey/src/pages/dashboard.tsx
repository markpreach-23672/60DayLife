import { useGetProgressSummary, useGetNextLesson } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Flame, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetProgressSummary();
  const { data: nextLesson, isLoading: loadingLesson } = useGetNextLesson();

  if (loadingSummary || loadingLesson) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl md:col-span-2" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!summary || !nextLesson) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Your Journey</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {summary.isComplete ? "You have completed the 60-day journey!" : "Continue building your foundation."}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-sm font-semibold text-secondary tracking-widest uppercase">
                {summary.isComplete ? "Journey Complete" : `Phase ${nextLesson.phase}: ${nextLesson.phaseName}`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1">
                {summary.isComplete ? "Congratulations!" : `Day ${nextLesson.day}: ${nextLesson.title}`}
              </h2>
            </div>
          </div>
          
          {!summary.isComplete && (
            <Button size="lg" className="w-full sm:w-auto self-start rounded-full h-14 px-8 text-lg" asChild>
              <Link href={`/lesson/${nextLesson.day}`}>
                Start Today's Lesson <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          )}
          {summary.isComplete && (
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-lg font-medium">All 60 days completed</span>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col">
          <h3 className="font-serif font-bold text-lg mb-6">Progress</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>{summary.totalCompleted} of 60 Days</span>
                <span className="text-primary">{Math.round(summary.percentComplete)}%</span>
              </div>
              <Progress value={summary.percentComplete} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex flex-col items-center text-center p-3 bg-background rounded-xl border border-border/40">
                <Flame className="w-6 h-6 text-orange-500 mb-2" />
                <span className="text-2xl font-bold">{summary.currentStreak}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Day Streak</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-background rounded-xl border border-border/40">
                <Trophy className="w-6 h-6 text-secondary mb-2" />
                <span className="text-2xl font-bold">{summary.longestStreak}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Best Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-serif font-bold text-2xl mb-6">Phase Overview</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.phaseBreakdown.map((phase) => (
            <div key={phase.phase} className="bg-card rounded-xl p-5 border border-border/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                <div className="h-full bg-primary" style={{ width: `${phase.percentComplete}%` }} />
              </div>
              <div className="text-sm font-semibold text-secondary tracking-widest uppercase mb-1">Phase {phase.phase}</div>
              <h4 className="font-serif font-bold text-lg mb-4">{phase.phaseName}</h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {phase.completedDays}/{phase.totalDays}</span>
                <span>{Math.round(phase.percentComplete)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}