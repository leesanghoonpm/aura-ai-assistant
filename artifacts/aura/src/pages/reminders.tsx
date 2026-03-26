import { useState } from "react";
import { useGetReminders, useCreateReminder } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, MapPin, Users, Clock, Plus, CheckCircle2, Circle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRemindersQueryKey } from "@workspace/api-client-react";

const reminderSchema = z.object({
  title: z.string().min(1, "Title required"),
  type: z.enum(["time", "location", "habit", "person"]),
  scheduledAt: z.string().optional(),
});

type FormValues = z.infer<typeof reminderSchema>;

export default function Reminders() {
  const { data: reminders, isLoading } = useGetReminders();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PageTransition className="p-4 sm:p-8 max-w-6xl mx-auto h-full pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Smart Reminders</h1>
          <p className="text-muted-foreground mt-1 font-medium">Context-aware alerts</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 px-6 shadow-md hover-elevate active-elevate-2 font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl p-6 border-0 shadow-xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold">New Reminder</DialogTitle>
            </DialogHeader>
            <CreateReminderForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders?.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </PageTransition>
  );
}

function ReminderCard({ reminder }: { reminder: any }) {
  const iconMap = {
    time: <Clock className="w-5 h-5 text-blue-500" />,
    location: <MapPin className="w-5 h-5 text-emerald-500" />,
    habit: <Bell className="w-5 h-5 text-orange-500" />,
    person: <Users className="w-5 h-5 text-purple-500" />
  };

  return (
    <Card className={`rounded-3xl border-0 shadow-subtle hover-elevate bg-white transition-all ${reminder.isCompleted ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-secondary rounded-2xl">
            {iconMap[reminder.type as keyof typeof iconMap]}
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            {reminder.isCompleted ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6" />}
          </button>
        </div>
        
        <h3 className={`text-xl font-bold mb-2 ${reminder.isCompleted ? 'line-through' : ''}`}>
          {reminder.title}
        </h3>
        
        <div className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
          {reminder.scheduledAt && (
            <span className="flex items-center gap-2 bg-secondary/50 w-fit px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" /> 
              {new Date(reminder.scheduledAt).toLocaleString([], {weekday: 'short', hour: '2-digit', minute:'2-digit'})}
            </span>
          )}
          {reminder.relatedPerson && (
            <span className="flex items-center gap-2 bg-secondary/50 w-fit px-2 py-1 rounded-md">
              <Users className="w-3.5 h-3.5" /> 
              When meeting {reminder.relatedPerson}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateReminderForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateReminder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRemindersQueryKey() });
        onSuccess();
      }
    }
  });

  const { register, handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { type: "time" }
  });

  return (
    <form onSubmit={handleSubmit(data => mutate({ data }))} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Remind me to...</label>
        <Input 
          {...register("title")} 
          placeholder="e.g., Ask Sarah about project X" 
          className="h-12 rounded-xl bg-secondary/50 border-transparent text-base focus-visible:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Trigger Type</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-transparent text-base">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                <SelectItem value="time">Time based</SelectItem>
                <SelectItem value="location">Location based</SelectItem>
                <SelectItem value="person">When meeting someone</SelectItem>
                <SelectItem value="habit">Daily Habit</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl font-bold mt-2 shadow-md">
        {isPending ? "Creating..." : "Save Reminder"}
      </Button>
    </form>
  );
}
