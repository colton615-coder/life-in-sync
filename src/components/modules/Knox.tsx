import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, PaperPlaneTilt } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { ChatMessage } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'

export function Knox() {
  const [messages, setMessages] = useKV<ChatMessage[]>('knox-messages', [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

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
        .slice(-6)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n')

      const promptText = `You are Knox, a therapeutic AI coach with a tough-love persona. You provide direct, honest, empathetic guidance without sugar-coating. Be supportive but challenge users to grow. Keep responses concise (2-3 sentences).

Conversation:
${conversationHistory}

Respond as Knox:`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', false)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setMessages((current) => [...(current || []), assistantMessage])
    } catch (error) {
      toast.error('Knox is temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Knox</h1>
        <p className="text-muted-foreground mt-2">Your therapeutic AI coach with tough love</p>
      </div>

      <Card className="flex flex-col h-[calc(100%-8rem)]">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {(!messages || messages.length === 0) && (
              <div className="text-center py-12">
                <Brain size={48} weight="duotone" className="text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Talk to Knox</h3>
                <p className="text-muted-foreground">Share what's on your mind. Knox is here to help.</p>
              </div>
            )}
            {(messages || []).map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg p-4">
                  <p className="text-sm">Knox is thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Textarea
            placeholder="What's on your mind?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-auto"
          >
            <PaperPlaneTilt size={20} />
          </Button>
        </div>
      </Card>
    </div>
  )
}
