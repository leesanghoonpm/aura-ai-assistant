import { useState } from "react";
import { useGetTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, Clock, AlertCircle, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { getGetTasksQueryKey } from "@workspace/api-client-react";

// Form Schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function Tasks() {
  const { data: tasks, isLoading } = useGetTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const todoTasks = tasks?.filter(t => t.status === "todo") || [];
  const inProgressTasks = tasks?.filter(t => t.status === "in_progress") || [];
  const doneTasks = tasks?.filter(t => t.status === "done") || [];

  return (
    <PageTransition className="p-4 sm:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your workflow</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 px-6 shadow-md hover-elevate active-elevate-2 font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl p-6 border-0 shadow-xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold">Add New Task</DialogTitle>
            </DialogHeader>
            <CreateTaskForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4 bg-secondary/30 p-6 rounded-3xl">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0 overflow-x-auto pb-8">
          <TaskColumn title="To Do" count={todoTasks.length} tasks={todoTasks} status="todo" />
          <TaskColumn title="In Progress" count={inProgressTasks.length} tasks={inProgressTasks} status="in_progress" />
          <TaskColumn title="Done" count={doneTasks.length} tasks={doneTasks} status="done" />
        </div>
      )}
    </PageTransition>
  );
}

function CreateTaskForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        onSuccess();
      }
    }
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium", category: "General" }
  });

  const onSubmit = (data: TaskFormValues) => {
    mutate({ data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold">What needs to be done?</label>
        <Input 
          {...register("title")} 
          placeholder="e.g., Review Q3 marketing presentation" 
          className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary/20 text-base"
        />
        {errors.title && <p className="text-sm text-destructive font-medium">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Priority</label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-transparent">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-lg">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl text-base font-semibold mt-4">
        {isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}

function TaskColumn({ title, count, tasks, status }: { title: string, count: number, tasks: any[], status: string }) {
  return (
    <div className="flex flex-col bg-secondary/30 rounded-3xl p-4 sm:p-5 h-full">
      <div className="flex justify-between items-center mb-5 px-1">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {title}
          <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
            {count}
          </span>
        </h3>
      </div>
      
      <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-4">
        {tasks.length === 0 ? (
          <div className="h-24 border-2 border-dashed border-border/60 rounded-2xl flex items-center justify-center text-muted-foreground text-sm font-medium">
            No tasks here
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  const queryClient = useQueryClient();
  const { mutate: updateTask } = useUpdateTask({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() })
    }
  });
  const { mutate: deleteTask } = useDeleteTask({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() })
    }
  });

  const priorityColors = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700"
  };

  const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';

  return (
    <Card className="rounded-2xl border-0 shadow-sm hover-elevate bg-white group relative overflow-hidden transition-all">
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority}
            </span>
            {task.category && (
              <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                {task.category}
              </span>
            )}
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -mt-1 -mr-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              onClick={() => updateTask({ id: task.id, data: { status: nextStatus } })}
              title="Move to next stage"
            >
              {task.status === 'done' ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              onClick={() => deleteTask({ id: task.id })}
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <h4 className={`font-bold text-base leading-snug mb-3 ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </h4>
        
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-auto">
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5 opacity-30" />
            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          
          {task.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </div>
      </CardContent>
    </Card>
  );
}
