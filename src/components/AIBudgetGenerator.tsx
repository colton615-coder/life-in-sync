import { useState } from 'react'
import { Card } from './Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface BudgetRecommendation {
  category: string
  recommended: number
  reasoning: string
}

interface GeneratedBudget {
  totalBudget: number
  recommendations: BudgetRecommendation[]
  tips: string[]
}

export function AIBudgetGenerator() {
  const [income, setIncome] = useState('')
  const [scenario, setScenario] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBudget, setGeneratedBudget] = useState<GeneratedBudget | null>(null)

  const generateBudget = async () => {
    if (!income || parseFloat(income) <= 0) {
      toast.error('Please enter a valid income amount')
      return
    }

    if (!scenario.trim()) {
      toast.error('Please describe your budget scenario')
      return
    }

    setIsGenerating(true)
    
    try {
      const promptText = `You are a financial advisor helping create a realistic budget.

User's monthly income: $${income}
Budget scenario: ${scenario}

Generate a comprehensive budget breakdown with the following categories:
- Housing (rent/mortgage)
- Food (groceries + dining)
- Transportation
- Utilities
- Insurance
- Healthcare
- Entertainment
- Savings
- Debt Payment
- Miscellaneous

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "budget": {
    "totalBudget": ${income},
    "recommendations": [
      {
        "category": "Category Name",
        "recommended": 500,
        "reasoning": "Brief explanation for this amount"
      }
    ],
    "tips": [
      "Practical tip 1",
      "Practical tip 2",
      "Practical tip 3"
    ]
  }
}

Ensure all recommended amounts sum to the total budget. Be realistic and practical based on the user's scenario.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      
      if (parsed.budget) {
        setGeneratedBudget(parsed.budget)
        toast.success('Budget generated successfully!')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Budget generation error:', error)
      toast.error('Failed to generate budget. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-primary/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkle weight="fill" className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-xl">AI Budget Generator</h3>
            <p className="text-sm text-muted-foreground">Get personalized budget recommendations</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="monthly-income" className="text-sm font-semibold">Monthly Income</Label>
            <Input
              id="monthly-income"
              type="number"
              step="0.01"
              placeholder="e.g., 5000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="h-12 text-lg glass-morphic border-border/50 focus:border-primary"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-scenario" className="text-sm font-semibold">Budget Scenario</Label>
            <Textarea
              id="budget-scenario"
              placeholder="e.g., I'm a single person living in a city, trying to save for a vacation while paying off student loans..."
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="min-h-[120px] glass-morphic border-border/50 focus:border-primary resize-none"
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={generateBudget}
            disabled={isGenerating}
            className="w-full h-12 gap-2 shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Sparkle className="animate-spin" size={20} />
                Generating Budget...
              </>
            ) : (
              <>
                Generate Budget
                <ArrowRight size={20} />
              </>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {generatedBudget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-accent/30">
              <h3 className="font-semibold text-xl mb-5 flex items-center gap-2">
                <Sparkle weight="fill" className="text-accent" size={22} />
                Your Personalized Budget
              </h3>

              <div className="space-y-4 mb-6">
                {generatedBudget.recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-morphic p-4 rounded-xl border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-base">{rec.category}</span>
                      <span className="text-xl font-bold text-primary tabular-nums">
                        ${rec.recommended.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                  </motion.div>
                ))}
              </div>

              <div className="glass-morphic p-5 rounded-xl border border-accent/30">
                <h4 className="font-semibold text-base mb-3 text-accent">💡 AI Tips</h4>
                <ul className="space-y-2">
                  {generatedBudget.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
