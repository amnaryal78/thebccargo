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
          { label: 'Our Services', type: 'navigate', payload: 'services' },
          { label: 'Check Shipping Rates', type: 'navigate', payload: 'rates' },
          { label: 'Contact Details', type: 'contact', payload: 'contact' },
        ]
      }
    ]);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const response = await processChatMessage(query, messages);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, but I encountered a temporary connection issue. Please try asking again or contact our support staff at +977-9855012345.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          actions: [
            { label: 'Call Support', type: 'call', payload: '+977-9855012345' },
            { label: 'Contact Page', type: 'contact', payload: 'contact' }
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
          { label: 'Our Services', type: 'navigate', payload: 'services' },
          { label: 'Check Shipping Rates', type: 'navigate', payload: 'rates' },
          { label: 'Contact Details', type: 'contact', payload: 'contact' },
        ]
      }
    ]);
  };

  const handleActionClick = (action: ChatAction) => {
    switch (action.type) {
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
      {/* Outer Card Wrapper with Gradient Glow */}
      <div className="relative rounded-3xl bg-[#071A33] border border-slate-700/80 shadow-2xl overflow-hidden transition-all">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[#0B5ED7]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[250px] bg-[#F5C84C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Chatbot Header */}
        <div className="relative z-10 px-6 py-4 bg-[#0B2445]/90 border-b border-slate-700/70 flex items-center justify-between flex-wrap gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0B5ED7] to-[#2F80ED] flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0B2445]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-white tracking-tight">
                  {settings.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0B5ED7]/30 text-[#60A5FA] border border-[#0B5ED7]/40">
                  Controlled AI • {settings.model.split('/')[1] || settings.model}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                Approved BC Cargo Knowledge Base Only (Gov Lic #B-409)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-mono"
              title="Reset Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* 2. Messages Stream */}
        <div className="relative z-10 p-4 sm:p-6 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4 font-sans bg-[#071A33]/70">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%]">
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#0B5ED7] text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0B5ED7] text-white rounded-br-none'
                      : msg.isFallback
                      ? 'bg-[#162942] text-amber-200 border border-amber-500/30 rounded-bl-none'
                      : msg.isError
                      ? 'bg-[#2A1719] text-rose-200 border border-rose-500/30 rounded-bl-none'
                      : 'bg-[#0F2D54] text-slate-100 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Actions Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 pt-3 mt-3 border-t border-white/10">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/10 hover:border-white/30"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#F5C84C]" />
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
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono py-2 px-1">
              <div className="w-7 h-7 rounded-xl bg-[#0B5ED7] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-1.5 bg-[#0F2D54] px-4 py-2.5 rounded-2xl border border-slate-700/60">
                <span className="w-2 h-2 rounded-full bg-[#0B5ED7] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#F5C84C] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-slate-300 ml-1">Searching approved BC Cargo knowledge...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 3. Suggested Questions Toolbar */}
        <div className="relative z-10 px-4 sm:px-6 py-3 bg-[#0B2445]/60 border-t border-slate-700/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C84C] shrink-0" />
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 shrink-0">
            Suggested:
          </span>
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => handleSend(s.text)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-[#0B5ED7] text-slate-200 hover:text-white text-[11px] font-medium transition-all whitespace-nowrap border border-slate-700 hover:border-[#0B5ED7] cursor-pointer"
            >
              {s.text}
            </button>
          ))}
        </div>

        {/* 4. Input Console Form */}
        <div className="relative z-10 p-4 bg-[#0B2445] border-t border-slate-700/70">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-[#071A33] p-2 rounded-2xl border border-slate-700 focus-within:border-[#0B5ED7] focus-within:ring-2 focus-within:ring-[#0B5ED7]/20 transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={settings.inputPlaceholder}
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-1 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] disabled:bg-slate-700 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between px-2 pt-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              Controlled Agentic Assistant • No unapproved external AI opinions
            </span>
            <span className="hidden sm:inline text-slate-500">
              Press Enter to send
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
