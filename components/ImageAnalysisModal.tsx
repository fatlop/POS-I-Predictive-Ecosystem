
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: "Analiza este objeto para el inventario del Rancho Estelar POS-I. Identifica qué es, su posible valor en $FATI y cómo encaja en nuestra comunidad simbiótica. Tono místico y técnico." }
          ]
        }
      });
      setAnalysis(response.text || "No se pudo sincronizar la imagen.");
    } catch (err) {
      console.error(err);
      setAnalysis("Error en la conexión neuronal con Gemini 3 Pro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-[#050810] border border-cyan-500/20 rounded-[3rem] p-10 flex flex-col md:flex-row gap-10 shadow-[0_0_100px_rgba(34,211,238,0.1)]">
        <div className="flex-1 space-y-6">
          <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center relative group">
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Scan" />
            ) : (
              <div className="text-center p-10">
                <svg className="w-20 h-20 text-zinc-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-xs font-orbitron text-zinc-600 uppercase tracking-widest">Sube una imagen para transmutar</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 p-4 bg-cyan-600 rounded-full text-black hover:scale-110 transition-all shadow-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <button 
            onClick={analyzeImage} 
            disabled={!image || isLoading}
            className={`w-full py-5 rounded-2xl font-orbitron text-xs tracking-[0.4em] uppercase transition-all ${image && !isLoading ? 'bg-cyan-600 text-black font-bold shadow-lg shadow-cyan-900/20' : 'bg-zinc-800 text-zinc-600'}`}
          >
            {isLoading ? "Consultando al Oráculo..." : "Analizar con Gemini 3 Pro"}
          </button>
        </div>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-orbitron text-white uppercase tracking-widest">Diagnóstico Visual</h3>
            <button onClick={onClose} className="text-zinc-600 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg></button>
          </div>
          <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 overflow-y-auto custom-scrollbar">
            {analysis ? (
              <p className="text-gray-300 text-lg font-light leading-relaxed italic animate-in fade-in duration-1000">"{analysis}"</p>
            ) : (
              <div className="h-full flex items-center justify-center opacity-20 italic font-light text-zinc-500 text-center">
                Esperando flujo de datos visuales...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisModal;
