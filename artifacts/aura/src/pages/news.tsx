import { useState } from "react";
import { useGetNews } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Newspaper, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "Technology", "Business", "Science", "Design"];

export default function News() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: news, isLoading } = useGetNews(
    activeCategory !== "All" ? { category: activeCategory } : undefined
  );

  return (
    <PageTransition className="p-4 sm:p-8 max-w-7xl mx-auto h-full pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight mb-2">Insights & News</h1>
          <p className="text-muted-foreground font-medium text-lg">Curated intelligence for your day.</p>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto no-scrollbar mask-edges">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "secondary"}
              className={`rounded-full px-6 font-bold tracking-wide ${activeCategory !== cat && 'hover:bg-secondary/80'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="w-full h-72 rounded-3xl break-inside-avoid" />
          ))}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {news?.map((article, idx) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="break-inside-avoid"
              >
                <Card className="rounded-3xl border-0 shadow-subtle hover-elevate bg-white overflow-hidden group cursor-pointer">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {article.source}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}m
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">
                      {article.summary}
                    </p>

                    {article.insight && (
                      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mt-auto">
                        <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> AURA Insight
                        </p>
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                          {article.insight}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageTransition>
  );
}
