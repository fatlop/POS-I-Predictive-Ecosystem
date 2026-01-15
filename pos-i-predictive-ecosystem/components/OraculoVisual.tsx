
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface OraculoVisualProps {
  isOpen: boolean;
  onClose: () => void;
  onErrorReport?: (err: any, retry?: () => void) => void;
}

const OraculoVisual: React.FC<OraculoVisualProps> = ({ isOpen, onClose, onErrorReport }) => {
  const [activeTab, setActiveTab] = useState<'gen' | 'edit' | 'video'>('gen');
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ type: 'img' | 'video', url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('1:1');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setProgress('Invocando a Gemini 3 Pro Image (1K/2K/4K)...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: prompt,
        config: { 
          imageConfig: { 
            imageSize: imgSize, 
            aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio as any 
          } 
        }
      });
      
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResult({ type: 'img', url: `data:image/png;base64,${part.inlineData.data}` });
      }
    } catch (err) {
      console.error(err);
      if (onErrorReport) {
        onErrorReport(err, generateImage);
      } else {
        alert("Fallo de conexión neural. Revisa los permisos de tu llave.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const editImage = async () => {
    if (!image || !prompt) return;
    setIsLoading(true);
    setProgress('Modulando imagen con Nano Banana (Gemini 2.5 Flash Image)...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: prompt }
          ]
        }
      });
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResult({ type: 'img', url: `data:image/png;base64,${part.inlineData.data}` });
      }
    } catch (err) {
      console.error(err);
      if (onErrorReport) onErrorReport(err, editImage);
    } finally {
      setIsLoading(false);
    }
  };

  const animateVideo = async () => {
    if (!image) return;
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    setIsLoading(true);
    setProgress('Iniciando motor Veo 3.1 (esto puede tardar unos minutos)...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Anima suavemente esta escena',
        image: { imageBytes: base64Data, mimeType: 'image/png' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: videoAspectRatio }
      });

      while (!operation.done) {
        setProgress('El motor Veo está soñando tu video... Sintonizando frecuencias temporales.');
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        setResult({ type: 'video', url: `${uri}&key=${process.env.API_KEY}` });
      }
    } catch (err) {
      console.error(err);
      if (onErrorReport) onErrorReport(err, animateVideo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-[#050810] border border-cyan-500/20 rounded-[3rem] p-10 flex flex-col shadow-[0_0_150px_rgba(34,211,238,0.1)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-orbitron text-white tracking-widest uppercase">Laboratorio Visual Estelar</h2>
            <p className="text-[10px] font-orbitron text-cyan-500 uppercase tracking-widest mt-1">IA Generativa de Imagen y Video</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
          </button>
        </div>

        <div className="flex gap-4 mb-8 bg-white/5 p-2 rounded-2xl border border-white/5">
          {(['gen', 'edit', 'video'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setResult(null); }} className={`flex-1 py-3 rounded-xl font-orbitron text-[10px] tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-cyan-600 text-black font-bold' : 'text-zinc-500 hover:text-white'}`}>
              {tab === 'gen' ? 'Generación Pro' : tab === 'edit' ? 'Edición Flash' : 'Animación Veo'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-6">
            <div className="aspect-video bg-white/5 border border-white/5 rounded-3xl overflow-hidden relative group">
              {image ? <img src={image} className="w-full h-full object-cover" alt="Source" /> : 
                <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                  <span className="text-[10px] font-orbitron uppercase">Carga una base visual</span>
                </div>
              }
              <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-orbitron text-[10px] tracking-widest">CAMBIAR IMAGEN</button>
            </div>

            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe tu visión estelar..." className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 outline-none" />

            <button onClick={activeTab === 'gen' ? generateImage : activeTab === 'edit' ? editImage : animateVideo} disabled={isLoading || (activeTab !== 'gen' && !image)} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-black font-orbitron font-bold text-[10px] tracking-[0.3em] rounded-2xl transition-all shadow-lg disabled:opacity-30">
              {isLoading ? 'TRANSFORMANDO...' : 'INICIAR PROCESO'}
            </button>
            {isLoading && <p className="text-center text-[10px] text-cyan-500 animate-pulse font-mono tracking-widest">{progress}</p>}
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative min-h-[300px]">
            {result ? (
              result.type === 'img' ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img src={result.url} className="w-full h-full object-contain rounded-2xl shadow-2xl" alt="Result" />
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center">
                  <video src={result.url} controls autoPlay loop className="w-full h-full rounded-2xl shadow-2xl" />
                </div>
              )
            ) : (
              <p className="text-[10px] font-orbitron uppercase tracking-widest opacity-20">Esperando flujo visual...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OraculoVisual;
