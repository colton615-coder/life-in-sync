// src/components/accountant/AccountantChat.tsx
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { useRef, useEffect, useState } from 'react';

// Define the structure for a chat message
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Define the structure for an expense
export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface AccountantChatProps {
  messages: ChatMessage[];
  // budget and expenses are reserved for future AI integration
  budget: number;
  expenses: Expense[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function AccountantChat({ messages, onSendMessage, isLoading, budget, expenses }: AccountantChatProps) {
  // Note: budget and expenses are passed via props for future AI integration
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4 glass-card rounded-lg flex flex-col h-[500px]">
      <div
        className="flex-grow space-y-4 overflow-y-auto pr-2"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-white/5' : 'bg-cyan-500/10'}`}>
            <p className={`font-bold ${msg.sender === 'ai' ? 'text-cyan-400' : 'text-slate-200'}`}>
              {msg.sender === 'ai' ? 'The Accountant' : 'You'}
            </p>
            <p className="text-sm">{msg.text}</p>
          </div>
        ))}
        {isLoading && (
            <div className="p-3 bg-white/5 rounded-lg">
                <p className="font-bold text-cyan-400">The Accountant</p>
                <p className="text-sm animate-pulse">Thinking...</p>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <Textarea
          placeholder="Ask a question about your budget..."
          className="flex-grow glass-morphic"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" className="h-full" disabled={isLoading} aria-label="Send message">
          <PaperPlaneRight className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
