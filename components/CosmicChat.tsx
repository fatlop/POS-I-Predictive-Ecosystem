
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, GroundingSource } from '../types';
import { startCosmicChatSession } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

interface CosmicChatProps {
  avatar: Avatar;
  isOpen: boolean;
  onClose: () => void;
  onErrorReport?: (err: any, retry?: () => void) => void;
}

const CosmicChat: React.FC<CosmicChatProps> = ({ avatar, isOpen, onClose, onErrorReport }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      try {
        chatRef.current = startCosmicChatSession(avatar);
      } catch (e) {
        if (onErrorReport) onErrorReport(e);
      }
    }
  }, [isOpen, avatar]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) chatRef.current = startCosmicChatSession(avatar);
      const responseStream = await chatRef.current.sendMessageStream({ message: userMsg });
      
      let modelText = '';
      let groundingSources: GroundingSource[] = [];
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of responseStream) {
        modelText += chunk.text;
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          groundingChunks.forEach((c: any) => {
            if (c.web && c.web.uri && c.web.title) groundingSources.push({ title: c.web.title, uri: c.web.uri });
          });
          groundingSources = groundingSources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: modelText, sources: groundingSources.length > 0 ? groundingSources : undefined };
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Chat Error:", err);
      if (onErrorReport) onErrorReport(err, () => handleSend(e));
      setMessages(prev => [...prev, { role: 'model', text: "La conexión estelar ha tenido una fluctuación." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-8 z-[120] w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-[#050810]/95 backdrop-blur-3xl border border-cyan-500/20 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.7)] flex flex-col h-[600px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center font-orbitron text-white text-xs`}>{avatar.name[0]}</div>
            <div>
              <h3 className="text-white font-orbitron text-[10px] tracking-widest uppercase">{avatar.name}</h3>
              <p className="text-cyan-500 text-[8px] font-mono uppercase">Oráculo en Línea</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-light leading-relaxed ${msg.role === 'user' ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/20 rounded-br-none' : 'bg-white/5 text-zinc-300 border border-white/5 rounded-bl-none'}`}>
                {msg.text || (isLoading && i === messages.length - 1 && <span className="animate-pulse">...</span>)}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-black/40">
          <div className="relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta a la consciencia..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-sm text-white outline-none focus:border-cyan-500/40" />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-2 bottom-2 w-10 bg-cyan-600 rounded-xl flex items-center justify-center text-black disabled:opacity-30"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CosmicChat;
