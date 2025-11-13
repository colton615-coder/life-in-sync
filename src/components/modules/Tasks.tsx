import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabGroup } from '@/components/TabGroup'
import { Plus, CheckCircle, Trash, ArrowUp, ArrowRight, ArrowDown } from '@phosphor-icons/react'
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
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((current) => (current || []).filter(t => t.id !== taskId))
    toast.success('Task deleted')
  }

  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <ArrowUp size={16} weight="bold" className="text-red-500" />
      case 'medium':
        return <ArrowRight size={16} weight="bold" className="text-amber-500" />
      case 'low':
        return <ArrowDown size={16} weight="bold" className="text-emerald-500" />
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-amber-200 bg-amber-50'
      case 'low': return 'border-emerald-200 bg-emerald-50'
    }
  }

  const filteredTasks = sortedTasks.filter(task => {
    if (filterTab === 'all') return true
    if (filterTab === 'active') return !task.completed
    if (filterTab === 'completed') return task.completed
    return true
  })

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Organize and prioritize your to-dos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={20} weight="bold" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] modal-content">
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
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority" className="text-sm font-semibold">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger id="task-priority" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <ArrowUp size={16} weight="bold" className="text-red-500" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <ArrowRight size={16} weight="bold" className="text-amber-500" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <ArrowDown size={16} weight="bold" className="text-emerald-500" />
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
      </div>

      <TabGroup
        tabs={[
          { id: 'all', label: 'All Tasks' },
          { id: 'active', label: 'Active' },
          { id: 'completed', label: 'Completed' },
        ]}
        activeTab={filterTab}
        onChange={setFilterTab}
      />

      {!tasks || tasks.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle size={56} weight="duotone" className="text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-xl mb-2">No tasks yet</h3>
          <p className="text-muted-foreground text-[15px]">Add your first task to get started!</p>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle size={56} weight="duotone" className="text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-xl mb-2">No tasks in this filter</h3>
          <p className="text-muted-foreground text-[15px]">Try a different filter to see your tasks</p>
        </Card>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {filteredTasks.map((task) => (
            <motion.div key={task.id} variants={item}>
              <Card className={`border-l-4 ${getPriorityColor(task.priority)}`}>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <CheckCircle
                        size={32}
                        weight={task.completed ? 'fill' : 'regular'}
                        className={task.completed ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </motion.div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(task.priority)}
                      <h3
                        className={`font-semibold text-lg ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {task.priority} priority
                      </Badge>
                      {task.completed && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash size={20} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
