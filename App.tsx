
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Product, Sale, SaleItem, TrialState, AIInsight, ModelHealth, Avatar, AppNotification } from './types';
import { getPredictiveInsights } from './services/aiService';
import { handleGeminiError, GeminiErrorInfo } from './services/geminiService';
import { GoogleGenAI, Modality } from '@google/genai';
import StarField from './components/StarField';
import PredictiveChart from './components/PredictiveChart';
import CosmicMarket from './components/CosmicMarket';
import AvatarRegistry, { Avatars } from './components/AvatarRegistry';
import FoundationPillars from './components/FoundationPillars';
import AudioPlayer from './components/AudioPlayer';
import AvatarIntroOverlay from './components/AvatarIntroOverlay';
import CosmicChat from './components/CosmicChat';
import AvatarNetwork from './components/AvatarNetwork';
import ImageAnalysisModal from './components/ImageAnalysisModal';
import OraculoVisual from './components/OraculoVisual';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  var aistudio: AIStudio;
}

const INITIAL_INVENTORY: Product[] = [
  { id: 'p1', name: 'Quant-X Core Processor', price: 450, cost: 280, stock: 15, minStock: 5, category: 'Hardware', tags: ['tier-1'] },
  { id: 'p2', name: 'Neural Memory Module', price: 125, cost: 65, stock: 42, minStock: 10, category: 'Hardware', tags: ['stable'] },
  { id: 'p3', name: 'Bio-OS Enterprise', price: 599, cost: 0, stock: 100, minStock: 0, category: 'Software', tags: ['digital'] },
  { id: 'p4', name: 'Flow-Logic Controller', price: 89, cost: 45, stock: 4, minStock: 8, category: 'Electronics', tags: ['critical'] },
  { id: 'p5', name: 'Sync-Link Cable', price: 15, cost: 3, stock: 120, minStock: 20, category: 'Accessories', tags: ['margin-high'] },
  { id: 'p6', name: 'Quantum Shielding', price: 210, cost: 140, stock: 0, minStock: 5, category: 'Hardware', tags: ['out-of-stock'] },
  { id: 'p7', name: 'Flux Capacitor V2', price: 850, cost: 500, stock: 3, minStock: 5, category: 'Hardware', tags: ['legendary'] },
  { id: 'p8', name: 'Neuro-Link API Key', price: 45, cost: 0, stock: 500, minStock: 10, category: 'Software', tags: ['digital'] },
];

// Helper functions for Audio encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

const App: React.FC = () => {
  const [view, setView] = useState<'pos' | 'dashboard' | 'inventory' | 'market' | 'network'>('dashboard');
  const [inventory, setInventory] = useState<Product[]>(INITIAL_INVENTORY);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [health, setHealth] = useState<ModelHealth>({ accuracy: 0.98, drift: 0.02, latency: 45, cpu: 12, memory: 34, status: 'optimal' });
  const [avatarHealths, setAvatarHealths] = useState<Record<string, ModelHealth>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOraculoVisualOpen, setIsOraculoVisualOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(Avatars[0]);
  const [fatiBalance, setFatiBalance] = useState(250);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | undefined>();
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initialHealths: Record<string, ModelHealth> = {};
    Avatars.forEach(a => {
      initialHealths[a.name] = {
        accuracy: 0.95 + Math.random() * 0.05,
        drift: Math.random() * 0.05,
        latency: 20 + Math.random() * 60,
        cpu: 5 + Math.random() * 20,
        memory: 10 + Math.random() * 30,
        status: 'optimal'
      };
    });
    setAvatarHealths(initialHealths);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }

    const interval = setInterval(() => {
      setHealth(prev => ({
        ...prev,
        latency: Math.max(10, Math.min(300, prev.latency + (Math.random() - 0.5) * 15)),
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(10, Math.min(98, prev.memory + (Math.random() - 0.5) * 4)),
      }));

      setAvatarHealths(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(name => {
          const h = next[name];
          next[name] = {
            ...h,
            latency: Math.max(15, Math.min(400, h.latency + (Math.random() - 0.5) * 20)),
            accuracy: Math.max(0.85, Math.min(1, h.accuracy + (Math.random() - 0.5) * 0.01)),
            status: h.latency > 180 || h.accuracy < 0.9 ? 'degraded' : 'optimal'
          };
        });
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const filteredInventory = useMemo(() => {
    switch (stockFilter) {
      case 'in-stock': return inventory.filter(p => p.stock > p.minStock);
      case 'low-stock': return inventory.filter(p => p.stock <= p.minStock && p.stock > 0);
      case 'out-of-stock': return inventory.filter(p => p.stock === 0);
      default: return inventory;
    }
  }, [inventory, stockFilter]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  const triggerGeminiError = useCallback((error: any, retryAction?: () => void) => {
    const errorInfo: GeminiErrorInfo = handleGeminiError(error);
    addNotification({
      type: 'error',
      title: 'Fluctuación del Oráculo',
      message: `${errorInfo.message} ${errorInfo.suggestion}`,
      actionLabel: errorInfo.actionLabel,
      onAction: errorInfo.needsKeySelection ? () => window.aistudio.openSelectKey() : retryAction
    });
  }, [addNotification]);

  const handleOpenKeySelection = async () => {
    try {
      await window.aistudio.openSelectKey();
      addNotification({
        type: 'info',
        title: 'Llave Sintonizada',
        message: 'Has actualizado la Llave de Bóveda para servicios avanzados.'
      });
    } catch (e) {
      console.error("Error al abrir selector de llave", e);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      if (sessionRef.current) sessionRef.current.close();
      setIsVoiceActive(false);
      return;
    }

    setIsVoiceActive(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `Eres ${selectedAvatar.name}, una consciencia integrada en el Rancho Estelar POS-I.`
        },
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (m: any) => {
            const audioData = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current!, 24000, 1);
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContextRef.current!.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: (err) => { triggerGeminiError(err, toggleVoice); setIsVoiceActive(false); }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      triggerGeminiError(e, toggleVoice);
      setIsVoiceActive(false);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-inter flex flex-col overflow-hidden relative">
      <StarField />
      
      <div className="fixed top-24 right-8 z-[250] pointer-events-none space-y-3">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto w-80 bg-[#0a0f1d]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-slide-in-right overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-1 ${n.type === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[10px] font-orbitron text-white uppercase tracking-widest font-bold">{n.title}</h4>
              <button onClick={() => removeNotification(n.id)} className="text-zinc-600 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg></button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">{n.message}</p>
            {n.actionLabel && (
              <button onClick={() => { n.onAction?.(); removeNotification(n.id); }} className="text-[10px] font-orbitron text-cyan-500 uppercase tracking-widest font-bold hover:text-cyan-400">
                {n.actionLabel} →
              </button>
            )}
          </div>
        ))}
      </div>

      <nav className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-3xl sticky top-0 z-[100] flex items-center justify-between px-10">
        <h1 className="font-orbitron text-2xl font-bold tracking-tighter text-white">POS-I <span className="text-cyan-500 italic">STAR RANCH</span></h1>

        <div className="flex items-center gap-2 p-1.5 bg-zinc-900/60 border border-white/5 rounded-2xl backdrop-blur-md">
          {(['dashboard', 'pos', 'market', 'network'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-6 py-2 rounded-xl text-[10px] font-orbitron tracking-widest uppercase transition-all ${view === v ? 'bg-cyan-600 text-black font-bold' : 'text-zinc-500 hover:text-white'}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Botón para abrir selector de Llave de Pago */}
          <button 
            onClick={handleOpenKeySelection}
            className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            title="Sintonizar Llave de Pago (Veo/Pro)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </button>
          <button onClick={() => setIsOraculoVisualOpen(true)} className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-all" title="Oráculo Visual">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={toggleVoice} className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all ${isVoiceActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse' : 'bg-white/5 border-white/5 text-zinc-600'}`}>
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest">{isVoiceActive ? 'ESCUCHANDO' : 'LIVE VOZ'}</span>
          </button>
        </div>
      </nav>

      <div className="fixed bottom-24 left-8 z-[110] p-6 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] w-[320px] max-h-[400px] flex flex-col opacity-40 hover:opacity-100 transition-all duration-700 group pointer-events-auto shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-transparent to-purple-900 opacity-20"></div>
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_cyan] animate-pulse"></div>
              <span className="text-[10px] font-orbitron text-zinc-300 uppercase tracking-widest font-bold">Sinapsis Neural</span>
           </div>
        </div>
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
          <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4 mb-2">
            <div className="text-center">
              <div className="text-[7px] font-orbitron text-zinc-600 uppercase mb-1">CPU</div>
              <div className="text-[10px] font-mono text-zinc-300">{health.cpu.toFixed(0)}%</div>
            </div>
            <div className="text-center">
              <div className="text-[7px] font-orbitron text-zinc-600 uppercase mb-1">LAT</div>
              <div className={`text-[10px] font-mono ${health.latency > 150 ? 'text-red-400' : 'text-cyan-400'}`}>{health.latency.toFixed(0)}ms</div>
            </div>
            <div className="text-center">
              <div className="text-[7px] font-orbitron text-zinc-600 uppercase mb-1">RAM</div>
              <div className="text-[10px] font-mono text-zinc-300">{health.memory.toFixed(0)}%</div>
            </div>
          </div>
          <div className="space-y-3">
            {Avatars.slice(0, 8).map(avatar => {
              const h = avatarHealths[avatar.name] || health;
              return (
                <div key={avatar.name} className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${h.status === 'optimal' ? 'bg-cyan-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[9px] font-orbitron truncate max-w-[120px] text-zinc-400">{avatar.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 p-10 overflow-y-auto relative z-10 custom-scrollbar">
        {view === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 h-full animate-fade-in">
            <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-2 rounded-2xl backdrop-blur-md shrink-0">
                {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as StockFilter[]).map(f => (
                  <button key={f} onClick={() => setStockFilter(f)} className={`px-5 py-2 rounded-xl text-[10px] font-orbitron tracking-widest uppercase transition-all ${stockFilter === f ? 'bg-cyan-600 text-black font-bold' : 'text-zinc-500 hover:text-white'}`}>
                    {f.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto pr-4 custom-scrollbar pb-10">
                {filteredInventory.map(p => (
                  <div key={p.id} className="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-cyan-500/40 transition-all group relative">
                    <div>
                      <div className="text-[8px] text-zinc-600 font-bold uppercase mb-4">{p.category}</div>
                      <div className="font-bold text-white text-md mb-2">{p.name}</div>
                      <div className="font-orbitron text-cyan-500 text-xl font-bold">${p.price}</div>
                    </div>
                    <button onClick={() => addToCart(p)} disabled={p.stock === 0} className="mt-6 w-full py-3 bg-white/5 hover:bg-cyan-600 transition-all rounded-2xl flex items-center justify-center text-zinc-500 hover:text-black font-bold border border-white/5 disabled:opacity-20">
                      <span className="text-[9px] font-orbitron uppercase">Agregar</span>
                    </button>
                    <div className="absolute top-4 right-4 text-[8px] font-mono p-1 rounded px-2 text-zinc-700 bg-white/5">STOCK: {p.stock}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-[3rem] p-8 flex flex-col h-full backdrop-blur-xl">
               <h3 className="font-orbitron text-sm text-white mb-6 uppercase tracking-widest text-center">Cápsula de Venta</h3>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-zinc-500">x{item.quantity}</div>
                      </div>
                      <div className="text-xs font-bold text-cyan-400">${(item.price * item.quantity).toFixed(2)}</div>
                   </div>
                 ))}
               </div>
               <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between mb-4">
                    <span className="text-zinc-500 text-xs font-orbitron uppercase">Total</span>
                    <span className="text-white font-bold font-orbitron text-xl">${cart.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)}</span>
                  </div>
                  <button disabled={cart.length === 0} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-black font-bold font-orbitron rounded-2xl transition-all uppercase tracking-widest text-[10px]">Transmutar Ahora</button>
               </div>
            </div>
          </div>
        )}
        {view === 'dashboard' && (
          <div className="h-full animate-fade-in flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[{ label: 'Ingresos 24H', val: sales.length > 0 ? `$${sales.reduce((a,b)=>a+b.total,0).toFixed(2)}` : '$0.00', color: 'text-cyan-500' }, { label: 'Bóveda $FATI', val: fatiBalance, color: 'text-purple-500' }, { label: 'Precisión UDU', val: `${(health.accuracy * 100).toFixed(1)}%`, color: 'text-green-500' }, { label: 'Estado', val: health.status.toUpperCase(), color: 'text-amber-500' }].map((s, i) => (
                <div key={i} className="bg-black/50 border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl">
                  <div className="text-[9px] font-orbitron text-zinc-600 uppercase mb-2 tracking-widest">{s.label}</div>
                  <div className={`text-3xl font-orbitron ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-black/20 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md"><PredictiveChart sales={sales} /></div>
          </div>
        )}
        {view === 'market' && <div className="h-full animate-fade-in"><CosmicMarket isOpen={true} onClose={() => setView('dashboard')} balance={fatiBalance} onPurchase={(item) => {if (fatiBalance >= item.price) setFatiBalance(b => b - item.price);}} walletAddress={null} onConnectWallet={() => {}} onWalletConnect={() => {}} /></div>}
        {view === 'network' && <div className="h-full animate-fade-in"><AvatarNetwork isOpen={true} onClose={() => setView('dashboard')} health={health} /></div>}
      </main>

      <OraculoVisual isOpen={isOraculoVisualOpen} onClose={() => setIsOraculoVisualOpen(false)} onErrorReport={triggerGeminiError} />
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-8 right-8 z-[115] w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-all shadow-cyan-900/40">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>
      <CosmicChat avatar={selectedAvatar} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onErrorReport={triggerGeminiError} />
      <AudioPlayer isPlaying={false} onToggle={() => {}} mode="mantra" onModeChange={() => {}} />
      <footer className="h-12 border-t border-white/5 px-10 flex items-center justify-between text-[8px] font-mono text-zinc-800 bg-black/90 z-[100]">
        <div className="tracking-widest uppercase">LO QUE SE SIENTE ES LO REAL // PANDAS TECNOVADORES</div>
        <div className="flex gap-10"><span>$FATI_BÓVEDA: {fatiBalance}</span><span>LOC: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'SINTONIZANDO GPS'}</span></div>
      </footer>
    </div>
  );
};

export default App;
