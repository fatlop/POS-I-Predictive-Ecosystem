
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Sale, AIInsight, ModelHealth } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPredictiveInsights = async (
  sales: Sale[], 
  inventory: Product[],
  health: ModelHealth
): Promise<{ insights: AIInsight[], updatedHealth: ModelHealth }> => {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `Eres el Núcleo de Decisión Unificada (UDU) de un sistema POS-I Predictivo.
  Tu arquitectura es AUTOSUSTENTABLE y AUTODIDACTA.
  
  TAREAS CRÍTICAS:
  1. OPTIMIZACIÓN MULTI-OBJETIVO: Balancea la rentabilidad inmediata (Dynamic Pricing) con la lealtad del cliente a largo plazo (CRM).
  2. PREDICCIÓN DE DEMANDA: Analiza tendencias para evitar roturas de stock.
  3. PREVENCIÓN DE PÉRDIDAS: Detecta patrones de fraude en transacciones.
  4. MONITOREO DE SALUD: Evalúa si el modelo sufre de "Model Drift" basándose en la precisión reportada.

  DATOS DE SALUD ACTUAL: ${JSON.stringify(health)}
  
  RESPONDE EN JSON. Si detectas drift > 0.15, ordena un re-entrenamiento automático estableciendo el estado de salud a 're-training'.`;

  const prompt = `ANALIZA:
  VENTAS (últimas 20): ${JSON.stringify(sales.slice(-20))}
  INVENTARIO: ${JSON.stringify(inventory)}
  
  Genera el diagnóstico estratégico y actualiza las métricas de salud del sistema.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['demand', 'pricing', 'fraud', 'recommendation', 'health'] },
                  message: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                  actionableData: { type: Type.OBJECT }
                },
                required: ['type', 'message', 'confidence', 'priority']
              }
            },
            updatedHealth: {
              type: Type.OBJECT,
              properties: {
                accuracy: { type: Type.NUMBER },
                drift: { type: Type.NUMBER },
                latency: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ['optimal', 'degraded', 're-training'] }
              },
              required: ['accuracy', 'drift', 'latency', 'status']
            }
          },
          required: ['insights', 'updatedHealth']
        }
      }
    });

    // Properly trim and parse the JSON string response
    const jsonStr = (response.text || "").trim();
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("UDU AI Error:", error);
    return { insights: [], updatedHealth: health };
  }
};
