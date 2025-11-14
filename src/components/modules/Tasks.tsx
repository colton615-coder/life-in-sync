import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabGroup } from '@/components/TabGroup'
import { Plus, CheckCircle, Trash, ArrowUp, ArrowRight, ArrowDown, ListChecks, Target } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Task } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export function Tasks() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterTab, setFilterTab] = useState('all')
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as Task['priority'] })

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      priority: newTask.priority,
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTasks((current) => [...(current || []), task])
    setNewTask({ title: '', priority: 'medium' })
    setDialogOpen(false)
    toast.success('Task created!')
  }

  const toggleTask = (taskId: string) => {
    setTasks((current) =>
      (current || []).map(task =>
        task.id === taskId 
          ? { 
              ...task, 
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined
            } 
          : task
      )
    )
    
    const task = tasks?.find(t => t.id === taskId)
    if (task && !task.completed) {
      toast.success('Task completed! 🎉')
    }
  }

  const deleteTask = (taskId: string) => {
    setTasks((current) => (current || []).filter(t => t.id !== taskId))
    toast.success('Task deleted')
  }

  const { activeTasks, completedTasks } = (() => {
    const active: Task[] = []
    const completed: Task[] = []
    
    const sorted = [...(tasks || [])].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    
    sorted.forEach(task => {
      if (task.completed) {
        completed.push(task)
      } else {
        active.push(task)
      }
    })
    
    return { activeTasks: active, completedTasks: completed }
  })()

  const filteredTasks = (() => {
    if (filterTab === 'all') return [...activeTasks, ...completedTasks]
    if (filterTab === 'active') return activeTasks
    if (filterTab === 'completed') return completedTasks
    return []
  })()

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <ArrowUp size={18} weight="bold" className="text-destructive" />
      case 'medium':
        return <ArrowRight size={18} weight="bold" className="text-accent" />
      case 'low':
        return <ArrowDown size={18} weight="bold" className="text-success" />
    }
  }

  const getPriorityBorder = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-destructive/60'
      case 'medium': return 'border-l-accent/60'
      case 'low': return 'border-l-success/60'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  const completionRate = tasks && tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-muted-foreground text-base md:text-[16px] font-medium">
            Organize and prioritize your to-dos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 h-11 px-6">
              <Plus size={22} weight="bold" />
              <span className="font-semibold">Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-card border-primary/30">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Task</DialogTitle>
              <DialogDescription>
                Add a task to your to-do list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-sm font-semibold">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="h-11 glass-morphic border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority" className="text-sm font-semibold">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger id="task-priority" className="h-11 glass-morphic border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <ArrowUp size={16} weight="bold" className="text-destructive" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <ArrowRight size={16} weight="bold" className="text-accent" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <ArrowDown size={16} weight="bold" className="text-success" />
                        Low Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={addTask} className="flex-1 h-11 shadow-md">Create Task</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {tasks && tasks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-lg">
                <ListChecks size={28} weight="fill" className="text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-0.5">Total Tasks</div>
                <div className="text-3xl font-bold tabular-nums bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  {tasks.length}
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-accent/20 hover:border-accent/40 transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Target size={28} weight="fill" className="text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-0.5">Active</div>
                <div className="text-3xl font-bold tabular-nums text-accent">
                  {activeTasks.length}
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-success/20 hover:border-success/40 transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center flex-shrink-0 shadow-lg">
                <CheckCircle size={28} weight="fill" className="text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-0.5">Completed</div>
                <div className="text-3xl font-bold tabular-nums text-success">
                  {completedTasks.length}
                </div>
                <div className="text-xs text-muted-foreground/70 font-medium mt-0.5">
                  {completionRate}% done
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <TabGroup
        tabs={[
          { id: 'all', label: 'All Tasks' },
          { id: 'active', label: `Active (${activeTasks.length})` },
          { id: 'completed', label: `Completed (${completedTasks.length})` },
        ]}
        activeTab={filterTab}
        onChange={setFilterTab}
      />

      {!tasks || tasks.length === 0 ? (
        <Card className="glass-card border-border/30 text-center py-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle size={72} weight="duotone" className="text-primary mx-auto mb-5 opacity-50" />
            <h3 className="font-semibold text-2xl mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto">
              Add your first task to get started on your productivity journey
            </p>
          </motion.div>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card className="glass-card border-border/30 text-center py-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle size={72} weight="duotone" className="text-primary mx-auto mb-5 opacity-50" />
            <h3 className="font-semibold text-2xl mb-2">No tasks in this filter</h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto">
              Try a different filter to see your tasks
            </p>
          </motion.div>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <ListChecks weight="fill" className="text-primary" size={28} />
              {filterTab === 'all' ? 'All Tasks' : filterTab === 'active' ? 'Active Tasks' : 'Completed Tasks'}
            </h2>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
          </div>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {filteredTasks.map((task) => (
              <motion.div key={task.id} variants={item}>
                <Card className={`glass-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-l-4 ${getPriorityBorder(task.priority)}`}>
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <motion.div
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <CheckCircle
                          size={36}
                          weight={task.completed ? 'fill' : 'regular'}
                          className={task.completed ? 'text-success' : 'text-muted-foreground hover:text-primary transition-colors'}
                        />
                      </motion.div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2.5">
                        <div className="mt-1">{getPriorityIcon(task.priority)}</div>
                        <h3
                          className={`font-semibold text-lg leading-tight ${
                            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs capitalize font-medium ${
                            task.priority === 'high' ? 'border-destructive/30 bg-destructive/10 text-destructive' :
                            task.priority === 'medium' ? 'border-accent/30 bg-accent/10 text-accent' :
                            'border-success/30 bg-success/10 text-success'
                          }`}
                        >
                          {task.priority} priority
                        </Badge>
                        {task.completed && (
                          <Badge variant="outline" className="text-xs border-success/40 bg-success/5 text-success font-medium">
                            ✓ Completed
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground/70 font-medium ml-auto">
                          {new Date(task.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash size={20} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
