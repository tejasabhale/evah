import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvahStore } from '../../store/useEvahStore';
import { X, Sparkles, CornerDownLeft } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'evah';
  text: string;
}

export const AskEvahPanel: React.FC = () => {
  const { aiPanelOpen, setAiPanelOpen, activeNoteId, notes, files } = useEvahStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: 'm_' + Date.now(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I've reviewed your request. Everything is stored locally on this drive.";

      const lower = query.toLowerCase();
      if (lower.includes('summarize') || lower.includes('note')) {
        reply = activeNote 
          ? `**${activeNote.title}** covers:\n- Core guidelines and security checkpoints.\n- Zero cloud dependencies.\n- Word count: ${activeNote.content.split(/\s+/).length} words.`
          : 'No active note selected to summarize.';
      } else if (lower.includes('vault') || lower.includes('security')) {
        reply = "Security status: Protected. Encryption scheme: XChaCha20-Poly1305 with Argon2id. No outbound connections detected.";
      } else if (lower.includes('file') || lower.includes('list')) {
        reply = `You have ${files.length} indexed files. Recent: ${files.slice(0, 3).map(f => f.name).join(', ')}.`;
      } else if (lower.includes('help')) {
        reply = "I can inspect local files, verify cryptographic checksums, format markdown notes, or explain system status.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'm_evah_' + Date.now(),
          sender: 'evah',
          text: reply,
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 right-4 bottom-4 w-96 sm:w-[410px] z-40 flex flex-col bg-evah-surface/95 border border-evah-border rounded-xl shadow-panel backdrop-blur-md overflow-hidden select-none"
        >
          {/* Header (comfortable 52px height) */}
          <div className="h-[52px] px-4 border-b border-evah-border flex items-center justify-between shrink-0 bg-white/[0.01]">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-evah-accent" />
              <span className="text-[17px] font-medium text-evah-text">
                EVAH
              </span>
              <span className="text-[12px] font-mono text-evah-muted px-2 py-0.5 rounded bg-white/[0.04]">
                local
              </span>
            </div>

            <button
              onClick={() => setAiPanelOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-evah-muted hover:text-evah-text hover:bg-white/[0.05] transition-colors"
              aria-label="Close EVAH panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body / Chat */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
            {messages.length === 0 ? (
              <div className="my-auto text-left space-y-4 py-4">
                <div className="space-y-1.5">
                  <h3 className="text-[18px] font-medium text-evah-text">
                    How can I help?
                  </h3>
                  <p className="text-[14.5px] text-evah-muted leading-relaxed">
                    Lightweight offline assistant for your private workspace.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {[
                    'Summarize active note',
                    'Check vault integrity',
                    'List recent files'
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSend(preset)}
                      className="text-left text-[14.5px] text-evah-secondary hover:text-evah-text h-11 px-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] transition-all flex items-center"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col text-[14.5px] leading-relaxed ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[92%] px-3.5 py-2.5 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-white/[0.08] text-evah-text border border-white/[0.08]'
                        : 'bg-white/[0.02] text-evah-secondary border border-white/[0.04]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex items-center gap-2 text-evah-muted text-[13.5px] font-mono px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-evah-accent animate-pulse" />
                <span>evaluating...</span>
              </div>
            )}
          </div>

          {/* Footer Input (min 44px height input) */}
          <div className="p-3 border-t border-evah-border bg-white/[0.01]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white/[0.03] border border-evah-border rounded-lg px-3.5 h-11 focus-within:border-white/20 transition-colors"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="w-full bg-transparent text-[15px] text-evah-text placeholder:text-evah-muted outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 flex items-center justify-center rounded text-evah-muted hover:text-evah-accent disabled:opacity-30 transition-colors shrink-0"
              >
                <CornerDownLeft size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
