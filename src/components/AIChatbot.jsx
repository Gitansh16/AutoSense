import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { askAIChatbot } from '../utils/api';

const QUICK_PROMPTS = [
  'How does AutoSense work?',
  'Where can I view analytics?',
  'How do EV and truck predictions differ?',
];

const initialMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! I am AutoPilot, your AutoSense assistant. Ask me about features, pages, predictions, or how to use the app.',
};

const AIChatbot = ({ iconSrc = '/chatbot-icon.svg', openTrigger = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (openTrigger > 0) {
      setIsOpen(true);
    }
  }, [openTrigger]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-autopilot-chat', handleOpen);
    return () => window.removeEventListener('open-autopilot-chat', handleOpen);
  }, []);

  const history = useMemo(
    () =>
      messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({ role: msg.role, text: msg.text })),
    [messages]
  );

  const sendMessage = async (customText) => {
    const text = (customText ?? input).trim();
    if (!text || loading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAIChatbot(text, history.slice(-8));
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.answer || 'I could not generate a response right now. Please try again.',
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: error.message || 'Something went wrong while contacting AutoPilot.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 z-[70] flex items-center gap-3 rounded-full border border-white/20 bg-dark-500/90 px-3 py-2 shadow-2xl backdrop-blur-md hover:border-primary-500/50"
            aria-label="Open AI chatbot"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30">
              {!iconFailed ? (
                <img
                  src={iconSrc}
                  alt="Chatbot icon"
                  className="h-6 w-6 object-contain"
                  onError={() => setIconFailed(true)}
                />
              ) : (
                <MessageCircle className="h-5 w-5" />
              )}
            </span>
            <span className="pr-1 text-sm font-semibold text-gray-100">Need help? Ask AutoPilot</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-[80] w-[calc(100vw-1.25rem)] max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-dark-500/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary-500/20 p-1.5 text-primary-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-100">AutoPilot Assistant</p>
                  <p className="text-xs text-gray-400">Instant help with app usage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-white/10 hover:text-gray-200"
                aria-label="Close AI chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="h-80 space-y-3 overflow-y-auto px-3 py-3 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-gray-100 whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-gray-200">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-3 pb-3 pt-2">
              <div className="mb-2 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-gray-300 transition hover:border-primary-500/40 hover:text-primary-300 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about AutoSense features..."
                  className="input-field h-10 rounded-xl py-2 text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white transition hover:bg-primary-400 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
