"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  Brain,
  Lightbulb,
  BookOpen,
  Zap,
  Minimize2,
  Maximize2,
  Volume2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const quickPrompts = [
  { icon: "📚", text: "Pomóż mi się uczyć", prompt: "Jak mogę efektywnie się uczyć?" },
  { icon: "🧠", text: "Wyjaśnij pojęcie", prompt: "Wyjaśnij mi proszę pojęcie:" },
  { icon: "📝", text: "Stwórz fiszki", prompt: "Stwórz fiszki z tematu:" },
  { icon: "✅", text: "Sprawdź wiedzę", prompt: "Zadaj mi pytania sprawdzające wiedzę z:" },
];

const greetings = [
  "Cześć! Jestem SuperMózg AI 🧠 Jak mogę Ci dziś pomóc w nauce?",
  "Hej! SuperMózg AI do usług! 💪 Czego się dziś nauczymy?",
  "Witaj! 🌟 Jestem Twoim osobistym asystentem nauki. O czym chcesz pogadać?",
];

export function SuperMozgChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: greeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      // Simulate AI response - w produkcji to będzie API call do Groq
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const responses = [
        `Świetne pytanie! 🎯 Pozwól, że Ci pomogę.\n\nW kontekście "${text.slice(0, 50)}..." mogę zaproponować kilka rozwiązań:\n\n1. **Aktywna nauka** - zamiast biernie czytać, zadawaj sobie pytania\n2. **Technika Pomodoro** - ucz się 25 minut, przerwa 5 minut\n3. **Fiszki** - idealne do zapamiętywania faktów\n\nChcesz, żebym rozwinął któryś z punktów? 💡`,
        `Rozumiem! 🧠 To fascynujący temat.\n\nOto co warto wiedzieć:\n\n• **Podstawy** - zacznij od fundamentów\n• **Praktyka** - teoria bez praktyki szybko się zapomina\n• **Powtórki** - spaced repetition to klucz do sukcesu!\n\nMogę stworzyć dla Ciebie fiszki lub quiz na ten temat. Co wolisz? 📚`,
        `Super, że pytasz! ✨\n\nNa podstawie tego, co napisałeś, proponuję:\n\n1. Zacznij od zrozumienia kontekstu\n2. Podziel materiał na mniejsze części\n3. Testuj swoją wiedzę regularnie\n\nPamiętaj: nauka to maraton, nie sprint! 🏃‍♂️\n\nCzy chcesz, żebym przygotował plan nauki?`,
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? { ...msg, content: randomResponse, isLoading: false }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: "Przepraszam, coś poszło nie tak. Spróbuj ponownie! 😅",
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Remove markdown
      const cleanText = text.replace(/[*_#`]/g, "").replace(/\n/g, " ");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "pl-PL";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl flex items-center justify-center group"
          >
            <Brain className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700",
              isMinimized && "h-auto"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">SuperMózg AI</h3>
                  <p className="text-xs text-white/80">Twój asystent nauki</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-700 shadow-sm rounded-bl-none"
                        )}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Myślę...</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>

                            {/* Actions for assistant messages */}
                            {message.role === "assistant" && !message.isLoading && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                                <button
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                  title="Kopiuj"
                                >
                                  {copiedId === message.id ? (
                                    <Check size={14} className="text-green-500" />
                                  ) : (
                                    <Copy size={14} className="text-gray-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => speakText(message.content)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                  title="Przeczytaj"
                                >
                                  <Volume2 size={14} className="text-gray-400" />
                                </button>
                                <div className="flex-1" />
                                <button
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                  title="Pomocne"
                                >
                                  <ThumbsUp size={14} className="text-gray-400" />
                                </button>
                                <button
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                  title="Niepomocne"
                                >
                                  <ThumbsDown size={14} className="text-gray-400" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <p className="text-xs text-gray-500 mb-2">Szybkie akcje:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(prompt.prompt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span>{prompt.icon}</span>
                          <span>{prompt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                      placeholder="Napisz wiadomość..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        input.trim() && !isLoading
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      )}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    SuperMózg AI może popełniać błędy. Sprawdzaj ważne informacje.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
