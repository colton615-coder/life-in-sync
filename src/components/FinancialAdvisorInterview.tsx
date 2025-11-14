import { useState } from 'react'
import { Card } from './Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ChatsCircle, ArrowRight, ArrowLeft, Sparkle, Check } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { FinancialProfile } from '@/lib/types'
import { useKV } from '@github/spark/hooks'

interface FinancialAdvisorInterviewProps {
  onComplete: (profile: FinancialProfile) => void
}

export function FinancialAdvisorInterview({ onComplete }: FinancialAdvisorInterviewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    hasPartner: 'no',
    partnerIncome: '',
    dependents: '0',
    location: '',
    housingType: 'rent' as 'rent' | 'own' | 'mortgage',
    monthlyHousingCost: '',
    hasDebt: 'no',
    debtTypes: [] as string[],
    totalDebtAmount: '',
    monthlyDebtPayment: '',
    financialGoals: [] as string[],
    riskTolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    savingsGoal: '',
    emergencyFundMonths: '3',
    hasRetirement: 'no',
    currentSavings: '',
    spendingHabits: '',
    majorExpenses: '',
    concerns: ''
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: 'debtTypes' | 'financialGoals', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const steps = [
    {
      title: "Let's start with your income",
      subtitle: "Understanding your income helps me create a realistic budget",
      fields: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthly-income" className="text-base">What is your monthly income after taxes?</Label>
            <Input
              id="monthly-income"
              type="number"
              step="0.01"
              placeholder="e.g., 5000"
              value={formData.monthlyIncome}
              onChange={(e) => updateField('monthlyIncome', e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">Do you have a partner contributing to household income?</Label>
            <RadioGroup value={formData.hasPartner} onValueChange={(v) => updateField('hasPartner', v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="partner-yes" />
                <Label htmlFor="partner-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="partner-no" />
                <Label htmlFor="partner-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.hasPartner === 'yes' && (
            <div className="space-y-2 animate-in slide-in-from-top duration-300">
              <Label htmlFor="partner-income" className="text-base">Partner's monthly income after taxes</Label>
              <Input
                id="partner-income"
                type="number"
                step="0.01"
                placeholder="e.g., 4000"
                value={formData.partnerIncome}
                onChange={(e) => updateField('partnerIncome', e.target.value)}
                className="h-12 text-lg"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dependents" className="text-base">How many dependents do you have? (children, elderly parents, etc.)</Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              placeholder="0"
              value={formData.dependents}
              onChange={(e) => updateField('dependents', e.target.value)}
              className="h-12 text-lg"
            />
          </div>
        </div>
      ),
      validate: () => {
        if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
          toast.error('Please enter your monthly income')
          return false
        }
        if (formData.hasPartner === 'yes' && (!formData.partnerIncome || parseFloat(formData.partnerIncome) <= 0)) {
          toast.error("Please enter your partner's income")
          return false
        }
        return true
      }
    },
    {
      title: "Tell me about your housing situation",
      subtitle: "Housing is typically the largest expense in any budget",
      fields: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base">What city/area do you live in?</Label>
            <Input
              id="location"
              placeholder="e.g., New York City, Los Angeles, Austin"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">What is your housing situation?</Label>
            <RadioGroup value={formData.housingType} onValueChange={(v) => updateField('housingType', v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rent" id="housing-rent" />
                <Label htmlFor="housing-rent" className="cursor-pointer">Renting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mortgage" id="housing-mortgage" />
                <Label htmlFor="housing-mortgage" className="cursor-pointer">Paying mortgage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="own" id="housing-own" />
                <Label htmlFor="housing-own" className="cursor-pointer">Own outright (no mortgage)</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.housingType !== 'own' && (
            <div className="space-y-2 animate-in slide-in-from-top duration-300">
              <Label htmlFor="housing-cost" className="text-base">
                Monthly {formData.housingType === 'rent' ? 'rent' : 'mortgage'} payment
              </Label>
              <Input
                id="housing-cost"
                type="number"
                step="0.01"
                placeholder="e.g., 1500"
                value={formData.monthlyHousingCost}
                onChange={(e) => updateField('monthlyHousingCost', e.target.value)}
                className="h-12 text-lg"
              />
            </div>
          )}
        </div>
      ),
      validate: () => {
        if (!formData.location.trim()) {
          toast.error('Please enter your location')
          return false
        }
        if (formData.housingType !== 'own' && (!formData.monthlyHousingCost || parseFloat(formData.monthlyHousingCost) <= 0)) {
          toast.error('Please enter your monthly housing cost')
          return false
        }
        return true
      }
    },
    {
      title: "Let's talk about debt",
      subtitle: "Understanding your debt helps me prioritize payments and find opportunities to save",
      fields: (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Do you currently have any debt?</Label>
            <RadioGroup value={formData.hasDebt} onValueChange={(v) => updateField('hasDebt', v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="debt-yes" />
                <Label htmlFor="debt-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="debt-no" />
                <Label htmlFor="debt-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.hasDebt === 'yes' && (
            <div className="space-y-6 animate-in slide-in-from-top duration-300">
              <div className="space-y-3">
                <Label className="text-base">What types of debt do you have? (Select all that apply)</Label>
                <div className="space-y-2">
                  {['Credit Card', 'Student Loans', 'Auto Loan', 'Personal Loan', 'Medical Debt', 'Other'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`debt-${type}`}
                        checked={formData.debtTypes.includes(type)}
                        onCheckedChange={() => toggleArrayItem('debtTypes', type)}
                      />
                      <Label htmlFor={`debt-${type}`} className="cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-amount" className="text-base">Total debt amount (approximate)</Label>
                <Input
                  id="debt-amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 15000"
                  value={formData.totalDebtAmount}
                  onChange={(e) => updateField('totalDebtAmount', e.target.value)}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-payment" className="text-base">Current monthly debt payment</Label>
                <Input
                  id="debt-payment"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 300"
                  value={formData.monthlyDebtPayment}
                  onChange={(e) => updateField('monthlyDebtPayment', e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
            </div>
          )}
        </div>
      ),
      validate: () => {
        if (formData.hasDebt === 'yes') {
          if (formData.debtTypes.length === 0) {
            toast.error('Please select at least one debt type')
            return false
          }
          if (!formData.totalDebtAmount || parseFloat(formData.totalDebtAmount) <= 0) {
            toast.error('Please enter your total debt amount')
            return false
          }
          if (!formData.monthlyDebtPayment || parseFloat(formData.monthlyDebtPayment) <= 0) {
            toast.error('Please enter your monthly debt payment')
            return false
          }
        }
        return true
      }
    },
    {
      title: "What are your financial goals?",
      subtitle: "Your goals help me tailor recommendations to what matters most to you",
      fields: (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Select your primary financial goals (Select all that apply)</Label>
            <div className="space-y-2">
              {[
                'Build Emergency Fund',
                'Pay Off Debt',
                'Save for Retirement',
                'Buy a Home',
                'Save for Vacation',
                'Increase Investments',
                'Education Fund',
                'Start a Business',
                'Other'
              ].map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal}`}
                    checked={formData.financialGoals.includes(goal)}
                    onCheckedChange={() => toggleArrayItem('financialGoals', goal)}
                  />
                  <Label htmlFor={`goal-${goal}`} className="cursor-pointer">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-goal" className="text-base">Monthly savings goal (if any)</Label>
            <Input
              id="savings-goal"
              type="number"
              step="0.01"
              placeholder="e.g., 500"
              value={formData.savingsGoal}
              onChange={(e) => updateField('savingsGoal', e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-savings" className="text-base">Current total savings/investments</Label>
            <Input
              id="current-savings"
              type="number"
              step="0.01"
              placeholder="e.g., 10000"
              value={formData.currentSavings}
              onChange={(e) => updateField('currentSavings', e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">How many months of expenses would you like in your emergency fund?</Label>
            <Select value={formData.emergencyFundMonths} onValueChange={(v) => updateField('emergencyFundMonths', v)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="9">9 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base">Are you currently contributing to retirement?</Label>
            <RadioGroup value={formData.hasRetirement} onValueChange={(v) => updateField('hasRetirement', v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="retirement-yes" />
                <Label htmlFor="retirement-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="retirement-no" />
                <Label htmlFor="retirement-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ),
      validate: () => {
        if (formData.financialGoals.length === 0) {
          toast.error('Please select at least one financial goal')
          return false
        }
        return true
      }
    },
    {
      title: "Understanding your spending",
      subtitle: "Help me understand your lifestyle and financial personality",
      fields: (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">What's your risk tolerance with investments?</Label>
            <RadioGroup value={formData.riskTolerance} onValueChange={(v) => updateField('riskTolerance', v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conservative" id="risk-conservative" />
                <Label htmlFor="risk-conservative" className="cursor-pointer">Conservative (I prefer safety over growth)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="risk-moderate" />
                <Label htmlFor="risk-moderate" className="cursor-pointer">Moderate (I want balanced growth and safety)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aggressive" id="risk-aggressive" />
                <Label htmlFor="risk-aggressive" className="cursor-pointer">Aggressive (I'm comfortable with risk for higher returns)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spending-habits" className="text-base">Describe your current spending habits</Label>
            <Textarea
              id="spending-habits"
              placeholder="e.g., I tend to eat out frequently, I'm frugal with clothing, I spend a lot on hobbies..."
              value={formData.spendingHabits}
              onChange={(e) => updateField('spendingHabits', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="major-expenses" className="text-base">Any upcoming major expenses? (Optional)</Label>
            <Textarea
              id="major-expenses"
              placeholder="e.g., Wedding in 6 months, car needs replacement, home repairs..."
              value={formData.majorExpenses}
              onChange={(e) => updateField('majorExpenses', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concerns" className="text-base">Any financial concerns or questions? (Optional)</Label>
            <Textarea
              id="concerns"
              placeholder="e.g., I'm worried about retirement, I don't know if I'm saving enough..."
              value={formData.concerns}
              onChange={(e) => updateField('concerns', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      ),
      validate: () => {
        if (!formData.spendingHabits.trim()) {
          toast.error('Please describe your spending habits')
          return false
        }
        return true
      }
    }
  ]

  const handleNext = () => {
    if (steps[currentStep].validate()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const profile: FinancialProfile = {
        monthlyIncome: parseFloat(formData.monthlyIncome),
        hasPartner: formData.hasPartner === 'yes',
        partnerIncome: formData.partnerIncome ? parseFloat(formData.partnerIncome) : undefined,
        dependents: parseInt(formData.dependents),
        location: formData.location,
        housingType: formData.housingType,
        monthlyHousingCost: formData.monthlyHousingCost ? parseFloat(formData.monthlyHousingCost) : 0,
        hasDebt: formData.hasDebt === 'yes',
        debtTypes: formData.debtTypes.length > 0 ? formData.debtTypes : undefined,
        totalDebtAmount: formData.totalDebtAmount ? parseFloat(formData.totalDebtAmount) : undefined,
        monthlyDebtPayment: formData.monthlyDebtPayment ? parseFloat(formData.monthlyDebtPayment) : undefined,
        financialGoals: formData.financialGoals,
        riskTolerance: formData.riskTolerance,
        savingsGoal: formData.savingsGoal ? parseFloat(formData.savingsGoal) : undefined,
        emergencyFundMonths: parseInt(formData.emergencyFundMonths),
        hasRetirement: formData.hasRetirement === 'yes',
        currentSavings: formData.currentSavings ? parseFloat(formData.currentSavings) : undefined,
        spendingHabits: formData.spendingHabits,
        majorExpenses: formData.majorExpenses || undefined,
        concerns: formData.concerns || undefined,
        createdAt: new Date().toISOString()
      }

      await onComplete(profile)
    } catch (error) {
      console.error('Error submitting profile:', error)
      toast.error('Failed to save your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-card border-primary/30 shadow-2xl shadow-primary/10">
        <div className="flex items-start gap-5 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <ChatsCircle weight="fill" className="text-primary" size={32} />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-3xl mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Financial Advisor Interview
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Answer a few questions so I can create a detailed, personalized budget for you
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <h4 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {steps[currentStep].title}
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                {steps[currentStep].subtitle}
              </p>
            </div>

            <div className="glass-morphic p-6 rounded-2xl border border-border/50">
              {steps[currentStep].fields}
            </div>

            <div className="flex gap-3 pt-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2 h-12 px-6"
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={20} />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 shadow-xl shadow-primary/30 h-12 text-base font-semibold hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Sparkle className="animate-spin" size={22} weight="fill" />
                    Generating Your Budget...
                  </>
                ) : currentStep < steps.length - 1 ? (
                  <>
                    Continue
                    <ArrowRight size={20} weight="bold" />
                  </>
                ) : (
                  <>
                    <Sparkle size={20} weight="fill" />
                    Generate Budget
                    <Check size={20} weight="bold" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="glass-morphic p-5 rounded-2xl border border-primary/20"
      >
        <p className="text-sm text-muted-foreground text-center font-medium flex items-center justify-center gap-2">
          <span className="text-xl">🔒</span>
          Your financial information is stored locally on your device and never shared
        </p>
      </motion.div>
    </motion.div>
  )
}
