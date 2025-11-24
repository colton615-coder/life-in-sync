import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Plus, X, CurrencyDollar } from '@phosphor-icons/react'
import { GlassKeypad } from './GlassKeypad'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other']
const CATEGORY_ICONS: Record<string, string> = {
  'Food': '🍽️',
  'Transport': '🚗',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Bills': '📄',
  'Health': '⚕️',
  'Other': '💵'
}

interface QuickExpenseDrawerProps {
  onAddExpense: (amount: number, category: string, description: string) => void
}

export function QuickExpenseDrawer({ onAddExpense }: QuickExpenseDrawerProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'category' | 'amount'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string>('Food')
  const [amount, setAmount] = useState('')

  const handleCategorySelect = (cat: string) => {
      setSelectedCategory(cat)
      setStep('amount')
  }

  const handleKeyPress = (key: string) => {
      if (key === '.' && amount.includes('.')) return
      if (amount.length > 7) return // Max length
      // Prevent multiple leading zeros
      if (amount === '0' && key !== '.') {
          setAmount(key)
      } else {
          setAmount(prev => prev + key)
      }
  }

  const handleBackspace = () => {
      setAmount(prev => prev.slice(0, -1))
  }

  const handleConfirm = () => {
      const val = parseFloat(amount)
      if (val > 0) {
          onAddExpense(val, selectedCategory, '') // Description empty for quick add
          setOpen(false)
          // Reset after close animation
          setTimeout(() => {
              setStep('category')
              setAmount('')
          }, 300)
      }
  }

  const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen)
      if (!isOpen) {
        setTimeout(() => {
            setStep('category')
            setAmount('')
        }, 300)
      }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >
            <Button
                size="default"
                className="gap-2 h-11 md:h-9 px-5 md:px-4 bg-[#2E8AF7] hover:bg-[#2E8AF7]/90 text-white shadow-[0_0_15px_rgba(46,138,247,0.4)] transition-all flex-shrink-0 rounded-full md:rounded-md"
            >
                <Plus size={18} weight="bold" className="md:w-4 md:h-4" />
                <span className="font-semibold">Quick Add</span>
            </Button>
        </motion.div>
      </DrawerTrigger>
      <DrawerContent className="bg-[#0B0E14] border-t border-white/10 max-h-[90vh]">
         <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
                <DrawerTitle className="text-white flex items-center justify-between">
                    <span>{step === 'category' ? 'Select Category' : 'Enter Amount'}</span>
                    {step === 'amount' && (
                        <Button variant="ghost" size="sm" onClick={() => setStep('category')} className="text-slate-400 h-6 px-2 text-xs uppercase tracking-wider hover:text-white hover:bg-white/5">
                            Change
                        </Button>
                    )}
                </DrawerTitle>
                <DrawerDescription className="text-slate-500">
                    {step === 'category' ? 'Tap a category to start logging' : `Logging to ${selectedCategory}`}
                </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 pb-0">
                <AnimatePresence mode="wait">
                    {step === 'category' ? (
                        <motion.div
                            key="category-grid"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-3 gap-3"
                        >
                            {CATEGORIES.map(cat => (
                                <motion.button
                                    key={cat}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCategorySelect(cat)}
                                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all aspect-square"
                                >
                                    <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
                                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide">{cat}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="amount-input"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                             <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10">
                                 <div className="flex items-baseline gap-1 text-[#2E8AF7]">
                                     <span className="text-2xl font-bold opacity-50">$</span>
                                     <span className="text-5xl font-mono font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(46,138,247,0.5)]">
                                         {amount || '0'}
                                     </span>
                                 </div>
                                 <Badge variant="outline" className="mt-2 border-white/10 bg-black/20 text-slate-400">
                                     {selectedCategory}
                                 </Badge>
                             </div>

                             <GlassKeypad
                                onKeyPress={handleKeyPress}
                                onBackspace={handleBackspace}
                                onConfirm={handleConfirm}
                                confirmDisabled={!amount || parseFloat(amount) === 0}
                             />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <DrawerFooter>
                <DrawerClose asChild>
                    <Button variant="outline" className="border-white/10 bg-transparent text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
         </div>
      </DrawerContent>
    </Drawer>
  )
}
