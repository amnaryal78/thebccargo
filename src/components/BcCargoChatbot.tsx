import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Package, 
  MapPin, 
  PhoneCall, 
  FileText,
  AlertCircle,
  CheckCircle2,
  CornerDownLeft
} from 'lucide-react';
import { ChatMessage, ChatAction, ChatbotSettings, ChatbotSuggestion } from '../types/chatbot';
import { 
  getChatbotSettings, 
  getSuggestions, 
  processChatMessage 
} from '../services/chatbotService';
import { ServiceMode } from '../types';

import { TurnstileWidget } from './TurnstileWidget';
import { Spotlight } from './ui/spotlight';

interface BcCargoChatbotProps {
  onNavigate: (page: string) => void;
  onSearchTrack: (trackingCode: string, mode?: ServiceMode) => void;
}

export const BcCargoChatbot: React.FC<BcCargoChatbotProps> = ({
  onNavigate,
  onSearchTrack
}) => {
  const [settings, setSettings] = useState<ChatbotSettings>(() => getChatbotSettings());
  const [suggestions, setSuggestions] = useState<ChatbotSuggestion[]>(() => getSuggestions().filter(s => s.enabled));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Welcome Message
  useEffect(() => {
    const freshSettings = getChatbotSettings();
    setSettings(freshSettings);
    setSuggestions(getSuggestions().filter(s => s.enabled));
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: freshSettings.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Price', type: 'navigate', payload: 'rates' },
          { label: 'WhatsApp', type: 'whatsapp', payload: '9779855019485' },
          { label: 'Call', type: 'call', payload: '+9779855019485' },
        ]
      }
    ]);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    // Skip the welcome message: scrolling on page load would pull the whole page down to the chat.
    if (messages.length <= 1 && !isLoading) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await processChatMessage(query, messages, turnstileToken);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, but I encountered a temporary connection issue. Please message our team on WhatsApp or call our Hetauda office.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          actions: [
            { label: 'WhatsApp', type: 'whatsapp', payload: '9779855019485' },
            { label: 'Call', type: 'call', payload: '+9779855019485' }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const freshSettings = getChatbotSettings();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: freshSettings.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Price', type: 'navigate', payload: 'rates' },
          { label: 'WhatsApp', type: 'whatsapp', payload: '9779855019485' },
          { label: 'Call', type: 'call', payload: '+9779855019485' },
        ]
      }
    ]);
  };

  const handleActionClick = (action: ChatAction) => {
    switch (action.type) {
      case 'whatsapp':
        window.open(action.payload.startsWith('http') ? action.payload : `https://wa.me/${action.payload.replace(/[^0-9]/g, '')}`, '_blank', 'noopener,noreferrer');
        break;
      case 'track':
        onSearchTrack(action.payload);
        break;
      case 'navigate':
      case 'book':
        onNavigate(action.payload);
        break;
      case 'contact':
        onNavigate('contact');
        break;
      case 'call':
        window.location.href = `tel:${action.payload}`;
        break;
      default:
        onNavigate(action.payload);
    }
  };

  if (!settings.enabled) return null;

  return (
    <section 
      id="bc-cargo-ai-chatbot" 
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
    >
      {/* Outer Card Wrapper */}
      <Spotlight
        intensity="strong"
        className="relative rounded-[var(--r-lg)] bg-white border border-[var(--line)] shadow-hard-md overflow-hidden transition-all"
      >

        {/* 1. Chatbot Header */}
        <div className="relative z-10 px-6 py-4 bg-white border-b border-[var(--line)] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-[var(--r-sm)] bg-[#002147] border border-[#F2B705]/40 flex items-center justify-center text-[#F2B705] shadow-hard-xs">
              <Bot className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-hard-xs" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-[#002147] tracking-tight">
                  {settings.name}
                </h3>
              </div>
              <span className="text-[12px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                AI assistant. Prices come from our live rates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-[var(--r-xs)] bg-[#EEF3F9] hover:bg-[#D6E1EF] text-[#002147] transition-all shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer text-xs inline-flex items-center justify-center gap-1.5 font-mono border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
              title="Reset Conversation"
              aria-label="Reset Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* 2. Messages Stream */}
        <div className="relative z-10 p-4 sm:p-6 min-h-[240px] max-h-[520px] overflow-y-auto space-y-4 font-sans bg-[#F6F9FD]">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-[var(--r-xs)] bg-[#002147] border border-[#F2B705]/30 text-white flex items-center justify-center shrink-0 mb-1 shadow-hard-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-[var(--r-md)] text-xs sm:text-sm leading-relaxed shadow-hard-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#002147] text-white border border-white/10 rounded-br-none'
                      : msg.isFallback
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-none'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                      : 'bg-white text-[#121211] border border-[var(--line)] shadow-sm rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Actions Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 pt-3 mt-3 border-t border-[var(--line)]">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="min-h-[40px] px-3.5 py-2 rounded-[var(--r-xs)] bg-[#EEF3F9] hover:bg-[#D6E1EF] text-[#002147] font-mono text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-hard-xs border border-white/10 hover:border-white/30 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#8C6400]" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[9px] font-mono opacity-60 text-right mt-1.5">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono py-2 px-1">
              <div className="w-7 h-7 rounded bg-[#002147] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-1.5 bg-white px-4 py-2.5 rounded-xl border border-[var(--line)]">
                <span className="w-2 h-2 rounded-full bg-[#F2B705] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#F2B705] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-slate-600 ml-1">Searching approved BC Cargo knowledge...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 3. Suggested Questions Toolbar */}
        <div className="relative z-10 px-4 sm:px-6 py-3 bg-white border-t border-[var(--line)] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-[#F2B705] shrink-0" />
          <span className="text-[10px] font-mono font-bold uppercase text-slate-600 shrink-0">
            Suggested:
          </span>
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => handleSend(s.text)}
              disabled={isLoading}
              className="min-h-[38px] px-3.5 py-1.5 rounded-[var(--r-xs)] bg-[#EEF3F9] hover:bg-[#002147] text-[#002147] hover:text-white text-xs font-medium transition-all duration-[var(--t-fast)] whitespace-nowrap border border-slate-700 hover:border-[#F2B705] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
            >
              {s.text}
            </button>
          ))}
        </div>

        {/* 4. Input Console Form */}
        <div className="relative z-10 p-4 bg-white border-t border-[var(--line)]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-transparent p-2 rounded-[var(--r-sm)] border border-[var(--line)] focus-within:border-[#F2B705] focus-within:ring-2 focus-within:ring-[#F2B705]/40 clay-inset transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={settings.inputPlaceholder}
              disabled={isLoading}
              className="flex-1 min-h-[44px] bg-transparent px-3 py-2 text-xs sm:text-sm text-[#121211] placeholder:text-slate-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="min-h-[44px] px-5 py-2.5 rounded-[var(--r-xs)] bg-[#F2B705] hover:bg-[#FAC623] disabled:bg-slate-200 text-[#002147] disabled:text-slate-500 text-xs font-semibold uppercase tracking-wider transition-all duration-[var(--t-fast)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              AI answers can be wrong. For anything important, call or chat with our team.
            </span>
            <span className="hidden sm:inline text-slate-500">
              Press Enter to send
            </span>
          </div>

          {/* Turnstile Anti-bot Protection Widget */}
          <TurnstileWidget onVerify={(tok) => setTurnstileToken(tok)} className="hidden" />
        </div>

      </Spotlight>
    </section>
  );
};
