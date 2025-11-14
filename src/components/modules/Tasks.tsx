import { NeumorphicCard } from '../NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabGroup } from '@/components/TabGroup'
import { Plus, CheckCircle, Trash, ArrowUp, ArrowRight, ArrowDown, ListChecks, Target, Calendar as CalendarIcon, MagnifyingGlass, Pencil, X, Clock, CalendarBlank, Sparkle, Fire, Lightning, SortAscending, Tag } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Task } from '@/lib/types'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, isToday, isTomorrow, isPast, isThisWeek, parseISO, isBefore, startOfDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'

type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'title'
type ViewMode = 'all' | 'active' | 'completed'

export function Tasks() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterTab, setFilterTab] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('priority')
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: undefined as Date | undefined
  })

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      completed: false,
      dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : undefined,
      createdAt: new Date().toISOString()
    }

    setTasks((current) => [...(current || []), task])
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: undefined })
    setDialogOpen(false)
    toast.success('Task created!', { icon: '✨' })
  }

  const updateTask = () => {
    if (!editingTask || !newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    setTasks((current) =>
      (current || []).map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              title: newTask.title,
              description: newTask.description,
              priority: newTask.priority,
              dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : undefined,
            }
          : task
      )
    )

    setNewTask({ title: '', description: '', priority: 'medium', dueDate: undefined })
    setEditingTask(null)
    setDialogOpen(false)
    toast.success('Task updated!', { icon: '✓' })
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
      toast.success('Great job! Task completed! 🎉', { 
        description: task.title,
        duration: 2000 
      })
    }
  }

  const deleteTask = (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId)
    setTasks((current) => (current || []).filter(t => t.id !== taskId))
    toast.success('Task deleted', {
      description: task?.title,
      action: {
        label: 'Undo',
        onClick: () => {
          if (task) {
            setTasks((current) => [...(current || []), task])
            toast.success('Task restored')
          }
        }
      }
    })
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? parseISO(task.dueDate) : undefined
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTask(null)
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: undefined })
  }

  const getDueDateInfo = (dueDate?: string) => {
    if (!dueDate) return null
    const date = parseISO(dueDate)
    const today = startOfDay(new Date())
    const isPastDue = isBefore(date, today)
    
    if (isToday(date)) {
      return { label: 'Today', color: 'text-accent', bgColor: 'bg-accent/10', urgent: true }
    }
    if (isTomorrow(date)) {
      return { label: 'Tomorrow', color: 'text-primary', bgColor: 'bg-primary/10', urgent: false }
    }
    if (isPastDue) {
      return { label: 'Overdue', color: 'text-destructive', bgColor: 'bg-destructive/10', urgent: true }
    }
    if (isThisWeek(date)) {
      return { label: format(date, 'EEE'), color: 'text-success', bgColor: 'bg-success/10', urgent: false }
    }
    return { label: format(date, 'MMM d'), color: 'text-muted-foreground', bgColor: 'bg-muted', urgent: false }
  }

  const { activeTasks, completedTasks, overdueTasks, todayTasks } = (() => {
    const active: Task[] = []
    const completed: Task[] = []
    const overdue: Task[] = []
    const today: Task[] = []
    
    const allTasks = tasks || []
    
    allTasks.forEach(task => {
      if (task.completed) {
        completed.push(task)
      } else {
        active.push(task)
        
        if (task.dueDate) {
          const dateInfo = getDueDateInfo(task.dueDate)
          if (dateInfo?.label === 'Overdue') {
            overdue.push(task)
          } else if (dateInfo?.label === 'Today') {
            today.push(task)
          }
        }
      }
    })
    
    return { activeTasks: active, completedTasks: completed, overdueTasks: overdue, todayTasks: today }
  })()

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        if (a.dueDate) return -1
        if (b.dueDate) return 1
      } else if (sortBy === 'dueDate') {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        if (a.dueDate) return -1
        if (b.dueDate) return 1
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      
      return 0
    })
  }

  const filteredTasks = (() => {
    let tasksToFilter: Task[] = []
    
    if (filterTab === 'all') {
      tasksToFilter = [...activeTasks, ...completedTasks]
    } else if (filterTab === 'active') {
      tasksToFilter = activeTasks
    } else if (filterTab === 'completed') {
      tasksToFilter = completedTasks
    }

    if (searchQuery.trim()) {
      tasksToFilter = tasksToFilter.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return sortTasks(tasksToFilter)
  })()

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <Fire size={18} weight="fill" className="text-destructive" />
      case 'medium':
        return <Lightning size={18} weight="fill" className="text-accent" />
      case 'low':
        return <Sparkle size={18} weight="fill" className="text-success" />
    }
  }

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'High'
      case 'medium': return 'Medium'
      case 'low': return 'Low'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  }

  const completionRate = tasks && tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setDialogOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-3 md:gap-4 flex-wrap"
      >
        <div className="space-y-0.5 md:space-y-1">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
            ✅ Tasks
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Organize and prioritize your work
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) closeDialog()
          setDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="gap-2 px-6 md:px-8 h-14 md:h-16 rounded-2xl flex items-center justify-center font-semibold text-base md:text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Plus size={22} weight="bold" className="md:w-6 md:h-6" />
              <span>New Task</span>
              <span className="hidden md:inline text-xs opacity-80 ml-1">⌘K</span>
            </motion.button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[580px] neumorphic border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
              <DialogDescription>
                {editingTask ? 'Update your task details' : 'Add a new task to your list'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-sm font-semibold">Task Title *</Label>
                <Input
                  id="task-title"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="h-12 text-base neumorphic-inset border-none focus-visible:ring-2 focus-visible:ring-primary"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Add more details about this task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="min-h-[100px] resize-none neumorphic-inset border-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                          <Fire size={18} weight="fill" className="text-destructive" />
                          <span className="font-medium">High Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Lightning size={18} weight="fill" className="text-accent" />
                          <span className="font-medium">Medium Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Sparkle size={18} weight="fill" className="text-success" />
                          <span className="font-medium">Low Priority</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full h-11 px-3 rounded-xl flex items-center gap-2 neumorphic-inset text-left">
                        <CalendarIcon size={18} className="text-muted-foreground" />
                        <span className={newTask.dueDate ? 'text-foreground' : 'text-muted-foreground'}>
                          {newTask.dueDate ? format(newTask.dueDate, 'MMM d, yyyy') : 'No date'}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate}
                        onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                        initialFocus
                      />
                      {newTask.dueDate && (
                        <div className="p-3 border-t">
                          <button
                            onClick={() => setNewTask({ ...newTask, dueDate: undefined })}
                            className="w-full h-9 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            Clear date
                          </button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={editingTask ? updateTask : addTask}
                  className="flex-1 h-12 rounded-xl font-semibold text-primary-foreground bg-gradient-to-br from-primary via-primary to-accent shadow-lg shadow-primary/20"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </motion.button>
                <button 
                  onClick={closeDialog}
                  className="h-12 px-6 rounded-xl font-medium neumorphic-button hover:scale-105 transition-transform"
                >
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
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
        >
          <NeumorphicCard className="hover:shadow-primary/10 transition-all duration-300 col-span-2 md:col-span-1" hover>
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <ListChecks size={24} weight="fill" className="text-primary md:w-7 md:h-7" />
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Total Tasks</div>
                <div className="text-2xl md:text-3xl font-bold tabular-nums bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  {tasks.length}
                </div>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="hover:shadow-accent/10 transition-all duration-300" hover>
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <Target size={24} weight="fill" className="text-accent md:w-7 md:h-7" />
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Active</div>
                <div className="text-2xl md:text-3xl font-bold tabular-nums text-accent">
                  {activeTasks.length}
                </div>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="hover:shadow-success/10 transition-all duration-300" hover>
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <CheckCircle size={24} weight="fill" className="text-success md:w-7 md:h-7" />
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Done</div>
                <div className="text-2xl md:text-3xl font-bold tabular-nums text-success">
                  {completedTasks.length}
                </div>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="hover:shadow-destructive/10 transition-all duration-300" hover>
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center flex-shrink-0 neumorphic-inset">
                <Clock size={24} weight="fill" className="text-destructive md:w-7 md:h-7" />
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Overdue</div>
                <div className="text-2xl md:text-3xl font-bold tabular-nums text-destructive">
                  {overdueTasks.length}
                </div>
              </div>
            </div>
          </NeumorphicCard>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass 
            size={20} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
          />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-10 neumorphic-inset border-none text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="h-12 w-full md:w-[180px] neumorphic-inset border-none">
            <div className="flex items-center gap-2">
              <SortAscending size={18} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="dueDate">Sort by Due Date</SelectItem>
            <SelectItem value="createdAt">Sort by Created</SelectItem>
            <SelectItem value="title">Sort by Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabGroup
        tabs={[
          { id: 'all', label: `All (${tasks?.length || 0})` },
          { id: 'active', label: `Active (${activeTasks.length})` },
          { id: 'completed', label: `Completed (${completedTasks.length})` },
        ]}
        activeTab={filterTab}
        onChange={(tab) => setFilterTab(tab as ViewMode)}
      />

      {!tasks || tasks.length === 0 ? (
        <NeumorphicCard className="text-center py-20 md:py-24" inset>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-6 neumorphic-inset">
              <CheckCircle size={48} weight="duotone" className="text-primary" />
            </div>
            <h3 className="font-bold text-2xl mb-3">No tasks yet</h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto mb-6">
              Start organizing your work by creating your first task
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 px-6 md:px-8 h-14 md:h-16 rounded-2xl font-semibold text-base md:text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Plus size={22} weight="bold" className="md:w-6 md:h-6" />
              Create Your First Task
            </motion.button>
          </motion.div>
        </NeumorphicCard>
      ) : filteredTasks.length === 0 ? (
        <NeumorphicCard className="text-center py-20" inset>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <MagnifyingGlass size={64} weight="duotone" className="text-muted-foreground mx-auto mb-5 opacity-40" />
            <h3 className="font-semibold text-2xl mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search query' : 'Try a different filter to see your tasks'}
            </p>
          </motion.div>
        </NeumorphicCard>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => {
                const dueDateInfo = task.dueDate ? getDueDateInfo(task.dueDate) : null
                
                return (
                  <motion.div 
                    key={task.id} 
                    variants={item}
                    layout
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <NeumorphicCard 
                      className={`group hover:shadow-lg transition-all duration-300 ${
                        task.completed ? 'opacity-60' : ''
                      } ${dueDateInfo?.urgent && !task.completed ? 'ring-2 ring-destructive/20' : ''}`}
                      hover={!task.completed}
                    >
                      <div className="flex items-start gap-4">
                        <motion.button
                          onClick={() => toggleTask(task.id)}
                          className="flex-shrink-0 mt-1"
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            task.completed 
                              ? 'bg-gradient-to-br from-success/30 to-success/10 neumorphic-inset' 
                              : 'neumorphic-button hover:shadow-md'
                          }`}>
                            <CheckCircle
                              size={24}
                              weight={task.completed ? 'fill' : 'regular'}
                              className={task.completed ? 'text-success' : 'text-muted-foreground group-hover:text-primary transition-colors'}
                            />
                          </div>
                        </motion.button>

                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(task.priority)}
                            </div>
                            <h3 className={`font-semibold text-lg leading-tight flex-1 ${
                              task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                              {task.title}
                            </h3>
                          </div>

                          {task.description && (
                            <p className={`text-sm mb-3 leading-relaxed ${
                              task.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                            }`}>
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 neumorphic-flat ${
                              task.priority === 'high' ? 'text-destructive' :
                              task.priority === 'medium' ? 'text-accent' :
                              'text-success'
                            }`}>
                              {getPriorityIcon(task.priority)}
                              {getPriorityLabel(task.priority)}
                            </div>

                            {dueDateInfo && (
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                                <CalendarBlank size={14} weight="bold" />
                                {dueDateInfo.label}
                              </div>
                            )}

                            {task.completed && task.completedAt && (
                              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-success/10 text-success">
                                <CheckCircle size={14} weight="fill" />
                                Completed
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!task.completed && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEditDialog(task)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center neumorphic-button text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Pencil size={18} weight="bold" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteTask(task.id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center neumorphic-button text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash size={18} weight="bold" />
                          </motion.button>
                        </div>
                      </div>
                    </NeumorphicCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}

      {tasks && tasks.length > 0 && completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full neumorphic-flat text-sm">
            <CheckCircle size={18} weight="fill" className="text-success" />
            <span className="font-medium text-muted-foreground">
              {completionRate}% completion rate
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="font-semibold text-foreground">
              {completedTasks.length} of {tasks.length} completed
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
