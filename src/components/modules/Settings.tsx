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
import { Key, Sparkle, Brain, TestTube, Check, X, Vibrate, SpeakerHigh } from '@phosphor-icons/react'
import { gemini } from '@/lib/gemini/client'
import { getUsageStats, resetUsageStats } from '@/lib/ai/usage-tracker'
import type { AIProvider, AIUsageStats } from '@/lib/ai/types'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useSoundEffects } from '@/hooks/use-sound-effects'

export function Settings() {
  const [apiKey, setApiKey, deleteApiKey] = useKV<string>("gemini-api-key", "")
  const [preferredProvider, setPreferredProvider] = useKV<AIProvider | "auto">(
    "preferred-ai-provider",
    "auto"
  )
  const [hapticEnabled, setHapticEnabled] = useKV<boolean>('settings-haptic-enabled', true)
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('settings-sound-enabled', false)
  const [isOwner, setIsOwner] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null)
  const [maskedKey, setMaskedKey] = useState("")
  
  const { triggerHaptic } = useHapticFeedback()
  const { playSound } = useSoundEffects()

  useEffect(() => {
    checkOwnership()
    loadUsageStats()
    
    if (apiKey) {
      setMaskedKey(maskApiKey(apiKey))
    }
  }, [apiKey])

  const checkOwnership = async () => {
    const user = await spark.user()
    setIsOwner(user.isOwner)
  }

  const loadUsageStats = async () => {
    const stats = await getUsageStats()
    setUsageStats(stats)
  }

  const maskApiKey = (key: string): string => {
    if (!key || key.length < 8) return ""
    return key.slice(0, 4) + "•".repeat(20) + key.slice(-4)
  }

  const handleSaveApiKey = async () => {
    const trimmedKey = apiKey?.trim() || ''
    if (!trimmedKey) {
      toast.error("Please enter an API key")
      return
    }

    try {
      await setApiKey(trimmedKey)
      setMaskedKey(maskApiKey(trimmedKey))
      toast.success("Gemini API key saved successfully")
    } catch (error) {
      toast.error("Failed to save API key")
    }
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

  const handleRemoveApiKey = async () => {
    await deleteApiKey()
    setMaskedKey("")
    toast.success("API key removed")
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

      <Card className="elevated-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="text-primary" size={24} />
            <CardTitle>Gemini API Configuration</CardTitle>
          </div>
          <CardDescription>
            Connect your Google Gemini API to enable advanced AI features.
            Get your API key from{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="gemini-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="font-mono text-sm"
              />
              <Button onClick={handleSaveApiKey} variant="default">
                Save
              </Button>
            </div>
            {maskedKey && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-sm text-muted-foreground">{maskedKey}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveApiKey}
                  className="text-destructive hover:text-destructive"
                >
                  <X size={16} />
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={!apiKey || isTesting}
              variant="outline"
              className="gap-2"
            >
              <TestTube size={16} />
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            
            {testResult === 'success' && (
              <Badge variant="default" className="gap-1">
                <Check size={14} />
                Connected
              </Badge>
            )}
            {testResult === 'error' && (
              <Badge variant="destructive" className="gap-1">
                <X size={14} />
                Failed
              </Badge>
            )}
          </div>
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
                <SelectItem value="gemini" disabled={!apiKey}>
                  <div className="flex items-center gap-2">
                    <Brain size={16} />
                    <span>Google Gemini 2.5</span>
                    {!apiKey && <Badge variant="outline" className="ml-2 text-xs">Not configured</Badge>}
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
    </div>
  )
}
