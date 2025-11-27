// src/components/accountant/AccountantChat.tsx
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
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

export function AccountantChat({ messages, onSendMessage, isLoading }: AccountantChatProps) {
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
    <div className="p-4 glass-card rounded-lg flex flex-col h-full bg-black/20">
      <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-white/5 border border-white/5' : 'bg-cyan-500/10 border border-cyan-500/20 ml-auto'}`}>
            <p className={`font-bold text-xs uppercase mb-1 ${msg.sender === 'ai' ? 'text-cyan-400' : 'text-slate-400'}`}>
              {msg.sender === 'ai' ? 'The Accountant' : 'You'}
            </p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {isLoading && (
            <div className="p-3 bg-white/5 rounded-lg w-fit">
                <p className="font-bold text-xs uppercase text-cyan-400 mb-1">The Accountant</p>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-200" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
        <Textarea
          placeholder="Enter query..."
          className="flex-grow glass-morphic min-h-[50px] max-h-[100px] resize-none font-mono text-sm"
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
        <Button type="submit" size="icon" className="h-10 w-10 bg-cyan-600 hover:bg-cyan-500" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
