import { NeumorphicCard } from '../NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CheckCircle, Trash, ArrowUp, ArrowRight, ArrowDown } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Task } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function Tasks() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [dialogOpen, setDialogOpen] = useState(false)
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
        return <ArrowUp size={16} className="text-red-500" />
      case 'medium':
        return <ArrowRight size={16} className="text-yellow-500" />
      case 'low':
        return <ArrowDown size={16} className="text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2">Organize and prioritize your to-dos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Task Title</label>
                <Input
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!tasks || tasks.length === 0 ? (
        <NeumorphicCard className="text-center py-12">
          <CheckCircle size={48} weight="duotone" className="text-accent mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No tasks yet</h3>
          <p className="text-muted-foreground">Add your first task to get started!</p>
        </NeumorphicCard>
      ) : (
        <div className="grid gap-4">
          {sortedTasks.map((task) => (
            <NeumorphicCard key={task.id}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 mt-1"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <CheckCircle
                      size={28}
                      weight={task.completed ? 'fill' : 'regular'}
                      className={task.completed ? 'text-accent' : 'text-muted-foreground'}
                    />
                  </motion.div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(task.priority)}
                    <h3
                      className={`font-semibold ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {task.priority} priority
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0"
                >
                  <Trash size={20} />
                </Button>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      )}
    </div>
  )
}
