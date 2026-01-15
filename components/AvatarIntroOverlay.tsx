
import React from 'react';
import { Avatar } from '../types';

interface AvatarIntroOverlayProps {
  avatar: Avatar;
  message: string | null;
  isLoading: boolean;
  isSpeaking?: boolean;
  onClose: () => void;
  onStartChat?: () => void;
}

const AvatarIntroOverlay: React.FC<AvatarIntroOverlayProps> = ({ avatar, message, isLoading, isSpeaking, onClose, onStartChat }) => {
  if (!isLoading && !message) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#050810]/95 border border-cyan-500/20 rounded-[3rem] p-10 shadow-[0_0_150px_rgba(34,211,238,0.15)] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${avatar.color} blur-[120px] opacity-10`} />
        
        <div className="relative flex flex-col items-center text-center space-y-8">
          {/* Avatar Orb with Speaking Animation */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${avatar.color} p-[2px] shadow-2xl shadow-cyan-500/30 relative z-10`}>
              <div className="w-full h-full bg-[#050810] rounded-full flex items-center justify-center font-orbitron text-5xl">
                {avatar.name.includes("Panda") ? "🐼" : "🌟"}
              </div>
            </div>
            {isSpeaking && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 animate-ping" />
                <div className="absolute inset-[-10px] rounded-full border border-cyan-400/20 animate-pulse" />
              </>
            )}
          </div>
          
          <div>
            <h3 className="font-orbitron text-3xl text-white mb-2 uppercase tracking-tighter">{avatar.name}</h3>
            <p className="text-cyan-500 font-orbitron text-[10px] uppercase tracking-[0.5em] mb-4">{avatar.role}</p>
          </div>

          <div className="min-h-[120px] flex items-center justify-center px-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span className="text-[10px] font-orbitron text-cyan-800 uppercase tracking-widest">Sintonizando Canal de Voz...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-200 text-xl font-light leading-relaxed italic animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  "{message}"
                </p>
                {isSpeaking && (
                  <div className="flex justify-center gap-1.5 h-4 items-center">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 bg-cyan-500/40 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.3 + Math.random()}s` }} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
               <button 
                onClick={onStartChat}
                className="flex-1 px-8 py-4 bg-white/5 border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-orbitron font-bold text-[10px] tracking-[0.3em] rounded-2xl transition-all uppercase"
              >
                Iniciar Diálogo
              </button>
              <button 
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-orbitron font-bold text-[10px] tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-cyan-900/20 uppercase"
              >
                Cerrar Sintonía
              </button>
            </div>
          )}
        </div>

        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default AvatarIntroOverlay;
