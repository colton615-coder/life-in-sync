import { NeumorphicCard } from '../NeumorphicCard'
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
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-2 md:gap-4 flex-wrap"
      >
        <div className="space-y-0.5 md:space-y-1">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-[16px] font-medium">
            Organize and prioritize your to-dos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="gap-2 px-4 md:px-6 h-9 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-br from-primary to-primary/80 neumorphic-button hover:scale-105 transition-transform duration-200">
              <Plus size={18} weight="bold" className="md:w-[22px] md:h-[22px]" />
              <span>Add Task</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] neumorphic border-none">
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
                  className="h-11 neumorphic-inset border-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority" className="text-sm font-semibold">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger id="task-priority" className="h-11 neumorphic-inset border-none">
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
                <button onClick={addTask} className="flex-1 h-11 rounded-xl font-semibold text-primary-foreground bg-gradient-to-br from-primary to-primary/80 neumorphic-button">
                  Create Task
                </button>
                <button onClick={() => setDialogOpen(false)} className="h-11 px-6 rounded-xl font-medium neumorphic-button">
                  Cancel
                </button>
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
          <NeumorphicCard className="hover:shadow-primary/10 transition-all duration-300" hover>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <ListChecks size={32} weight="fill" className="text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">Total Tasks</div>
                <div className="text-4xl md:text-5xl font-bold tabular-nums bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  {tasks.length}
                </div>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="hover:shadow-accent/10 transition-all duration-300" hover>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <Target size={32} weight="fill" className="text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">Active Tasks</div>
                <div className="text-4xl md:text-5xl font-bold tabular-nums text-accent">
                  {activeTasks.length}
                </div>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="hover:shadow-success/10 transition-all duration-300" hover>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/30 to-success/10 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <CheckCircle size={32} weight="fill" className="text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">Completed</div>
                <div className="text-4xl md:text-5xl font-bold tabular-nums text-success">
                  {completedTasks.length}
                </div>
                <div className="text-xs text-muted-foreground/70 font-medium mt-1">
                  {completionRate}% completion rate
                </div>
              </div>
            </div>
          </NeumorphicCard>
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
        <NeumorphicCard className="text-center py-20" inset>
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
        </NeumorphicCard>
      ) : filteredTasks.length === 0 ? (
        <NeumorphicCard className="text-center py-20" inset>
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
        </NeumorphicCard>
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
            <div className="px-4 py-2 rounded-full text-sm font-medium neumorphic-flat">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {filteredTasks.map((task) => (
              <motion.div key={task.id} variants={item}>
                <NeumorphicCard className={`hover:shadow-primary/10 transition-all duration-300 ${task.completed ? 'opacity-70' : ''}`} hover>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      <motion.div
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          task.completed 
                            ? 'bg-gradient-to-br from-success/30 to-success/10 neumorphic-inset' 
                            : 'neumorphic-button'
                        }`}
                      >
                        <CheckCircle
                          size={28}
                          weight={task.completed ? 'fill' : 'regular'}
                          className={task.completed ? 'text-success' : 'text-muted-foreground'}
                        />
                      </motion.div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div>{getPriorityIcon(task.priority)}</div>
                          <h3
                            className={`font-semibold text-lg leading-tight ${
                              task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`px-3 py-1 rounded-full text-xs capitalize font-medium neumorphic-flat ${
                            task.priority === 'high' ? 'text-destructive' :
                            task.priority === 'medium' ? 'text-accent' :
                            'text-success'
                          }`}>
                          {task.priority} priority
                        </div>
                        {task.completed && (
                          <div className="px-3 py-1 rounded-full text-xs font-medium neumorphic-flat text-success">
                            ✓ Completed
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground/70 font-medium ml-auto">
                          {new Date(task.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center neumorphic-button text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </NeumorphicCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
