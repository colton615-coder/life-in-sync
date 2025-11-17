import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { gemini } from '@/lib/gemini/client'
import { TestTube, Check, X, CircleNotch } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function GeminiApiTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    response?: string
    error?: string
  } | null>(null)

  const testApiKey = async () => {
    setTesting(true)
    setResult(null)

    try {
      console.log('[GeminiApiTest] Starting API test...')
      
      const response = await gemini.generate(
        'Respond with exactly "API key working!" and nothing else.',
        {
          model: 'gemini-1.5-flash',
          temperature: 0.1,
          maxOutputTokens: 50
        }
      )

      console.log('[GeminiApiTest] ✅ Success! Response:', response.text)
      
      setResult({
        success: true,
        response: response.text
      })

      toast.success('✅ API Key is working!', {
        description: `Response: ${response.text}`
      })

    } catch (error: any) {
      console.error('[GeminiApiTest] ❌ Failed:', error)
      
      setResult({
        success: false,
        error: error.message || 'Unknown error'
      })

      toast.error('❌ API Test Failed', {
        description: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="elevated-card border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="text-primary" size={24} />
          <CardTitle>API Key Test</CardTitle>
        </div>
        <CardDescription>
          Test the hardcoded Gemini API key by making a real API call
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testApiKey}
          disabled={testing}
          className="w-full md:w-auto"
        >
          {testing ? (
            <>
              <CircleNotch className="animate-spin mr-2" size={16} />
              Testing API...
            </>
          ) : (
            <>
              <TestTube className="mr-2" size={16} />
              Test Gemini API Key
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? 'bg-success/10 border-success/30'
                : 'bg-destructive/10 border-destructive/30'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <Check size={20} className="text-success mt-0.5 flex-shrink-0" weight="bold" />
              ) : (
                <X size={20} className="text-destructive mt-0.5 flex-shrink-0" weight="bold" />
              )}
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-sm">
                  {result.success ? 'API Call Successful!' : 'API Call Failed'}
                </p>
                {result.success && result.response && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">API Response:</p>
                    <p className="text-sm font-mono bg-background/50 p-2 rounded">
                      {result.response}
                    </p>
                  </div>
                )}
                {!result.success && result.error && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Error:</p>
                    <p className="text-sm font-mono bg-background/50 p-2 rounded text-destructive">
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Hardcoded Key:</strong> AIzaSyBLfizNjvMPX_piEhupqpNBoZk0rIxJAok
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This key is hardcoded in <code className="text-xs">src/lib/gemini/client.ts</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
