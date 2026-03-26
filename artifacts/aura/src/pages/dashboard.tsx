import { useGetBriefing } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { 
  CloudSun, 
  Calendar, 
  CheckCircle2, 
  MailWarning, 
  ArrowRight,
  TrendingUp,
  Lightbulb,
  CheckSquare,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: briefing, isLoading, isError } = useGetBriefing();

  if (isLoading) {
    return (
      <PageTransition className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </PageTransition>
    );
  }

  if (isError || !briefing) {
    return (
      <PageTransition className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Failed to load briefing</h2>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageTransition>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PageTransition className="p-4 sm:p-8 max-w-7xl mx-auto pb-24">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden bg-white shadow-subtle border border-border/40 p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">
              {format(new Date(briefing.date), "yyyy년 M월 d일 EEEE", { locale: ko })}
            </p>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-foreground tracking-tight mb-4">
              {briefing.greeting}
            </h1>
            <div className="flex items-center gap-3 text-lg font-medium text-foreground/80 bg-secondary/50 w-fit px-4 py-2 rounded-2xl">
              <CloudSun className="w-6 h-6 text-orange-500" />
              <span>{briefing.weather.temp}°C, {briefing.weather.condition}</span>
              <span className="text-muted-foreground ml-2 hidden sm:inline">· {briefing.weather.recommendation}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard 
            title="Schedules Today" 
            value={briefing.scheduleCount} 
            icon={<Calendar className="w-5 h-5 text-blue-500" />} 
            link="/reminders"
          />
          <MetricCard 
            title="Tasks Due" 
            value={briefing.tasksDueToday} 
            subtitle={briefing.tasksOverdue > 0 ? `${briefing.tasksOverdue} overdue` : undefined}
            subtitleColor="text-destructive"
            icon={<CheckSquare className="w-5 h-5 text-emerald-500" />} 
            link="/tasks"
          />
          <MetricCard 
            title="Urgent Mails" 
            value={briefing.urgentMailCount} 
            icon={<MailWarning className="w-5 h-5 text-red-500" />} 
            link="/mail"
          />
          <MetricCard 
            title="Pending Follow-ups" 
            value={briefing.pendingFollowUps} 
            icon={<CheckCircle2 className="w-5 h-5 text-amber-500" />} 
            link="/tasks"
          />
        </motion.div>

        {/* Deep Dive Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* AI Insight */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AURA Insight
            </h3>
            <Card className="rounded-3xl border-0 shadow-subtle overflow-hidden relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
              <CardContent className="p-8 relative z-10">
                <Lightbulb className="w-8 h-8 text-yellow-300 mb-6" />
                <p className="text-lg font-medium leading-relaxed mb-8">
                  "{briefing.insight}"
                </p>
                <Link href="/chat">
                  <Button variant="secondary" className="w-full rounded-xl h-12 font-semibold shadow-md active-elevate-2 hover-elevate">
                    Discuss with AURA
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Top News */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top News
              </h3>
              <Link href="/news" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {briefing.topNews.map((news) => (
                <Link key={news.id} href="/news">
                  <Card className="rounded-2xl border-0 shadow-subtle hover-elevate cursor-pointer group bg-white">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center text-xs font-semibold text-muted-foreground mb-2">
                          <span className="bg-secondary px-2 py-1 rounded-md">{news.category}</span>
                          <span>{news.source}</span>
                          <span>·</span>
                          <span>{news.readTime} min read</span>
                        </div>
                        <h4 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">
                          {news.title}
                        </h4>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  subtitleColor = "text-muted-foreground",
  icon, 
  link 
}: { 
  title: string; 
  value: number; 
  subtitle?: string;
  subtitleColor?: string;
  icon: React.ReactNode; 
  link: string; 
}) {
  return (
    <Link href={link}>
      <Card className="rounded-3xl border-0 shadow-subtle hover-elevate cursor-pointer h-full bg-white relative overflow-hidden group">
        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary rounded-2xl group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-display font-extrabold mb-1">{value}</h4>
            <p className="text-sm font-semibold text-muted-foreground">{title}</p>
            {subtitle && (
              <p className={`text-xs mt-2 font-medium ${subtitleColor}`}>{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
