import { useState, useRef, useEffect } from 'react';
import { FinancialAudit } from '@/types/accountant';
import { AccountantService } from '@/services/accountant/accountant-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/Card';
import { Send, X, BrainCircuit, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface AccountantConsultationProps {
  audit: FinancialAudit;
  setAudit: (audit: FinancialAudit) => void;
  onClose: () => void;
}

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  intentAction?: string; // e.g. "Logged $50 to Food"
};

export function AccountantConsultation({ audit, setAudit, onClose }: AccountantConsultationProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "I am The Accountant. I'm reviewing your latest ledger. What do you need? You can tell me about new spending or ask for advice."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: uuidv4(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const accountant = new AccountantService();

      // Prepare history for API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      history.push({ role: 'user', text: userMsg.text });

      const result = await accountant.consultAccountant(history, audit);

      if (result.success) {
        let responseText = result.data.reply;
        let intentActionStr = undefined;

        // Handle Intent (Transaction Logging)
        if (result.data.intent && result.data.intent.type === 'log_transaction') {
            const { category, amount, item } = result.data.intent;

            // Find category
            const catIndex = audit.categories.findIndex(c => c.name.toLowerCase().includes(category.toLowerCase()));

            if (catIndex >= 0) {
                // Add to existing category (create a new subcategory item)
                const targetCat = audit.categories[catIndex];
                const newSub = { id: uuidv4(), name: item, amount: amount };

                const updatedCategories = [...audit.categories];
                updatedCategories[catIndex] = {
                    ...targetCat,
                    subcategories: [...targetCat.subcategories, newSub]
                };

                setAudit({
                    ...audit,
                    categories: updatedCategories,
                    lastUpdated: new Date().toISOString()
                });

                intentActionStr = `Logged: $${amount} for "${item}" in ${targetCat.name}`;
                toast.success(`Transaction Logged: $${amount} to ${targetCat.name}`);
            } else {
                responseText += `\n\n(I tried to log this transaction, but I couldn't find a category matching "${category}". Please create it first.)`;
            }
        }

        const modelMsg: Message = {
            id: uuidv4(),
            role: 'model',
            text: responseText,
            intentAction: intentActionStr
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        toast.error("The Accountant is offline temporarily.");
        setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: "Connection error. Please try again." }]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col glass-card border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-900/20">

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-400">
                <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
                <h2 className="font-bold text-lg text-white">The Accountant</h2>
                <p className="text-xs text-cyan-400/80 uppercase tracking-widest">Consultation Mode</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user'
                    ? "bg-cyan-600 text-white rounded-tr-none"
                    : "bg-white/10 text-slate-200 rounded-tl-none border border-white/5"
                )}
              >
                {msg.text}
              </div>

              {/* Intent Action Feedback */}
              {msg.intentAction && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/20">
                      <CheckCircle className="h-3 w-3" /> {msg.intentAction}
                  </div>
              )}
            </div>
          ))}
          {isLoading && (
              <div className="mr-auto bg-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150" />
              </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/40">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ex: 'Spent $50 on gas' or 'How can I save more?'"
              className="glass-morphic bg-white/5 border-white/10 focus:border-cyan-500/50 h-12"
              autoFocus
            />
            <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
