
import React, { useEffect, useRef, useState } from 'react';
import FrequencyVisualizer from './FrequencyVisualizer';

interface Track {
  id: string;
  title: string;
  url: string;
  category: 'mantra' | 'himno' | 'intro';
}

interface AudioPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
  mode: 'mantra' | 'himno' | 'intro';
  onModeChange: (mode: 'mantra' | 'himno' | 'intro') => void;
}

const PLAYLIST: Track[] = [
  { id: 't1', title: 'Resonancia de Júpiter', category: 'mantra', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: 't2', title: 'Himno del Rancho', category: 'himno', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 't3', title: 'Pulso de Inicio', category: 'intro', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
  { id: 't4', title: 'Frecuencia $FATI', category: 'mantra', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 't5', title: 'Eco de Hexia', category: 'intro', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 't6', title: 'Voz del Tio Chepe', category: 'himno', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, onToggle, mode, onModeChange }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Initialize or update audio source when track changes
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.loop = false; // Set to false to handle 'ended' manually if we want auto-next
      audioRef.current.volume = 0.3;
      
      // Auto-next track when current one ends
      audioRef.current.onended = () => {
        const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
        selectTrack(nextIdx);
      };
    } else {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (wasPlaying || isPlaying) {
        audioRef.current.play().catch(e => console.warn("Interacción requerida para audio:", e));
      }
    }
  }, [currentTrackIndex]);

  // Sync mode changes from parent (App.tsx)
  useEffect(() => {
    const currentCategory = PLAYLIST[currentTrackIndex].category;
    if (currentCategory !== mode) {
      // Find first track of the new mode
      const trackIdx = PLAYLIST.findIndex(t => t.category === mode);
      if (trackIdx !== -1) {
        setCurrentTrackIndex(trackIdx);
      }
    }
  }, [mode]);

  // Handle Play/Pause state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error("Fallo de reproducción:", e);
        if (isPlaying) onToggle();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    onModeChange(PLAYLIST[index].category);
    if (!isPlaying) onToggle();
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    selectTrack(nextIdx);
  };

  const prevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    selectTrack(prevIdx);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 flex flex-col items-center">
      
      {/* Playlist Menu (Always available via Disc button) */}
      {isLibraryOpen && (
        <div className="w-full mb-4 bg-[#050810]/95 backdrop-blur-3xl border border-cyan-500/20 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-6 duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               <h3 className="font-orbitron text-[10px] text-white tracking-[0.5em] uppercase font-bold">Registro de Frecuencias</h3>
             </div>
             <button onClick={() => setIsLibraryOpen(false)} className="p-2 bg-white/5 rounded-full text-zinc-600 hover:text-white transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-3">
            {PLAYLIST.map((track, idx) => (
              <button 
                key={track.id}
                onClick={() => selectTrack(idx)}
                className={`w-full group flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 ${currentTrackIndex === idx ? 'bg-cyan-500/10 border-cyan-500/40 text-white' : 'bg-white/5 border-transparent text-zinc-500 hover:border-white/10 hover:bg-white/[0.08]'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] ${currentTrackIndex === idx ? 'bg-cyan-500 text-black font-bold' : 'bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700'}`}>
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold tracking-wide block">{track.title}</span>
                    <span className={`text-[8px] font-orbitron uppercase tracking-widest ${currentTrackIndex === idx ? 'text-cyan-400' : 'text-zinc-700'}`}>{track.category}</span>
                  </div>
                </div>
                {currentTrackIndex === idx && isPlaying && (
                  <div className="flex gap-1">
                    {[0, 0.3, 0.6].map(delay => (
                      <div key={delay} className="w-1 h-3 bg-cyan-400 animate-bounce" style={{ animationDelay: `${delay}s` }}></div>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Player Bar */}
      <div className="w-full bg-[#050810]/90 backdrop-blur-2xl border border-white/5 rounded-full p-2.5 pl-7 pr-5 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.8)] group hover:border-cyan-500/30 transition-all duration-500">
        
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <button 
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className={`relative group/disc transition-all duration-500 active:scale-90 ${isPlaying ? 'animate-spin-slow' : ''}`}
            title="Abrir Lista de Temas"
          >
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 via-cyan-900 to-black flex items-center justify-center border border-white/10 group-hover/disc:border-cyan-500/50`}>
              <span className="text-xl">💿</span>
            </div>
            {isPlaying && (
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping pointer-events-none"></div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/disc:opacity-100 transition-opacity bg-black/60 rounded-full border border-cyan-500/20">
               <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </div>
          </button>
          
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-orbitron text-cyan-500/80 uppercase tracking-[0.3em] leading-none mb-1.5 font-bold">Frecuencia Activa</span>
            <div className="relative overflow-hidden w-48 md:w-64 h-4">
               <div className="absolute whitespace-nowrap animate-marquee flex items-center gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{currentTrack.title}</span>
                <span className="text-zinc-700 font-orbitron text-[9px]">●</span>
                <span className="text-zinc-500 text-[10px] font-medium italic">Pandas Tecnovadores</span>
                <span className="text-zinc-700 font-orbitron text-[9px]">●</span>
                <span className="text-zinc-500 text-[10px] font-medium tracking-widest uppercase">Estabilidad Fértil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden lg:block">
             <FrequencyVisualizer isActive={isPlaying} />
          </div>
          
          <div className="h-8 w-[1px] bg-white/5 hidden md:block"></div>
          
          {/* Main Controls */}
          <div className="flex items-center gap-2">
            <button onClick={prevTrack} className="p-2.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90" title="Anterior">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
            </button>
            <button 
              onClick={onToggle}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${isPlaying ? 'bg-white text-black hover:bg-zinc-200' : 'bg-cyan-600 text-black hover:bg-cyan-500 shadow-cyan-900/40'}`}
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={nextTrack} className="p-2.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90" title="Siguiente">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zM16 6v12h2V6z"/></svg>
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/5 hidden md:block"></div>
          
          {/* Mode Switching Pills */}
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-black/40 rounded-full border border-white/5">
            {(['mantra', 'himno', 'intro'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`px-4 py-2 rounded-full text-[9px] font-orbitron uppercase tracking-widest transition-all duration-300 ${mode === m ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-900/20' : 'bg-transparent text-zinc-600 hover:text-zinc-300'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
