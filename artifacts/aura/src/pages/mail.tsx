import { useState } from "react";
import { useGetMails, useGenerateReplyDraft } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail as MailIcon, Reply, Sparkles, Send, Inbox, ShieldAlert, Star, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Mail() {
  const { data: mails, isLoading } = useGetMails();
  const [selectedMail, setSelectedMail] = useState<any | null>(null);

  return (
    <PageTransition className="p-4 sm:p-8 max-w-5xl mx-auto h-full flex flex-col pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-md">
          <Inbox className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Smart Inbox</h1>
          <p className="text-muted-foreground mt-1 font-medium">AI-sorted priorities & summaries</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {mails?.map((mail, idx) => (
              <motion.div
                key={mail.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MailCard mail={mail} onClick={() => setSelectedMail(mail)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!selectedMail} onOpenChange={(open) => !open && setSelectedMail(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-0 border-0 shadow-2xl overflow-hidden bg-white">
          {selectedMail && <MailDetail mail={selectedMail} onClose={() => setSelectedMail(null)} />}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

function MailCard({ mail, onClick }: { mail: any, onClick: () => void }) {
  const priorityConfig = {
    urgent: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    important: { icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    reference: { icon: Paperclip, color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" },
    spam: { icon: MailIcon, color: "text-zinc-500", bg: "bg-zinc-100", border: "border-zinc-200" },
  };

  const pConfig = priorityConfig[mail.priority as keyof typeof priorityConfig];
  const Icon = pConfig.icon;

  return (
    <Card 
      className={`rounded-3xl border ${pConfig.border} shadow-subtle hover-elevate cursor-pointer group bg-white transition-all`}
      onClick={onClick}
    >
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
        {/* Left Status Area */}
        <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0 sm:w-48 shrink-0">
          <div className="flex items-center gap-3 w-full">
            <div className={`p-2.5 rounded-xl ${pConfig.bg} ${pConfig.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="font-bold text-base truncate pr-4">{mail.sender}</p>
              <p className="text-xs font-semibold text-muted-foreground truncate">{new Date(mail.receivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          {!mail.isRead && (
            <div className="w-2.5 h-2.5 bg-primary rounded-full sm:mt-4 ml-auto sm:ml-4 shrink-0" />
          )}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-lg mb-2 truncate group-hover:text-primary transition-colors">
            {mail.subject}
          </h4>
          
          {/* AI Summary Block */}
          <div className="bg-secondary/40 rounded-2xl p-4 border border-border/50 relative">
            <Sparkles className="w-4 h-4 text-primary absolute top-4 right-4 opacity-50" />
            <p className="text-sm font-medium text-foreground/80 leading-relaxed pr-8 line-clamp-2">
              {mail.summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MailDetail({ mail, onClose }: { mail: any, onClose: () => void }) {
  const [tone, setTone] = useState("formal");
  const { mutate: generateReply, data: draft, isPending } = useGenerateReplyDraft({
    mutation: {
      onSuccess: () => {
        // Automatically scroll down or show toast if needed
      }
    }
  });

  return (
    <div className="flex flex-col max-h-[85vh]">
      <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{mail.priority} Priority</span>
          <span className="text-sm font-semibold text-muted-foreground">{new Date(mail.receivedAt).toLocaleString()}</span>
        </div>
        <DialogTitle className="text-2xl font-display font-bold leading-tight">{mail.subject}</DialogTitle>
        <p className="text-base font-medium mt-2 flex items-center gap-2">
          <span className="bg-secondary px-2 py-1 rounded-md text-sm">{mail.senderEmail}</span>
        </p>
      </DialogHeader>
      
      <div className="p-6 overflow-y-auto space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Summary
          </h3>
          <p className="text-base leading-relaxed font-medium bg-secondary/30 p-4 rounded-2xl border border-border/50">
            {mail.summary}
          </p>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Original Message Preview</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {mail.preview}...
          </p>
        </div>

        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 mt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Reply className="w-5 h-5 text-primary" /> Generate Smart Reply
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-[180px] bg-white rounded-xl h-11 font-semibold">
                <SelectValue placeholder="Select Tone" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="formal">Formal & Professional</SelectItem>
                <SelectItem value="friendly">Warm & Friendly</SelectItem>
                <SelectItem value="brief">Short & Direct</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => generateReply({ id: mail.id, data: { tone: tone as any } })}
              disabled={isPending}
              className="rounded-xl h-11 px-6 shadow-md"
            >
              {isPending ? "Generating..." : "Draft Reply"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <AnimatePresence>
            {draft && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-4 border-t border-primary/10"
              >
                <Textarea 
                  defaultValue={draft.body} 
                  className="min-h-[150px] bg-white rounded-2xl resize-none text-base p-4 font-medium border-border/50 focus-visible:ring-primary/20"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={onClose} className="rounded-xl font-semibold">Cancel</Button>
                  <Button className="rounded-xl px-8 shadow-md active-elevate-2 font-bold">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
