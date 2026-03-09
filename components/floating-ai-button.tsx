'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { theme } from '@/lib/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  chips?: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: "Hi! I'm your AI Trip Planner 👋 Let's plan your perfect trip. Where would you like to go?",
    chips: ['Beach Destination', 'City Explorer', 'Mountain Retreat', 'Cultural Tour'],
  },
];

const aiFlow: Record<string, { text: string; chips?: string[] }> = {
  default_1: {
    text: "Great choice! How many days are you planning for this trip?",
    chips: ['1–3 Days', '4–7 Days', '1–2 Weeks', '2+ Weeks'],
  },
  default_2: {
    text: "Nice! What's your travel style?",
    chips: ['Budget-friendly', 'Mid-range', 'Luxury', 'Backpacker'],
  },
  default_3: {
    text: "Perfect! What kind of activities do you enjoy?",
    chips: ['Food & Dining', 'Sightseeing', 'Adventure', 'Relaxation', 'Shopping'],
  },
  default_4: {
    text: "Awesome! I'm putting together some great recommendations for you. Would you like me to suggest specific locations to add to your itinerary?",
    chips: ['Yes, show me!', 'Maybe later'],
  },
  default_5: {
    text: "Here are some top picks based on your preferences! You can add them to your trip from the Explore section. Anything else I can help with?",
    chips: ['Start over', 'Add more days', 'Change destination'],
  },
};

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    const nextStep = step + 1;
    const flowKey = `default_${nextStep}` as keyof typeof aiFlow;
    const response = aiFlow[flowKey] ?? {
      text: "That's helpful! Feel free to explore the map and add locations to your trip. I'm here if you need more suggestions.",
    };

    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', ...response }]);
      setStep(nextStep);
    }, 600);
  };

  const handleOpen = () => {
    if (!isOpen) {
      setMessages(initialMessages);
      setStep(0);
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-1">
        <button
          onClick={handleOpen}
          className="w-14 h-14 bg-white hover:bg-gray-50 shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:shadow-xl rounded-full"
          aria-label="AI Trip Planner"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
            <ellipse cx="12" cy="12" rx="4.5" ry="9" strokeDasharray="3 2" />
            <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 2" />
            <path d="M17 7.5l-2.5 1.5 1 1-3 5 1.5.5 3-5 1 1L17 7.5z" fill="#3274A4" stroke="none" />
          </svg>
        </button>
        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">AI Trip Planner</span>
      </div>

      {isOpen && (
        <div
          className="fixed bottom-16 right-6 z-40 w-96 bg-white flex flex-col overflow-hidden"
          style={{ height: '520px', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accentLight }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.accent }}>
                  <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
                  <ellipse cx="12" cy="12" rx="4.5" ry="9" strokeDasharray="3 2" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 2" />
                  <path d="M17 7.5l-2.5 1.5 1 1-3 5 1.5.5 3-5 1 1L17 7.5z" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">AI Trip Planner</p>
                <p className="text-xs text-gray-400 leading-tight">Ask me anything about your trip</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ backgroundColor: theme.accentLight }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.accent }}>
                        <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
                        <ellipse cx="12" cy="12" rx="4.5" ry="9" strokeDasharray="3 2" />
                        <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 2" />
                        <path d="M17 7.5l-2.5 1.5 1 1-3 5 1.5.5 3-5 1 1L17 7.5z" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed ${message.sender === 'user' ? 'text-white' : 'bg-gray-100 text-gray-800'}`}
                    style={{
                      borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      ...(message.sender === 'user' ? { backgroundColor: theme.accent } : {}),
                    }}
                  >
                    {message.text}
                  </div>
                </div>
                {/* Quick reply chips */}
                {message.chips && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                    {message.chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        className="px-3 py-1.5 text-xs font-medium border transition-all hover:text-white"
                        style={{
                          borderRadius: '9999px',
                          borderColor: theme.accent,
                          color: theme.accent,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = theme.accent;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.accent;
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0">
            <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-4 py-2.5" style={{ borderRadius: '9999px' }}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => sendMessage(inputValue)}
                className="w-7 h-7 flex items-center justify-center text-white transition-colors flex-shrink-0"
                style={{ backgroundColor: theme.accent, borderRadius: '9999px' }}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
