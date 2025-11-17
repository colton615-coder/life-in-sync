import { useState, useEffect } from 'react'
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
import { Key, Sparkle, Brain, TestTube, Check, X, Vibrate, SpeakerHigh, ShieldCheck, Trash, Warning } from '@phosphor-icons/react'
import { gemini } from '@/lib/gemini/client'
import { getUsageStats, resetUsageStats } from '@/lib/ai/usage-tracker'
import type { AIProvider, AIUsageStats } from '@/lib/ai/types'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import { encrypt, decrypt } from '@/lib/crypto'
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
  const [isOwner, setIsOwner] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null)
  
  const { triggerHaptic } = useHapticFeedback()
  const { playSound } = useSoundEffects()

  useEffect(() => {
    checkOwnership()
    loadUsageStats()
  }, [])

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
      setEncryptedApiKey(encrypted)
      setApiKeyInput('')
      triggerHaptic('success')
      playSound('success')
      toast.success('API key saved securely', {
        description: 'Your key is encrypted using Web Crypto API'
      })
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

  const handleRemoveApiKey = () => {
    setEncryptedApiKey(null)
    setApiKeyInput('')
    toast.success('API key removed')
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const success = await gemini.testConnection()
      setTestResult(success ? 'success' : 'error')
      
      if (success) {
        toast.success("✓ Gemini connection successful!")
      } else {
        toast.error("✗ Gemini connection failed")
      }
    } catch (error: any) {
      setTestResult('error')
      toast.error(`Connection failed: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  const handleResetStats = async () => {
    await resetUsageStats()
    await loadUsageStats()
    toast.success("Usage statistics reset")
  }

  const handleClearAllData = async () => {
    try {
      const dataKeys = [
        'habits',
        'expenses',
        'financial-profile',
        'detailed-budget',
        'tasks',
        'workout-plans',
        'completed-workouts',
        'personal-records',
        'knox-messages',
        'shopping-items',
        'calendar-events',
        'golf-swing-analyses'
      ]

      for (const key of dataKeys) {
        await spark.kv.delete(key)
      }

      triggerHaptic('success')
      playSound('success')
      toast.success('All data cleared', {
        description: 'Your app has been reset to a fresh state'
      })
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Failed to clear data:', error)
      triggerHaptic('error')
      playSound('error')
      toast.error('Failed to clear data', {
        description: 'Please try again'
      })
    }
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
            Your API key is encrypted using Web Crypto API before storage. Never stored in plain text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {encryptedApiKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/30 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-success mt-0.5 flex-shrink-0" weight="bold" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-sm">API Key Configured</p>
                    <p className="text-sm text-muted-foreground">
                      Your Gemini API key is securely stored using AES-GCM encryption. The key is only decrypted in-memory when needed for AI requests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Security Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" weight="bold" />
                    AES-GCM 256-bit encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" weight="bold" />
                    Device-specific key derivation (PBKDF2)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" weight="bold" />
                    No plain-text storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" weight="bold" />
                    In-memory decryption only
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  variant="outline"
                  className="gap-2"
                >
                  <TestTube size={16} />
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
                
                <Button
                  onClick={handleRemoveApiKey}
                  variant="destructive"
                  className="gap-2"
                >
                  <X size={16} />
                  Remove Key
                </Button>

                {testResult === 'success' && (
                  <Badge variant="default" className="gap-1 ml-auto">
                    <Check size={14} />
                    Connected
                  </Badge>
                )}
                {testResult === 'error' && (
                  <Badge variant="destructive" className="gap-1 ml-auto">
                    <X size={14} />
                    Failed
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <Key size={20} className="text-accent mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-sm">Secure Client-Side Encryption</p>
                    <p className="text-sm text-muted-foreground">
                      Your API key will be encrypted using the Web Crypto API with AES-GCM before being stored. 
                      It's never stored in plain text and is only decrypted in-memory when making AI requests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key-input">Gemini API Key</Label>
                <Input
                  id="api-key-input"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveApiKey()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <Button
                onClick={handleSaveApiKey}
                disabled={isSavingKey || !apiKeyInput.trim()}
                className="w-full gap-2"
              >
                <ShieldCheck size={16} />
                {isSavingKey ? 'Encrypting...' : 'Save Encrypted Key'}
              </Button>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Check size={18} className="text-success" weight="bold" />
                  Alternative: Environment Variables
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    For local development, you can also set the API key as an environment variable:
                  </p>
                  <pre className="p-3 bg-background rounded border text-xs font-mono overflow-x-auto">
{`VITE_GEMINI_API_KEY=your_api_key_here`}
                  </pre>
                </div>
              </div>
            </div>
          )}
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
                    <span>Google Gemini 2.5</span>
                    <Badge variant="outline" className="ml-2 text-xs">Requires env var</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Provider Comparison</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>• Spark LLM (GPT-4o):</span>
                <span>Fast, reliable, always available</span>
              </div>
              <div className="flex justify-between">
                <span>• Gemini 2.5:</span>
                <span>Long context, cost-effective</span>
              </div>
              <div className="flex justify-between">
                <span>• Automatic:</span>
                <span>Intelligently routes by task</span>
              </div>
            </div>
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

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Test Feedback</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  triggerHaptic('light')
                  playSound('tap')
                }}
              >
                Light Tap
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  triggerHaptic('success')
                  playSound('success')
                }}
              >
                Success
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  triggerHaptic('warning')
                  playSound('complete')
                }}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  triggerHaptic('error')
                  playSound('error')
                }}
              >
                Error
              </Button>
            </div>
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
