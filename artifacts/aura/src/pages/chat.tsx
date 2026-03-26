import { useState, useRef, useEffect } from "react";
import { useGetChatHistory, useSendChatMessage } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User, CheckSquare, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { getGetChatHistoryQueryKey } from "@workspace/api-client-react";

export default function Chat() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { data: history, isLoading } = useGetChatHistory();
  const { mutate: sendMessage, isPending } = useSendChatMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatHistoryQueryKey() });
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isPending]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isPending) return;
    sendMessage({ data: { message: input } });
    setInput("");
  };

  const handleQuickAction = (action: string) => {
    sendMessage({ data: { message: action, context: "quick_action" } });
  };

  return (
    <PageTransition className="max-w-4xl mx-auto h-[calc(100vh-theme(spacing.16))] sm:h-[calc(100vh-2rem)] flex flex-col pt-4 sm:pt-8 pb-4 px-4 sm:px-0 relative">
      
      {/* Abstract Background Element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">AURA Chat</h1>
          <p className="text-sm font-semibold text-muted-foreground">Always here to assist</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white/50 backdrop-blur-md rounded-3xl border border-border/40 shadow-subtle flex flex-col overflow-hidden">
        
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground font-medium">
              Loading history...
            </div>
          ) : history?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-primary opacity-50" />
              </div>
              <h2 className="text-xl font-bold">How can I help today?</h2>
              <p className="text-muted-foreground font-medium max-w-sm">
                Ask me to check your schedule, summarize your emails, or manage your tasks.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                <Button variant="outline" className="rounded-xl font-semibold bg-white" onClick={() => handleQuickAction("What's my briefing for today?")}>
                  Briefing for today
                </Button>
                <Button variant="outline" className="rounded-xl font-semibold bg-white" onClick={() => handleQuickAction("Summarize urgent mails")}>
                  <Mail className="w-4 h-4 mr-2" /> Urgent Mails
                </Button>
                <Button variant="outline" className="rounded-xl font-semibold bg-white" onClick={() => handleQuickAction("Show my tasks")}>
                  <CheckSquare className="w-4 h-4 mr-2" /> My Tasks
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history?.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3 w-full`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-auto">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-2xl p-4 sm:p-5 text-[15px] leading-relaxed font-medium ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-sm shadow-md' 
                      : 'bg-white border border-border/40 text-foreground rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.message}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-auto overflow-hidden">
                       <img src={`${import.meta.env.BASE_URL}images/avatar-default.png`} className="w-full h-full object-cover" alt="User" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-3 w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-auto">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="max-w-[80%] bg-white border border-border/40 rounded-2xl rounded-bl-sm p-5 shadow-sm flex gap-1 items-center">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white/50 border-t border-border/40">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AURA anything..."
              className="w-full h-14 pl-6 pr-14 rounded-full bg-white shadow-subtle border-transparent focus-visible:ring-primary/20 text-base font-medium"
              disabled={isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isPending}
              className="absolute right-2 h-10 w-10 rounded-full shadow-md active-elevate-2 transition-transform"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

      </div>
    </PageTransition>
  );
}
