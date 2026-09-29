import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'BOT';
  message: string;
  intent?: string;
  suggestions?: string[];
  createdAt: string;
}

export const JagoChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initial welcome message from JAGO
    setMessages([
      {
        id: 'welcome-1',
        sender: 'BOT',
        message: `Hello ${user?.student?.name || 'there'}! I am **JAGO**, your MoTA AI Tribal Scholarship Assistant.\n\nI have live access to your student profile, applications, documents, and DBT payment logs. How can I help you today?`,
        intent: 'GREETING',
        suggestions: [
          'What is my application status?',
          'Why is my application pending?',
          'Am I eligible for scholarships?',
          'When was my scholarship payment made?',
          'What documents do I need?',
        ],
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setInputText('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        sessionId,
      });

      if (res.data?.success && res.data.response) {
        if (res.data.sessionId) {
          setSessionId(res.data.sessionId);
        }

        const botReply: ChatMessage = {
          id: res.data.response.id || `bot-${Date.now()}`,
          sender: 'BOT',
          message: res.data.response.message,
          intent: res.data.response.intent,
          suggestions: res.data.response.suggestions || [],
          createdAt: res.data.response.createdAt || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'BOT',
        message:
          'I am having trouble retrieving live database records at this moment. Please retry in a few seconds.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-col h-[calc(100vh-8rem)]">
      {/* JAGO Header */}
      <div className="bg-white rounded-t-card p-4 border border-slate-200 border-b-0 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-900">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-900">JAGO Scholarship Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                MoTA Live Knowledge Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Connected to Rahul Munda ({user?.student?.otrId || 'OTR-ST-2026-90412'})</p>
          </div>
        </div>

        <button
          onClick={() => {
            setSessionId(null);
            setMessages((prev) => prev.slice(0, 1));
          }}
          className="text-xs text-slate-500 hover:text-emerald-800 font-medium flex items-center gap-1 p-1 hover:bg-slate-50 rounded"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Message History Feed */}
      <div className="flex-1 bg-[#fbfaf6] border-x border-slate-200 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-emerald-800 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm space-y-2'
                }`}
              >
                {/* Message Body with Markdown styling */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.message}
                </div>

                {/* Intent Tag if from Bot */}
                {!isUser && msg.intent && (
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span>Intent: {msg.intent}</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* Suggestions Chips from JAGO */}
              {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="text-[11px] bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 font-medium px-2.5 py-1 rounded-full shadow-2xs transition text-left"
                    >
                      {sug} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-slate-500 font-medium ml-1">JAGO is querying live records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="bg-white rounded-b-card p-3 border border-slate-200 border-t-0 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask JAGO (e.g. 'What is my application status?' or 'Am I eligible?')..."
            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-800 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-emerald-800 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-sm transition disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JagoChatbotPage;
