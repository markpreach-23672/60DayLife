import { Link } from "wouter";
import { ArrowRight, BookOpen, Compass, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const phases = [
    { title: "Who Is God?", days: "Days 1-15", icon: <Compass className="w-6 h-6 text-secondary" />, desc: "Discover the character, love, and power of God." },
    { title: "The Bible", days: "Days 16-30", icon: <BookOpen className="w-6 h-6 text-secondary" />, desc: "Learn how to read, understand, and apply Scripture." },
    { title: "Living It Out", days: "Days 31-45", icon: <Heart className="w-6 h-6 text-secondary" />, desc: "Put your faith into practice in your daily life." },
    { title: "Growing Forward", days: "Days 46-60", icon: <TrendingUp className="w-6 h-6 text-secondary" />, desc: "Build habits for a lifetime of spiritual growth." },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="px-6 py-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Elkhart Life" className="h-10 w-10" />
          <span className="font-serif font-semibold text-primary text-xl tracking-tight">Elkhart Life Church</span>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2">
            Sign In
          </Link>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/sign-up">Start the Journey</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8">
            A 60-Day Devotional Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight tracking-tight mb-6">
            Grow deeper in <br/>
            <span className="text-primary italic font-normal">your faith.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Join the Elkhart Life Church family for a 60-day guided journey. Ten minutes a day to discover God, understand the Bible, and build a foundation that lasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="text-lg px-8 rounded-full h-14" asChild>
              <Link href="/sign-up">
                Begin Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-card py-24 px-6 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Four Phases of Growth</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A structured path designed specifically for new and growing believers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {phases.map((phase, i) => (
                <div key={i} className="bg-background rounded-2xl p-8 shadow-sm border border-border/40 flex flex-col items-center text-center">
                  <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-border/50">
                    {phase.icon}
                  </div>
                  <div className="text-sm font-semibold text-secondary tracking-widest uppercase mb-2">{phase.days}</div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">{phase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t bg-background text-center text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Elkhart Life" className="h-8 w-8 mb-6 opacity-50 grayscale" />
          <p>© {new Date().getFullYear()} Elkhart Life Church. All rights reserved.</p>
          <p className="text-sm mt-2">1135 Middlebury St, Elkhart, IN 46516</p>
        </div>
      </footer>
    </div>
  );
}