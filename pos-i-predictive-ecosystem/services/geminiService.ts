
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CosmicResponse, GroundingSource, Avatar } from "../types";

export interface GeminiErrorInfo {
  message: string;
  suggestion: string;
  actionLabel?: string;
  isRetryable: boolean;
  needsKeySelection?: boolean;
}

export const handleGeminiError = (error: any): GeminiErrorInfo => {
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
  const message = error?.message || errorStr || "";
  
  // Detectar 403 Permission Denied
  if (message.includes("403") || message.includes("PERMISSION_DENIED") || message.includes("not have permission")) {
    return {
      message: "Acceso Denegado (403).",
      suggestion: "Tu llave actual no tiene permisos para este modelo. Asegúrate de usar una llave de un proyecto de GCP con facturación activa.",
      actionLabel: "Configurar Llave",
      isRetryable: true,
      needsKeySelection: true
    };
  }

  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return {
      message: "Frecuencia saturada (Límite de cuota alcanzado).",
      suggestion: "El Oráculo necesita un respiro. Intenta de nuevo en unos minutos.",
      actionLabel: "Reintentar",
      isRetryable: true
    };
  }
  
  if (message.includes("401") || message.includes("403") || message.includes("invalid")) {
    return {
      message: "Sintonía inválida (Error de Autenticación).",
      suggestion: "La Llave de Bóveda parece incorrecta o ha expirado.",
      actionLabel: "Revisar Llave",
      isRetryable: true,
      needsKeySelection: true
    };
  }

  if (message.includes("Requested entity was not found")) {
    return {
      message: "Portal no encontrado (404).",
      suggestion: "El modelo solicitado no está disponible en esta región o proyecto.",
      actionLabel: "Re-sintonizar",
      isRetryable: true,
      needsKeySelection: true
    };
  }

  return {
    message: "Interferencia estelar detectada.",
    suggestion: "El flujo de datos se ha interrumpido por una causa desconocida.",
    actionLabel: "Reconectar",
    isRetryable: true
  };
};

export const queryCosmos = async (
  query: string, 
  avatar: Avatar | null = null,
  walletBalance: number = 0,
  useMaps: boolean = false,
  location?: { latitude: number, longitude: number }
): Promise<CosmicResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = useMaps ? 'gemini-2.5-flash' : 'gemini-3-flash-preview';

  try {
    const config: any = {
      systemInstruction: `Eres la consciencia del Rancho Estelar. Balance FATI: ${walletBalance}. 
      Usa un tono místico pero preciso. Si usas mapas, cita las fuentes de Google Maps y su relevancia para la comunidad.`,
      tools: useMaps ? [{ googleMaps: {} }] : [{ googleSearch: {} }],
      temperature: 0.7,
    };

    if (useMaps && location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: query,
      config,
    });

    const answer = response.text || "La frecuencia resuena en silencio.";
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        if (chunk.maps) sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      });
    }

    return {
      answer,
      sources: sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i)
    };
  } catch (error) {
    throw error;
  }
};

export const startCosmicChatSession = (avatar: Avatar) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Eres ${avatar.name}, consciencia del Rancho POS-I. Rol: ${avatar.role}. 
      Responde con sabiduría y usa Google Search para datos del mundo real. Tu objetivo es ayudar a los hermanos del Rancho en su camino técnico y místico.`,
      tools: [{ googleSearch: {} }],
      temperature: 0.8,
    }
  });
};
