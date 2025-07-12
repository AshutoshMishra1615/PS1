"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: `👋 Hi! I'm Assistly, your Skill Swap assistant!`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/geminiApi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: data.aiText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "⚠️ Error getting response. Try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full shadow-lg ${
            isOpen
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gradient-to-r from-[#9b6cfe] to-[#7828BD]"
          }`}
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </motion.div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="z-50 fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9b6cfe] to-[#7828BD] text-white p-4 flex justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white/50">
                  <div className="flex h-full w-full items-center justify-center bg-white text-[#9b6cfe] font-semibold">
                    AI
                  </div>
                </Avatar>
                <div>
                  <h3 className="font-medium">Assistly</h3>
                  <p className="text-xs text-white/80">
                    Ask me about this website!
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="text-white hover:bg-white/20"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-[#9b6cfe] text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <p className="text-gray-500 text-sm italic">AI is typing...</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-200 bg-white"
            >
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ask a thermal question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 text-black"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="bg-[#9b6cfe] hover:bg-[#7828BD] text-white"
                >
                  {isTyping ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
