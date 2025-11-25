import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Sparkle, Vibrate, SpeakerHigh, ShieldCheck, Trash, Warning, Key, LinkSimple, WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { getUsageStats, resetUsageStats } from '@/lib/completion-tracker'
import type { AIUsageStats } from '@/lib/types'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import { GeminiCore } from '@/services/gemini_core'
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
  const [hapticEnabled, setHapticEnabled] = useKV<boolean>('settings-haptic-enabled', true)
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('settings-sound-enabled', false)
  const [safeModeEnabled, setSafeModeEnabled] = useKV<boolean>('settings-safe-mode-enabled', true)
  const [apiKey, setApiKey] = useKV<string>('gemini-api-key', '')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null)
  
  const { triggerHaptic } = useHapticFeedback()
  const { playSound } = useSoundEffects()

  const checkOwnership = async () => {
    // TODO: Replace with actual ownership check
    setIsOwner(true)
  }

  const loadUsageStats = useCallback(async () => {
    const stats = await getUsageStats()
    setUsageStats(stats)
  }, [])

  useEffect(() => {
    checkOwnership()
    loadUsageStats()
  }, [loadUsageStats])

  const handleResetStats = async () => {
    await resetUsageStats()
    await loadUsageStats()
    toast.success("Usage statistics reset")
  }

  const handleSaveApiKey = () => {
    // Force a reload to ensure the new key is picked up by the GeminiCore singleton
    triggerHaptic('success')
    toast.success('API Key saved', {
      description: 'Reloading app to apply changes...',
    })
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast.error('API Key is empty', {
        description: 'Please paste your API key before testing.',
      });
      return;
    }

    setIsTestingConnection(true);
    const toastId = toast.loading('Testing connection...');

    try {
      // Use the key from the input field directly for the test
      const testGemini = new GeminiCore(apiKey);
      await testGemini.generateContent('test'); // A minimal request

      toast.success('Connection Successful', {
        id: toastId,
        description: 'Your API key is valid and working.',
        icon: <WifiHigh size={16} />,
      });
    } catch (error: any) {
      console.error('API Connection Test Failed:', error);
      toast.error('Connection Failed', {
        id: toastId,
        description: error.message || 'Please check the key and try again.',
        icon: <WifiSlash size={16} />,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

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
        'habits-list', 'financial-transactions', 'financial-profile', 'tasks-list',
        'workouts-list', 'workouts-history', 'knox-messages',
        'shopping-list', 'calendar-events', 'golf-swings'
      ]
      // This is a client-side app, so we can clear localStorage directly
      // This is a simplified approach. A more robust solution would use the useKV hook's clear method if it existed.
      for (const key of dataKeys) {
        localStorage.removeItem(key)
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

  if (!isOwner) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">⚙️ Settings</h1>
        <p className="text-muted-foreground">
          Only the app owner can configure these settings.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">⚙️ Settings</h1>
      <p className="text-muted-foreground">
        Configure the machinery of your digital existence.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>User Experience</CardTitle>
          <CardDescription>
            Customize haptic feedback and sound effects for interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Vibrate className="text-primary" size={20} />
                <Label htmlFor="haptic-toggle" className="font-medium cursor-pointer">
                  Haptic Feedback
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Subtle vibrations for key actions.
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
                <Label htmlFor="sound-toggle" className="font-medium cursor-pointer">
                  Sound Effects
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Audio feedback for major interactions.
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

      <Card>
        <CardHeader>
          <CardTitle>Safety & Security</CardTitle>
          <CardDescription>
            Extra layers of protection for your account and data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="safe-mode-toggle" className="font-medium cursor-pointer flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Safe Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Require extra confirmation for destructive actions.
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

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Manage your connection to Google's Gemini AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="font-medium flex items-center gap-2">
              <Key size={20} className="text-primary" />
              Gemini API Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="Paste your API key here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                variant="outline"
              >
                {isTestingConnection ? 'Testing...' : 'Test'}
              </Button>
              <Button onClick={handleSaveApiKey}>Save</Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <LinkSimple size={14} />
              Need a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one from Google AI Studio</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {usageStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Usage Statistics</CardTitle>
                <CardDescription>
                  Track your AI provider usage and costs.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetStats}>
                Reset Stats
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle className="text-primary" size={20} />
                <h4 className="font-semibold">{GeminiCore.getModelName()}</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests:</span>
                  <span className="font-medium">{usageStats.requests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens:</span>
                  <span className="font-medium">{usageStats.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Cost:</span>
                  <span className="font-medium">${usageStats.cost.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Estimated Cost:</span>
              <span className="text-lg font-bold">
                ${usageStats.cost.toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Warning className="text-destructive" size={24} />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that will permanently delete your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Trash className="text-destructive" size={18} />
              Clear All Data
            </h4>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all module data. This action cannot be undone.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full mt-4 gap-2">
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
                <AlertDialogDescription>
                  This action cannot be undone. All data for all modules will be permanently deleted.
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
