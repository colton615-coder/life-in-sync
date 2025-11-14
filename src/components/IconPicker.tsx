import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import * as Icons from '@phosphor-icons/react'

const iconCategories = {
  health: [
    'Heart', 'Drop', 'Activity', 'Heartbeat', 'FirstAid'
  ],
  fitness: [
    'Barbell', 'PersonSimpleRun', 'Bicycle', 'Fire', 'Lightning', 'Target', 'Medal', 'Trophy'
  ],
  food: [
    'Apple', 'Coffee', 'ForkKnife', 'Cookie', 'Carrot'
  ],
  learning: [
    'Book', 'BookOpen', 'GraduationCap', 'Brain', 'Lightbulb', 'Certificate'
  ],
  mindfulness: [
    'FlowerLotus', 'Leaf', 'Moon', 'MoonStars', 'Sun', 'Sparkle'
  ],
  productivity: [
    'CheckCircle', 'ListChecks', 'Briefcase', 'Calendar', 'Clock', 'Timer', 'Bell'
  ],
  creative: [
    'PaintBrush', 'Palette', 'Camera', 'MusicNote', 'Microphone', 'Guitar'
  ],
  social: [
    'Users', 'Handshake', 'Chats', 'Gift', 'ThumbsUp', 'House'
  ]
}

const allIcons = Object.values(iconCategories).flat()

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getFilteredIcons = () => {
    const iconsToShow = selectedCategory === 'all' 
      ? allIcons 
      : iconCategories[selectedCategory as keyof typeof iconCategories] || []

    if (!searchQuery.trim()) {
      return iconsToShow
    }

    return iconsToShow.filter(iconName => 
      iconName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredIcons = getFilteredIcons()

  const categories = [
    { id: 'all', label: 'All', count: allIcons.length },
    { id: 'health', label: 'Health', count: iconCategories.health.length },
    { id: 'fitness', label: 'Fitness', count: iconCategories.fitness.length },
    { id: 'food', label: 'Food', count: iconCategories.food.length },
    { id: 'learning', label: 'Learning', count: iconCategories.learning.length },
    { id: 'mindfulness', label: 'Mindfulness', count: iconCategories.mindfulness.length },
    { id: 'productivity', label: 'Productivity', count: iconCategories.productivity.length },
    { id: 'creative', label: 'Creative', count: iconCategories.creative.length },
    { id: 'social', label: 'Social', count: iconCategories.social.length },
  ]

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent || Icons.Target
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11 glass-morphic border-border/50 focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <ScrollArea className="h-[60px]">
        <div className="flex gap-2 pb-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all whitespace-nowrap',
                selectedCategory === category.id
                  ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
                  : 'glass-morphic border-border/50 hover:border-primary/30'
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </ScrollArea>

      <ScrollArea className="h-[320px] pr-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-5 gap-2"
          >
            {filteredIcons.length === 0 ? (
              <div className="col-span-5 text-center py-12 text-muted-foreground">
                <Icons.MagnifyingGlass size={48} className="mx-auto mb-3 opacity-30" />
                <p>No icons found</p>
              </div>
            ) : (
              filteredIcons.map((iconName) => {
                const IconComponent = getIconComponent(iconName)
                const isSelected = value === iconName

                return (
                  <motion.button
                    key={iconName}
                    type="button"
                    onClick={() => onChange(iconName)}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'aspect-square rounded-xl border-2 flex items-center justify-center transition-all relative group',
                      isSelected
                        ? 'glass-card border-primary bg-primary/20 shadow-lg'
                        : 'glass-morphic border-border/50 hover:border-primary/30'
                    )}
                    title={iconName}
                  >
                    <IconComponent
                      weight={isSelected ? 'fill' : 'regular'}
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {isSelected && (
                      <motion.div
                        layoutId="selected-icon"
                        className="absolute inset-0 rounded-xl border-2 border-primary"
                        transition={{ type: 'spring', duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {filteredIcons.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
        </p>
      )}
    </div>
  )
}
