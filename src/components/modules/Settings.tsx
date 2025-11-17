import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Key, Sparkle, Brain, TestTube, Check, X, Vibrate, SpeakerHigh, ShieldCheck, Trash, Warning, ClipboardText, Hourglass } from '@phosphor-icons/react'
import { gemini } from '@/lib/gemini/client'
import { getUsageStats, resetUsageStats } from '@/lib/ai/usage-tracker'
import type { AIProvider, AIUsageStats } from '@/lib/ai/types'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import { encrypt } from '@/lib/crypto'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { GeminiConnectionTestResult } from '@/lib/gemini/types'

export function Settings() {
  const [preferredProvider, setPreferredProvider] = useKV<AIProvider | "auto">(
    "preferred-ai-provider",
    "auto"
  )
  const [encryptedApiKey, setEncryptedApiKey] = useKV<string | null>('encrypted-gemini-api-key', null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isSavingKey, setIsSavingKey] = useState(false)
  const [hapticEnabled, setHapticEnabled] = useKV<boolean>('settings-haptic-enabled', true)
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('settings-sound-enabled', false)
  const [safeModeEnabled, setSafeModeEnabled] = useKV<boolean>('settings-safe-mode-enabled', true)
  const [isOwner, setIsOwner] = useState(false)
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null)
  
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationResult, setVerificationResult] = useState<GeminiConnectionTestResult | null>(null)
  const [apiKeySource, setApiKeySource] = useState<'environment' | 'storage' | 'none' | null>(null)

  const { triggerHaptic } = useHapticFeedback()
  const { playSound } = useSoundEffects()

  const runVerification = useCallback(async () => {
    setIsVerifying(true)
    setVerificationResult(null)
    setApiKeySource(null)

    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    const storedKey = await window.spark.kv.get<string>('encrypted-gemini-api-key')

    if (envKey) {
      setApiKeySource('environment')
    } else if (storedKey) {
      setApiKeySource('storage')
    } else {
      setApiKeySource('none')
    }

    const result = await gemini.testConnection()
    setVerificationResult(result)
    setIsVerifying(false)
  }, [])

  useEffect(() => {
    checkOwnership()
    loadUsageStats()
    runVerification()
  }, [runVerification])

  const handlePasteFromClipboard = async () => {
    if (!navigator.clipboard?.readText) {
      toast.error('Clipboard access not supported', {
        description: 'Your browser does not support securely reading from the clipboard.',
      })
      return
    }

    try {
      const text = await navigator.clipboard.readText()
      if (text && text.trim()) {
        setApiKeyInput(text.trim())
        toast.success('API Key pasted from clipboard')
        triggerHaptic('selection')
      } else {
        toast.warning('Clipboard is empty or contains only whitespace')
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error)
      toast.error('Failed to paste from clipboard', {
        description: 'Permission to read from clipboard may have been denied. Please check your browser settings.',
      })
    }
  }

  const checkOwnership = async () => {
    const user = await spark.user()
    setIsOwner(user.isOwner)
  }

  const loadUsageStats = async () => {
    const stats = await getUsageStats()
    setUsageStats(stats)
  }

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error('Please enter an API key')
      return
    }

    if (apiKeyInput.trim().length < 20) {
      toast.error('API key appears to be invalid (too short)')
      return
    }

    setIsSavingKey(true)
    try {
      const encrypted = await encrypt(apiKeyInput.trim())
      await setEncryptedApiKey(encrypted)
      setApiKeyInput('')
      triggerHaptic('success')
      playSound('success')
      toast.success('API key saved securely', {
        description: 'Your key is encrypted and stored locally.'
      })
      await runVerification() // Re-run verification after saving
    } catch (error) {
      console.error('Failed to encrypt API key:', error)
      triggerHaptic('error')
      playSound('error')
      toast.error('Failed to save API key', {
        description: 'Encryption failed. Please try again.'
      })
    } finally {
      setIsSavingKey(false)
    }
  }

  const handleRemoveApiKey = async () => {
    await setEncryptedApiKey(null)
    setApiKeyInput('')
    toast.success('API key removed')
    await runVerification() // Re-run verification after removing
  }

  const handleResetStats = async () => {
    await resetUsageStats()
    await loadUsageStats()
    toast.success("Usage statistics reset")
  }

  const handleClearAllData = async () => {
    if (safeModeEnabled) {
      const confirmation = prompt('To disable safe mode and delete all data, type "DELETE" and click OK.')
      if (confirmation !== 'DELETE') {
        toast.warning('Data deletion cancelled', {
          description: 'You must type "DELETE" to confirm.'
        })
        return
      }
    }

    try {
      const dataKeys = [
        'habits', 'expenses', 'financial-profile', 'detailed-budget', 'tasks',
        'workout-plans', 'completed-workouts', 'personal-records', 'knox-messages',
        'shopping-items', 'calendar-events', 'golf-swing-analyses'
      ]
      for (const key of dataKeys) {
        await spark.kv.delete(key)
      }
      triggerHaptic('success')
      playSound('success')
      toast.success('All data cleared', {
        description: 'Your app has been reset to a fresh state'
      })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Failed to clear data:', error)
      triggerHaptic('error')
      playSound('error')
      toast.error('Failed to clear data', { description: 'Please try again' })
    }
  }

  const renderVerificationStatus = () => {
    if (isVerifying) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
          <Hourglass size={20} className="text-muted-foreground animate-spin" />
          <div>
            <p className="font-semibold text-sm">Verifying Connection...</p>
            <p className="text-sm text-muted-foreground">Running diagnostics on Gemini API.</p>
          </div>
        </div>
      )
    }

    if (verificationResult?.success) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-success/10 border border-success/30 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Check size={20} className="text-success mt-0.5 flex-shrink-0" weight="bold" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-sm">Gemini Connection Successful</p>
                <p className="text-sm text-muted-foreground">{verificationResult.details}</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <span className="font-semibold">Key Source:</span>
            <span className="ml-2 font-mono text-xs p-1 rounded bg-background">
              {apiKeySource === 'environment' ? 'Production Environment Variable' : 'Locally Stored Encrypted Key'}
            </span>
          </div>
          {apiKeySource === 'storage' && (
            <Button onClick={handleRemoveApiKey} variant="destructive" className="w-full gap-2">
              <X size={16} /> Remove Locally Stored Key
            </Button>
          )}
        </div>
      )
    }

    if (!verificationResult?.success) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-destructive mt-0.5 flex-shrink-0" weight="bold" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-sm">{verificationResult?.error || 'Gemini Connection Failed'}</p>
                <p className="text-sm text-muted-foreground">{verificationResult?.details || 'Could not connect to Gemini. AI features will be unavailable.'}</p>
              </div>
            </div>
          </div>
          
          {apiKeySource === 'none' && (
            <div className="space-y-4 pt-4">
               <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <Key size={20} className="text-accent mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-sm">Action Required: Add API Key</p>
                    <p className="text-sm text-muted-foreground">
                      For development, you can paste your key below. It will be encrypted and stored in your browser's local storage.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key-input">Gemini API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="api-key-input"
                    type="password"
                    placeholder="Enter or paste your Gemini API key"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={handlePasteFromClipboard} aria-label="Paste API key from clipboard">
                    <ClipboardText size={18} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google AI Studio
                  </a>
                </p>
              </div>
              <Button onClick={handleSaveApiKey} disabled={isSavingKey || !apiKeyInput.trim()} className="w-full gap-2">
                <ShieldCheck size={16} />
                {isSavingKey ? 'Encrypting...' : 'Save Encrypted Key Locally'}
              </Button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={runVerification} variant="outline" className="w-full gap-2">
              <TestTube size={16} /> Retry Verification
            </Button>
            {apiKeySource === 'storage' && (
              <Button onClick={handleRemoveApiKey} variant="destructive" className="w-full gap-2">
                <X size={16} /> Remove Stored Key
              </Button>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (!isOwner) {
    return (
      <div className="pt-2 md:pt-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">⚙️ Settings</h1>
          <p className="text-muted-foreground">
            Only the app owner can configure AI settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-2 md:pt-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">⚙️ Settings</h1>
        <p className="text-muted-foreground">
          Configure the machinery of your digital existence
        </p>
      </div>

      <Card className="elevated-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            <CardTitle>Gemini API Configuration</CardTitle>
          </div>
          <CardDescription>
            This panel automatically tests your connection to Google's Gemini API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderVerificationStatus()}
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="text-accent" size={24} />
            <CardTitle>AI Provider Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose which AI provider to use for generating content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Preferred AI Provider</Label>
            <Select
              value={preferredProvider}
              onValueChange={(value) => setPreferredProvider(value as AIProvider | "auto")}
            >
              <SelectTrigger id="ai-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} />
                    <span>Automatic (Best for task)</span>
                  </div>
                </SelectItem>
                <SelectItem value="spark">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} />
                    <span>Spark LLM (GPT-4o)</span>
                  </div>
                </SelectItem>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <Brain size={16} />
                    <span>Google Gemini</span>
                    <Badge variant="outline" className="ml-2 text-xs">Requires API Key</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle>User Experience Settings</CardTitle>
          <CardDescription>
            Customize haptic feedback and sound effects for interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Vibrate className="text-primary" size={20} />
                <Label htmlFor="haptic-toggle" className="text-base font-medium cursor-pointer">
                  Haptic Feedback
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Subtle vibrations for key actions like completing habits or deleting items
              </p>
            </div>
            <Switch
              id="haptic-toggle"
              checked={hapticEnabled}
              onCheckedChange={(checked) => {
                setHapticEnabled(checked)
                if (checked) {
                  triggerHaptic('selection')
                  toast.success('Haptic feedback enabled')
                } else {
                  toast.success('Haptic feedback disabled')
                }
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SpeakerHigh className="text-accent" size={20} />
                <Label htmlFor="sound-toggle" className="text-base font-medium cursor-pointer">
                  Sound Effects
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Optional audio feedback for major interactions and completions
              </p>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={(checked) => {
                setSoundEnabled(checked)
                if (checked) {
                  playSound('success')
                  toast.success('Sound effects enabled')
                } else {
                  toast.success('Sound effects disabled')
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            <CardTitle>Safety & Security</CardTitle>
          </div>
          <CardDescription>
            Extra layers of protection for your account and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="safe-mode-toggle" className="text-base font-medium cursor-pointer flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Safe Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Require extra confirmation for destructive actions like deleting all data.
              </p>
            </div>
            <Switch
              id="safe-mode-toggle"
              checked={safeModeEnabled}
              onCheckedChange={(checked) => {
                setSafeModeEnabled(checked)
                toast.success(`Safe Mode ${checked ? 'enabled' : 'disabled'}`)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {usageStats && (
        <Card className="elevated-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Usage Statistics</CardTitle>
                <CardDescription>
                  Track your AI provider usage and costs
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetStats}>
                Reset Stats
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkle className="text-primary" size={20} />
                  <h4 className="font-semibold">Spark LLM</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests:</span>
                    <span className="font-medium">{usageStats.spark.requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens:</span>
                    <span className="font-medium">{usageStats.spark.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Cost:</span>
                    <span className="font-medium">${usageStats.spark.cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="text-accent" size={20} />
                  <h4 className="font-semibold">Gemini</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests:</span>
                    <span className="font-medium">{usageStats.gemini.requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens:</span>
                    <span className="font-medium">{usageStats.gemini.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Cost:</span>
                    <span className="font-medium">${usageStats.gemini.cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Estimated Cost:</span>
              <span className="text-lg font-bold">
                ${(usageStats.spark.cost + usageStats.gemini.cost).toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="elevated-card border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Warning className="text-destructive" size={24} />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that will permanently delete your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Trash className="text-destructive" size={18} />
              Clear All Data
            </h4>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all your habits, expenses, tasks, workouts, calendar events, shopping items, Knox conversations, and golf swing analyses. This action cannot be undone.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2">
                <Trash size={16} />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Warning className="text-destructive" size={24} />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This action cannot be undone. This will permanently delete:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All habits and their tracking history</li>
                    <li>All expenses and financial profiles</li>
                    <li>All tasks and calendar events</li>
                    <li>All workout plans and completed workouts</li>
                    <li>All Knox conversations</li>
                    <li>All shopping lists</li>
                    <li>All golf swing analyses</li>
                  </ul>
                  <p className="font-semibold pt-2">
                    Your app will be reset to a fresh state, as if you just installed it.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
