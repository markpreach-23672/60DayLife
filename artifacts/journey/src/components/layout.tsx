import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { LogOut, Home, Calendar, ShieldCheck } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: user } = useGetMe();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Elkhart Life" className="h-8 w-8" />
            <span className="font-serif font-semibold text-lg hidden sm:inline">60-Day Journey</span>
          </Link>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link href="/dashboard" className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Today</span>
            </Link>
            <Link href="/progress" className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/progress' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </Link>
            {user?.isAdmin && (
              <Link href="/admin" className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <button onClick={() => signOut()} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}