
import React, { useState } from 'react';

interface MarketItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
}

const ITEMS: MarketItem[] = [
  { id: 'perk_1', name: 'Sinfonía de Aurora', price: 50, icon: '🌈', desc: 'Desbloquea visualizaciones cromáticas extendidas en el StarField.' },
  { id: 'perk_2', name: 'Voz de Hexia', price: 120, icon: '📐', desc: 'Acceso a protocolos de arquitectura sagrada en tus consultas.' },
  { id: 'perk_3', name: 'Membresía Resonante', price: 500, icon: '💎', desc: 'Prioridad en el Puente de los Sueños y emblema de platino.' },
  { id: 'perk_4', name: 'Semilla de Destino', price: 200, icon: '🌱', desc: 'Una consulta profunda con el Tio Chepe sobre tu propósito real.' },
  { id: 'perk_5', name: 'Algoritmo Cuántico', price: 1000, icon: '⚛️', desc: 'Mejora la precisión de la UDU en un 15% permanente.' },
];

interface MarketProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onPurchase: (item: MarketItem) => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onWalletConnect: () => void;
}

const CosmicMarket: React.FC<MarketProps> = ({ 
  isOpen, 
  onClose, 
  balance, 
  onPurchase, 
  walletAddress, 
  onConnectWallet,
  onWalletConnect
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleTransmutation = (item: MarketItem) => {
    if (!walletAddress) {
      setShowConnectPrompt(true);
      return;
    }
    
    setIsProcessing(item.id);
    setTimeout(() => {
      onPurchase(item);
      setIsProcessing(null);
    }, 2000);
  };

  const handleInitiateConnection = () => {
    setIsConnecting(true);
    // Simulate connection lag for better UX/Immersion
    setTimeout(() => {
      onWalletConnect();
      setIsConnecting(false);
      setShowConnectPrompt(false);
    }, 1800);
  };

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-[#050810]/95 border border-cyan-500/20 rounded-[3.5rem] p-10 md:p-16 shadow-[0_0_150px_rgba(34,211,238,0.1)] overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8 relative z-10">
          <div>
            <h2 className="font-orbitron text-3xl tracking-[0.4em] text-white uppercase mb-2">Mercado de Transmutación</h2>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-zinc-600 font-orbitron text-[9px] uppercase tracking-widest leading-none mb-1">Tu Balance</span>
                <span className="text-cyan-400 font-orbitron text-2xl animate-pulse">{balance} $FATI</span>
              </div>
              <div className="w-[1px] h-10 bg-white/5 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-zinc-600 font-orbitron text-[9px] uppercase tracking-widest leading-none mb-1">Estado de Bóveda</span>
                <span className={`font-mono text-sm transition-colors ${walletAddress ? 'text-green-400' : 'text-zinc-500 italic'}`}>
                  {walletAddress ? `${walletAddress.substring(0,8)}...${walletAddress.slice(-6)}` : 'SINCRONIZACIÓN REQUERIDA'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {!walletAddress ? (
              <div className="flex gap-4 animate-in slide-in-from-top-4 duration-500">
                <button 
                  onClick={onConnectWallet}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-zinc-400 font-orbitron text-[10px] tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Browser Extension
                </button>
                <button 
                  onClick={handleInitiateConnection}
                  className="flex items-center gap-3 px-6 py-3 bg-[#3b99fc]/10 border border-[#3b99fc]/40 text-[#3b99fc] font-orbitron text-[10px] tracking-[0.2em] rounded-2xl hover:bg-[#3b99fc]/20 hover:shadow-[0_0_20px_rgba(59,153,252,0.2)] transition-all uppercase group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.628 3.515C6.671 1.487 10.171 1.487 12.214 3.515L12.428 3.728L12.642 3.515C14.685 1.487 18.185 1.487 20.228 3.515C22.271 5.543 22.271 8.843 20.228 10.871L12.428 18.671L4.628 10.871C2.585 8.843 2.585 5.543 4.628 3.515Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 12.5C8 12.5 9 11.5 12 11.5C15 11.5 16 12.5 16 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 11.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  WalletConnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-orbitron text-green-500 uppercase tracking-widest">Sintonizado</span>
              </div>
            )}
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-gray-500 hover:text-white border border-white/5 ml-2 transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={1.5} /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
          {ITEMS.map((item) => (
            <div key={item.id} className="group relative p-8 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] hover:border-cyan-500/40 transition-all flex items-start gap-6">
              <div className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{item.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-orbitron text-md text-white uppercase tracking-[0.2em]">{item.name}</h3>
                  <span className="font-mono text-cyan-500 text-sm font-bold">{item.price} $FATI</span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-light">"{item.desc}"</p>
                <button 
                  disabled={balance < item.price || isProcessing !== null}
                  onClick={() => handleTransmutation(item)}
                  className={`w-full py-4 rounded-2xl font-orbitron text-[9px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 ${
                    balance >= item.price 
                      ? 'bg-cyan-600 text-black font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {isProcessing === item.id ? "TRANSMUTANDO..." : `CANJEAR [${item.price} $FATI]`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {showConnectPrompt && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
             <div className="max-w-md w-full bg-[#0a0f1d] border border-cyan-500/30 rounded-[3rem] p-10 text-center shadow-[0_0_100px_rgba(34,211,238,0.25)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/20 animate-pulse relative">
                   <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.44A10.954 10.954 0 0112 21c3.906 0 7.351-2.036 9.392-5.118M2.058 8.441a11.042 11.042 0 012.334-3.326m3.44-3.44A10.954 10.954 0 0112 3c1.291 0 2.527.224 3.673.636m3.44 3.44a10.942 10.942 0 012.829 4.364M12 11v10" /></svg>
                </div>

                <h3 className="font-orbitron text-xl text-white uppercase tracking-[0.2em] mb-4">Sincronización Requerida</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 italic">
                  Para validar esta transmutación en el tejido del Puente de los Sueños, debemos reconocer tu frecuencia de bóveda.
                </p>

                <div className="space-y-4">
                   <button 
                      onClick={handleInitiateConnection}
                      disabled={isConnecting}
                      className="w-full py-5 bg-[#3b99fc] text-white font-orbitron font-bold text-[11px] tracking-[0.3em] rounded-2xl hover:bg-[#3b99fc]/80 transition-all uppercase shadow-lg shadow-[#3b99fc]/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                   >
                      {isConnecting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Entrelazando...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4.628 3.515C6.671 1.487 10.171 1.487 12.214 3.515L12.428 3.728L12.642 3.515C14.685 1.487 18.185 1.487 20.228 3.515C22.271 5.543 22.271 8.843 20.228 10.871L12.428 18.671L4.628 10.871C2.585 8.843 2.585 5.543 4.628 3.515Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 12.5C8 12.5 9 11.5 12 11.5C15 11.5 16 12.5 16 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Conectar con WalletConnect
                        </>
                      )}
                   </button>
                   
                   <div className="flex items-center gap-4 py-2">
                     <div className="h-[1px] flex-1 bg-white/5"></div>
                     <span className="text-[8px] font-orbitron text-zinc-700 uppercase tracking-widest">Otras Frecuencias</span>
                     <div className="h-[1px] flex-1 bg-white/5"></div>
                   </div>

                   <button 
                      onClick={() => { onConnectWallet(); setShowConnectPrompt(false); }}
                      className="w-full py-4 bg-white/5 border border-white/10 text-zinc-400 font-orbitron text-[10px] tracking-[0.3em] rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase active:scale-95"
                   >
                      Vía Browser Extension
                   </button>
                   <button 
                      onClick={() => setShowConnectPrompt(false)}
                      className="w-full py-4 text-zinc-700 font-orbitron text-[9px] tracking-[0.3em] hover:text-zinc-500 transition-colors uppercase"
                   >
                      Cerrar Sintonía
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CosmicMarket;
