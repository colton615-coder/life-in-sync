// src/components/accountant/TheAudit.tsx
import { useState, useRef, useEffect } from 'react';
import { useKV } from '@/hooks/use-kv';
import { FinancialReport, SpendingAnalysisCategory, ProposedBudgetCategoryItem, MoneyManagementTip } from '@/types/financial_report';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { PaperPlaneTilt as Send, ShieldCheck } from '@phosphor-icons/react';
import { Textarea } from '@/components/ui/textarea';
import { GeminiCore } from '@/services/gemini_core';
import { SarcasticLoader } from '@/components/SarcasticLoader';

// Types for the chat interaction
interface ChatMessage {
    id: string;
    sender: 'ai' | 'user';
    content: string; // Markdown supported text
    timestamp: Date;
    // Optional widget data to render alongside the message
    widget?: {
        type: 'spending_analysis' | 'budget_proposal' | 'advice_card';
        data: SpendingAnalysisCategory | ProposedBudgetCategoryItem | MoneyManagementTip;
    };
}

interface TheAuditProps {
    onComplete: () => void;
}

export function TheAudit({ onComplete }: TheAuditProps) {
    const [report] = useKV<FinancialReport | null>('financial-report', null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const geminiRef = useRef<GeminiCore | null>(null);

    // Initialize the conversation
    useEffect(() => {
        if (!report || messages.length > 0) return;

        geminiRef.current = new GeminiCore();

        // Initial Greeting from The Accountant
        const initialMessage: ChatMessage = {
            id: 'init-1',
            sender: 'ai',
            content: `**AUDIT COMPLETE.**\n\nI have analyzed your provided financial data. The situation requires immediate attention. \n\nWe will review your spending habits first. I've identified several areas of concern.`,
            timestamp: new Date()
        };

        // Queue the first specific analysis, if available
        let analysisMessage: ChatMessage;
        if (Array.isArray(report.spendingAnalysis) && report.spendingAnalysis.length > 0) {
            const firstAnalysis = report.spendingAnalysis[0]; // Usually the worst or first one
            analysisMessage = {
                id: 'init-2',
                sender: 'ai',
                content: `Let's look at **${firstAnalysis.category}**. You've spent **$${firstAnalysis.totalSpent.toFixed(2)}**. \n\n${firstAnalysis.aiSummary}`,
                timestamp: new Date(Date.now() + 1000),
                widget: {
                    type: 'spending_analysis',
                    data: firstAnalysis
                }
            };
        } else {
            analysisMessage = {
                id: 'init-2',
                sender: 'ai',
                content: `I could not find any spending analysis data in your report. Please check your financial data or try again.`,
                timestamp: new Date(Date.now() + 1000)
            };
        }

        setMessages([initialMessage, analysisMessage]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report]);

    // Scroll to bottom effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!input.trim() || !geminiRef.current || !report) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Gemini to get the next response
            // We pass the conversation history and the full report context
            const responseText = await geminiRef.current.continueAuditConversation([...messages, userMsg], userMsg.content, report);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                content: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Audit conversation error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                content: "I'm having trouble accessing the secure ledger. Please repeat that.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Render Widget Helper
    const renderWidget = (widget: ChatMessage['widget']) => {
        if (!widget) return null;

        if (widget.type === 'spending_analysis') {
            const data = widget.data as SpendingAnalysisCategory;
            return (
                <Card className="mt-3 bg-white/5 border-l-4 border-l-red-500 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold uppercase text-red-400">{data.category}</h4>
                        <span className="font-mono text-xl">${data.totalSpent}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${data.healthScore < 5 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${data.healthScore * 10}%` }} />
                    </div>
                    <p className="text-xs text-right mt-1 text-muted-foreground">Health Score: {data.healthScore}/10</p>
                </Card>
            );
        }
        return null;
    };

    if (!report) return <SarcasticLoader text="Retrieving dossier..." />;

    return (
        <div className="flex flex-col h-[85vh] max-w-4xl mx-auto">
             <div className="flex-none pb-4 border-b border-white/10 mb-4 flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">THE AUDIT</h1>
                    <p className="text-xs font-mono text-cyan-500">INTERACTIVE REVIEW SESSION</p>
                 </div>
                 {/* Finalize Button - only shows if AI enables it, or for now, always enabled to prevent getting stuck */}
                 <Button
                    onClick={onComplete}
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-950/30"
                >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    FINALIZE PLAN
                 </Button>
             </div>

             {/* Chat Stream */}
             <div
                className="flex-grow overflow-y-auto space-y-6 pr-4 custom-scrollbar pb-4"
                role="log"
                aria-label="Conversation area"
             >
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'bg-cyan-950/40 border border-cyan-500/20' : 'bg-transparent'} rounded-lg p-4`}>
                            {msg.sender === 'ai' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                    <span className="text-xs font-bold text-cyan-400 tracking-wider">THE ACCOUNTANT</span>
                                </div>
                            )}

                            <div className="prose prose-invert prose-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                            </div>

                            {msg.widget && renderWidget(msg.widget)}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-cyan-500/70 ml-4">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                        ANALYZING RESPONSE
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="flex-none pt-4">
                <div className="relative glass-card p-2 flex items-end gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Reply to The Accountant..."
                        className="min-h-[60px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none font-mono text-sm"
                    />
                    <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isTyping}
                        className="mb-1 bg-cyan-600 hover:bg-cyan-500"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
             </div>
        </div>
    );
}
