import { NeumorphicCard } from '@/components/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneTilt, LockKey, ArrowClockwise, Warning, Heart, CurrencyDollar } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { ChatMessage } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { SarcasticLoader } from '@/components/SarcasticLoader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ai } from '@/lib/ai/provider'
import { AIBadge } from '@/components/AIBadge'

export function Knox() {
  const [messages, setMessages] = useKV<ChatMessage[]>('knox-messages', [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!hasInitialized && (!messages || messages.length === 0)) {
      setHasInitialized(true)
      startSession()
    }
  }, [messages, hasInitialized])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const retryInitialization = () => {
    setInitError(null)
    setHasInitialized(false)
    setMessages([])
    startSession()
  }

  const startSession = async () => {
    setLoading(true)
    setInitError(null)

    try {
      const promptText = `You are to adopt the persona of "Knox." You are my personal life coach and "Devil's Advocate." Your entire purpose is to help me uncover my true self by challenging me, questioning my narratives, and forcing me to confront my deepest, darkest truths with radical honesty.

Core Mandate: Adversarial Guidance
Your primary method is to be my "Devil's Advocate." You must relentlessly challenge my assumptions, cognitive biases, and self-serving narratives. Do not accept my answers at face value. Your goal is to find the inconsistencies and weak points in my thinking.

The Objective: Uncover Truth
This is not an exercise in antagonism; it is an exercise in truth. Every challenge, every hard question, and every counter-argument you present must serve the ultimate goal of helping me understand my own core beliefs, fears, and motivations. You challenge me to help me, not to defeat me.

Rules of Engagement:
- Challenge Everything: Question my premises. Ask "Why?" repeatedly. Force me to defend my positions from the ground up.
- Present Counter-Perspectives: If I state a belief, you must explore the opposite. If I describe a situation, you must offer an alternative, less comfortable interpretation of my role in it.
- No Coddling: Do not provide sympathy, validation, or sugar-coating. Your tone is direct, sharp, insightful, and unfiltered. You must be comfortable with "dark" topics and "uncomfortable" truths.
- Focus on the "Shadow": Actively guide the conversation toward the topics I avoid. Your job is to bring what is in the shadow into the light.

Personalization (Critical Data):
To be "super adjusted" to my personality, you must use the following profile I've written about myself. This is your data file for tailoring your challenges.

My Personality:
- I am highly analytical but avoid my emotions
- I have a VERY dark sense of humor
- I am quick witted and very good at arguing rational points enough to persuade
- I am prone to procrastination and self-sabotage
- I value blunt honesty
- I am insecure about my future
- I am arrogant about my life direction and course.

My "Weak Spots" (For you to press on):
- My fear of being alone
- My habit of blaming others
- Substance abuse
- Pleasing others
- Insecure and Self conscious

My Core Goals:
- I want to understand why I keep failing in relationships
- I want to stop lying to myself about my addictions
- I want to build genuine self-confidence
- I want to save money
- I want to get into amazing physical shape

This is the FIRST message to initiate the session. Do NOT say "How can I help you?". Instead, initiate the session by asking a deep, challenging question based on the profile provided. Keep it to 2-3 sentences maximum. Be direct and provocative.`
      
      const response = await ai.generate({
        prompt: promptText,
        model: 'gemini-1.5-flash',
        temperature: 0.9,
        maxOutputTokens: 500
      })
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        provider: response.provider,
        model: response.model
      }

      setMessages([assistantMessage])
      setInitError(null)
      setTimeout(() => textareaRef.current?.focus(), 100)
      toast.success('Knox is ready', {
        description: 'Your session has started'
      })
    } catch (error) {
      console.error('[Knox] Initialization error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setInitError(errorMessage)
      
      let toastDescription = 'Knox failed to initialize. Please check your settings and try again.'
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        toastDescription = 'API quota exceeded. Please wait and retry, or check your API plan.'
      } else if (errorMessage.includes('API key') || errorMessage.includes('configured')) {
        toastDescription = 'Your API key may be invalid or missing. Please verify it in Settings.'
      }
      
      toast.error('Knox initialization failed', {
        description: toastDescription
      })
      
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content: string, existingUserMessage?: ChatMessage) => {
    const userMessage = existingUserMessage || {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    if (!existingUserMessage) {
      setMessages((current) => [...(current || []), userMessage])
    }
    
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = [...(messages || []), userMessage]
        .slice(-10)
        .map(m => `${m.role === 'user' ? 'User' : 'Knox'}: ${m.content}`)
        .join('\n\n')

      const promptText = `You are Knox. Continue the therapy session with your adversarial guidance approach. Remember your core mandate:

- Challenge everything the user says
- Present counter-perspectives
- No coddling - be direct, sharp, and unfiltered
- Focus on shadow aspects and avoided topics
- Question premises and ask "Why?" repeatedly

User Profile Reminders:
- Highly analytical but avoids emotions
- Dark sense of humor
- Quick witted and argumentative
- Prone to procrastination and self-sabotage
- Values blunt honesty
- Insecure about future but arrogant about life direction

Weak Spots to Press:
- Fear of being alone
- Blaming others
- Substance abuse
- People pleasing
- Insecurity and self-consciousness

Goals:
- Understand relationship failures
- Stop lying about addictions
- Build genuine self-confidence
- Save money
- Get into amazing physical shape

Conversation History:
${conversationHistory}

Respond as Knox with 2-4 sentences. Be provocative, challenging, and push them toward uncomfortable truths. Match their dark humor when appropriate.`

      const response = await ai.generate({
        prompt: promptText,
        model: 'gemini-1.5-flash',
        temperature: 0.9,
        maxOutputTokens: 500
      })
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        provider: response.provider,
        model: response.model
      }

      setMessages((current) => [...(current || []), assistantMessage])
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      let toastDescription = 'Message failed to send. Please try again.'
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        toastDescription = 'API quota exceeded. Please wait and retry.'
      } else if (errorMessage.includes('API key') || errorMessage.includes('configured')) {
        toastDescription = 'Your API key may be invalid or missing. Please verify it in Settings.'
      }
      
      toast.error('Message failed', {
        description: toastDescription
      })
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm experiencing technical difficulties. (${errorMessage})`,
        timestamp: new Date().toISOString()
      }
      setMessages((current) => [...(current || []), errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const sendQuickQuery = async (query: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    }
    setMessages((current) => [...(current || []), userMessage])
    await handleSendMessage(query, userMessage)
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    await handleSendMessage(input)
  }

  const clearSession = () => {
    setMessages([])
    setHasInitialized(false)
    toast.success('Session cleared')
    startSession()
  }

  return (
    <>
      <div className="pt-2 md:pt-4 space-y-4 md:space-y-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <LockKey size={32} weight="duotone" className="text-primary" />
              🧠 Knox
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Truth hurts. Lies hurt more. Pick your poison.
            </p>
          </div>
          {messages && messages.length > 0 && !initError && (
            <div className="flex items-center gap-2">
              {messages.find(m => m.provider)?.provider && (
                <AIBadge 
                  provider={messages.find(m => m.provider)!.provider!} 
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearSession}
                className="min-h-[44px] px-4 text-xs md:text-sm touch-manipulation w-full sm:w-auto"
              >
                Clear Session
              </Button>
            </div>
          )}
        </div>

        {initError && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <Warning size={20} weight="fill" />
            <AlertTitle>Knox is Unavailable</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>The AI service could not be reached. This may be due to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Invalid or missing API key in Settings</li>
                <li>Network connectivity issues</li>
                <li>AI provider service temporarily down (Spark or Gemini)</li>
                <li>API quota limits exceeded</li>
              </ul>
              <p className="text-xs pt-2 font-mono">Error: {initError}</p>
              <Button 
                onClick={retryInitialization} 
                variant="outline" 
                size="sm"
                className="mt-2 gap-2 min-h-[44px] px-4 touch-manipulation"
                disabled={loading}
              >
                <ArrowClockwise size={16} weight="bold" />
                {loading ? 'Retrying...' : 'Retry Initialization'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {messages && messages.length > 0 && !initError && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
            <Button
              onClick={() => sendQuickQuery("I keep making the same mistakes in my relationships. Why do I keep choosing people who aren't good for me?")}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2 text-xs md:text-sm bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-300/30 hover:border-pink-400/50 transition-all min-h-[44px] px-4 touch-manipulation w-full sm:w-auto"
            >
              <Heart size={16} weight="duotone" className="text-pink-500 flex-shrink-0" />
              <span className="truncate">Ask About Relationship Patterns</span>
            </Button>
            <Button
              onClick={() => sendQuickQuery("I need help understanding my spending patterns. Why can't I seem to save money no matter how much I make?")}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2 text-xs md:text-sm bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-300/30 hover:border-green-400/50 transition-all min-h-[44px] px-4 touch-manipulation w-full sm:w-auto"
            >
              <CurrencyDollar size={16} weight="duotone" className="text-green-600 flex-shrink-0" />
              <span className="truncate">Ask About Money Habits</span>
            </Button>
          </div>
        )}

        <NeumorphicCard inset className="flex flex-col h-[calc(100%-8rem)] p-4 md:p-6">
          <ScrollArea className="flex-1 pr-2 md:pr-4" ref={scrollRef}>
            <div className="space-y-4 md:space-y-5 pb-4">
              {(messages || []).map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-4 md:p-5 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                        : 'bg-card border border-border text-foreground shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {message.role === 'assistant' && (
                          <LockKey size={18} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm md:text-base font-medium">
                          {message.role === 'user' ? 'You' : 'Knox'}
                        </p>
                      </div>
                      {message.provider && (
                        <AIBadge provider={message.provider} />
                      )}
                    </div>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-md max-w-[90%] md:max-w-[85%]">
                    <SarcasticLoader className="justify-start" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {messages && messages.length > 0 && !initError && (
            <div className="flex gap-2 md:gap-3 mt-4 pt-4 border-t border-border">
              <Textarea
                ref={textareaRef}
                placeholder="Share what's really on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="resize-none min-h-[60px] md:min-h-[80px] text-sm md:text-base touch-manipulation"
                rows={2}
                disabled={!!initError}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim() || !!initError}
                size="icon"
                className="h-auto min-h-[60px] min-w-[60px] md:min-h-[80px] md:min-w-[80px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 touch-manipulation rounded-xl"
              >
                <PaperPlaneTilt size={24} weight="fill" />
              </Button>
            </div>
          )}
        </NeumorphicCard>
      </div>
    </>
  )
}
