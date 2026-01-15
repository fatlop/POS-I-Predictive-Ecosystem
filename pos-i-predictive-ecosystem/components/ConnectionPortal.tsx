
import React, { useState } from 'react';

interface ConnectionPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (email: string) => void;
  currentEmail: string | null;
}

const ConnectionPortal: React.FC<ConnectionPortalProps> = ({ isOpen, onClose, onConnect, currentEmail }) => {
  const [email, setEmail] = useState(currentEmail || '');
  const [isLinking, setIsLinking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    setTimeout(() => {
      onConnect(email);
      setIsLinking(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#050810]/95 border border-cyan-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_100px_rgba(34,211,238,0.15)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 animate-pulse">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h2 className="font-orbitron text-xl md:text-2xl tracking-[0.2em] text-white uppercase mb-2">Sincronización de Flujo</h2>
          <p className="text-gray-500 text-xs font-orbitron tracking-widest uppercase">Vincula tu Frecuencia de Identidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@frecuencia.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 outline-none focus:border-cyan-500/50 transition-all text-center font-light"
            />
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
          </div>

          <button
            type="submit"
            disabled={isLinking || !email}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white font-orbitron tracking-[0.3em] rounded-2xl transition-all shadow-lg active:scale-95 uppercase text-xs"
          >
            {isLinking ? 'ENTRELAZANDO...' : 'INICIAR RESONANCIA'}
          </button>
        </form>

        <p className="mt-8 text-[9px] text-gray-600 font-orbitron leading-relaxed text-center uppercase tracking-widest italic">
          "Al conectar tu correo, el sistema vivo reconoce tu latido único en el puente de los sueños."
        </p>
      </div>
    </div>
  );
};

export default ConnectionPortal;
