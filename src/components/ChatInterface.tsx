'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Paperclip, Smile, MoreVertical } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello Robin! I'm your Vallarta Vows Assistant. I've noticed 3 new high-value leads today. Would you like me to draft introduction emails for them?",
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking and typing
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm on it! Drafting personalized emails for the leads. I'll also suggest some Instagram captions for your latest venue photos.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-[var(--radius-lg)] shadow-xl overflow-hidden border border-gray-100">
            {/* Chat Header */}
            <div className="bg-[var(--color-primary)] p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Bot size={24} />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[var(--color-primary)] rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold">Vallarta AI</h3>
                        <p className="text-xs text-white/70">Always active • Replies instantly</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            "flex gap-3 max-w-[80%]",
                            message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        {message.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex-shrink-0 flex items-center justify-center text-[var(--color-primary)]">
                                <Bot size={16} />
                            </div>
                        )}

                        <div className={clsx(
                            "p-4 rounded-[var(--radius-md)] shadow-sm text-sm leading-relaxed",
                            message.sender === 'user'
                                ? "bg-[var(--color-secondary)] text-[var(--color-primary)] font-medium rounded-tr-none"
                                : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                        )}>
                            {message.text}
                            <div className={clsx(
                                "text-[10px] mt-2 opacity-50",
                                message.sender === 'user' ? "text-right" : ""
                            )}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 max-w-[80%]"
                    >
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex-shrink-0 flex items-center justify-center text-[var(--color-primary)]">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white p-4 rounded-[var(--radius-md)] rounded-tl-none border border-gray-100 shadow-sm flex gap-1 items-center h-12">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all placeholder:text-gray-400"
                    />
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Smile size={20} />
                    </button>
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
