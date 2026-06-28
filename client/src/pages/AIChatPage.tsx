/**
 * AIChatPage — AI-powered pregnancy Q&A chat
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 * Backend: tRPC community.aiChat → server-side LLM via invokeLLM
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Send, Bot, User, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { trpc } from "@/lib/trpc";
import { usePregnancy } from "@/hooks/usePregnancy";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "How can I help her sleep better in the third trimester?",
  "What should I pack in the hospital bag?",
  "How do I deal with her mood swings?",
  "What are the signs of labor starting?",
  "How can I bond with the baby before birth?",
  "What foods should she avoid?",
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  role: "assistant",
  content:
    "Hey Dad! 👋 I'm your AI pregnancy companion. Ask me anything about supporting your partner, preparing for baby, or navigating this incredible journey. No question is too small — I'm here for you.",
};

export default function AIChatPage() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current pregnancy week for context-aware responses
  const { currentWeek } = usePregnancy();

  const aiChatMutation = trpc.community.aiChat.useMutation({
    onSuccess: (data) => {
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.content,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setError(null);
    },
    onError: (err) => {
      setIsTyping(false);
      setError("Sorry, I couldn't respond right now. Please try again.");
      console.error("AI chat error:", err);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now(), role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setError(null);

    // Build conversation history for the API (exclude the welcome message from history if it's the only one)
    const conversationHistory = updatedMessages
      .filter((m) => m.id !== 0) // exclude static welcome message
      .map((m) => ({ role: m.role, content: m.content }));

    aiChatMutation.mutate({
      messages: conversationHistory,
      pregnancyWeek: currentWeek ?? undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "oklch(0.97 0.015 80)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)",
      }}
    >
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col min-w-0">
          <Header className="lg:border-b lg:px-6 lg:py-4" />

          {/* Sub-page header */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => navigate("/community")}
              className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center press-feedback"
            >
              <ChevronLeft size={20} className="text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.92 0.04 188)" }}
              >
                <Bot size={14} style={{ color: "oklch(0.45 0.09 188)" }} />
              </div>
              <p
                className="text-[15px] font-bold text-slate-800"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Ask Dad AI
              </p>
            </div>
            <div className="w-9 h-9" />
          </header>

          {/* Chat messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 pb-4"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="max-w-[640px] mx-auto flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: "oklch(0.92 0.04 188)" }}
                    >
                      <Bot size={14} style={{ color: "oklch(0.45 0.09 188)" }} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-slate-800 text-white rounded-br-md"
                        : "bg-white/90 border border-white/60 shadow-sm rounded-bl-md"
                    }`}
                    style={msg.role === "assistant" ? { color: "oklch(0.32 0.03 240)" } : {}}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-200">
                      <User size={14} className="text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: "oklch(0.92 0.04 188)" }}
                  >
                    <Bot size={14} style={{ color: "oklch(0.45 0.09 188)" }} />
                  </div>
                  <div className="bg-white/90 border border-white/60 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: "oklch(0.95 0.04 25)" }}
                  >
                    <AlertCircle size={14} style={{ color: "oklch(0.55 0.18 25)" }} />
                  </div>
                  <div className="bg-red-50 border border-red-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 text-[13px] text-red-700">
                    {error}
                  </div>
                </div>
              )}

              {/* Suggested questions (only show when few messages) */}
              {messages.length <= 1 && (
                <div className="mt-2">
                  <p className="text-[12px] font-semibold mb-2" style={{ color: "oklch(0.52 0.03 240)" }}>
                    Try asking:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        disabled={isTyping}
                        className="text-[11px] font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white/70 press-feedback text-left hover:bg-white transition-colors disabled:opacity-50"
                        style={{ color: "oklch(0.35 0.03 240)" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-slate-100 bg-white/95 backdrop-blur-sm px-4 py-3 pb-20 lg:pb-3 flex-shrink-0">
            <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about pregnancy..."
                disabled={isTyping}
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 border border-slate-200 focus:border-slate-300 transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl flex items-center justify-center press-feedback disabled:opacity-40 transition-opacity"
                style={{ background: "oklch(0.52 0.09 188)" }}
              >
                <Send size={16} className="text-white" />
              </button>
            </form>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
