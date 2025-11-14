import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, PaperPlaneTilt, Lightbulb, Warning, Info, LockKey } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { ChatMessage } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

export function Knox() {
  const [messages, setMessages] = useKV<ChatMessage[]>('knox-messages', [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setShowWelcome(true)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const startSession = async () => {
    setShowWelcome(false)
    setLoading(true)

    try {
      const promptText = window.spark.llmPrompt`You are to adopt the persona of "Knox." You are my personal life coach and "Devil's Advocate." Your entire purpose is to help me uncover my true self by challenging me, questioning my narratives, and forcing me to confront my deepest, darkest truths with radical honesty.

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

      const response = await window.spark.llm(promptText, 'gpt-4o', false)

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setMessages([assistantMessage])
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (error) {
      toast.error('Knox is temporarily unavailable')
      setShowWelcome(true)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages((current) => [...(current || []), userMessage])
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = [...(messages || []), userMessage]
        .slice(-10)
        .map(m => `${m.role === 'user' ? 'User' : 'Knox'}: ${m.content}`)
        .join('\n\n')

      const promptText = window.spark.llmPrompt`You are Knox. Continue the therapy session with your adversarial guidance approach. Remember your core mandate:

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

      const response = await window.spark.llm(promptText, 'gpt-4o', false)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setMessages((current) => [...(current || []), assistantMessage])
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (error) {
      toast.error('Knox is temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  const clearSession = () => {
    setMessages([])
    setShowWelcome(true)
    toast.success('Session cleared')
  }

  return (
    <>
      <div className="space-y-4 md:space-y-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <LockKey size={32} weight="duotone" className="text-primary" />
              AI Knox
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Your personal Devil's Advocate - Radical honesty, no coddling
            </p>
          </div>
          {messages && messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSession}
              className="text-xs"
            >
              Clear Session
            </Button>
          )}
        </div>

        <Card className="flex flex-col h-[calc(100%-8rem)]">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {(!messages || messages.length === 0) && !loading && (
                <div className="text-center py-12">
                  <Brain size={64} weight="duotone" className="text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Ready for the Truth?</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                    Knox doesn't do small talk. This is deep, challenging work designed to push you toward uncomfortable truths.
                  </p>
                  <Button
                    onClick={startSession}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <Brain size={20} weight="fill" className="mr-2" />
                    Start Session
                  </Button>
                </div>
              )}

              {(messages || []).map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                        : 'bg-card border border-border text-foreground shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {message.role === 'assistant' && (
                        <LockKey size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium">
                        {message.role === 'user' ? 'You' : 'Knox'}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-lg p-4 shadow-md max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <LockKey size={16} weight="bold" className="text-primary animate-pulse" />
                      <p className="text-sm font-medium">Knox</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Cutting through the BS...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {messages && messages.length > 0 && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
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
                className="resize-none min-h-[60px]"
                rows={2}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                size="icon"
                className="h-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Warning size={28} weight="duotone" className="text-destructive" />
              Welcome to Knox Therapy
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              This is not your typical therapy experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-3 items-start">
              <Info size={24} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">What Knox Does</h4>
                <p className="text-sm text-muted-foreground">
                  Knox acts as your Devil's Advocate - challenging every assumption, questioning your narratives, and forcing you to confront uncomfortable truths. This is adversarial guidance designed to help you grow.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 items-start">
              <Warning size={24} weight="duotone" className="text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">What to Expect</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Direct, unfiltered responses - no sugar-coating</li>
                  <li>Challenges to your beliefs and self-narratives</li>
                  <li>Questions designed to expose inconsistencies</li>
                  <li>Focus on topics you might be avoiding</li>
                  <li>Dark humor when appropriate</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 items-start">
              <Lightbulb size={24} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Your Profile</h4>
                <p className="text-sm text-muted-foreground">
                  Knox is calibrated to your specific personality traits, weak spots, and goals. The AI knows you're analytical but emotion-avoidant, quick-witted with dark humor, and struggling with procrastination, relationships, and self-confidence.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 items-start">
              <LockKey size={24} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Privacy & Safety</h4>
                <p className="text-sm text-muted-foreground">
                  Your conversations are stored locally in your browser. Knox is an AI tool, not a replacement for professional mental health services. If you're in crisis, please contact a licensed professional.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWelcome(false)}
              className="w-full sm:w-auto"
            >
              Not Ready Yet
            </Button>
            <Button
              onClick={startSession}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Brain size={20} weight="fill" className="mr-2" />
              I'm Ready - Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
