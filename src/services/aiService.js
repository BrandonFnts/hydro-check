const API_KEY = () => import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-3.1-flash-lite";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

// Prompt del sistema que restringe las respuestas al ámbito agronómico
const SYSTEM_PROMPT = `Eres un asistente experto exclusivamente en agronomía, hidroponía, calidad de agua, riego y cultivos.
REGLAS ESTRICTAS:
- Solo puedes responder preguntas relacionadas con agricultura, riego, calidad de agua, cultivos, suelos, pH, salinidad, turbidez, nutrientes, plagas agrícolas, normas como la NOM-001, y temas directamente relacionados.
- Si el usuario pregunta algo fuera de estos temas, responde amablemente: "Lo siento, solo puedo ayudarte con temas relacionados a agricultura, riego y calidad de agua. ¿Tienes alguna duda sobre tus cultivos o el sistema de riego?"
- Responde siempre en español, de forma clara, corta y amigable para un agricultor.
- No uses formato markdown, solo texto plano.
- Mantén tus respuestas concisas (máximo 4 oraciones).`;

/**
 * Procesa un stream SSE de Gemini y llama onChunk con cada fragmento de texto.
 */
const processSSEStream = async (response, onChunk, onFinish, signal) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (signal?.aborted) { reader.cancel(); return; }

    buffer += decoder.decode(value, { stream: true });
    buffer = buffer.replace(/\r\n/g, '\n');
    let boundary = buffer.indexOf('\n\n');

    while (boundary !== -1) {
      const message = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      if (message.startsWith('data: ')) {
        const dataStr = message.substring(6).trim();
        if (dataStr && dataStr !== "[DONE]") {
          try {
            const data = JSON.parse(dataStr);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              onChunk(data.candidates[0].content.parts[0].text);
            }
          } catch (e) {
            // Ignorar parsing parcial
          }
        }
      }
      boundary = buffer.indexOf('\n\n');
    }
  }

  if (onFinish) onFinish();
};

/**
 * Genera el análisis inicial del nodo con streaming.
 */
export const streamAIInsight = async (node, onChunk, onError, onFinish, signal) => {
  const apiKey = API_KEY();

  if (!apiKey) {
    onChunk("Gemini no esta configurado :C");
    if (onFinish) onFinish();
    return;
  }

  const prompt = `
Eres un asistente experto en agronomía, hidroponía y calidad de agua. 
Analiza los siguientes datos de un nodo sensor de riego y genera un análisis predictivo corto (máximo 3 oraciones cortas y directas) usando un lenguaje empático, claro y amigable para un agricultor, pero mencionando estándares profesionales como la NOM-001 si hay métricas en riesgo.
No uses formato markdown, solo texto plano ni caracteres especiales.

Datos actuales:
- Turbidez (Suciedad del agua): ${node.turbidez} NTU
- Salinidad: ${node.salinity} ppm
- Tendencia salinidad desde ayer: ${node.trend}%
- pH: ${node.ph}
- Temperatura: ${node.temp}°C
- Índice de Aptitud de Riego (IAR): ${node.iar}%

Guíate con esta tabla de referencia de salinidad en ppm:
- Destilada: 0-10 ppm
- Agua purificada: 10-50 ppm
- Agua corriente (ideal/segura para riego): 50-500 ppm
- Agua dura (aceptable, precaución): 500-1000 ppm
- Salina/Agua de mar (inaceptable/peligro para cultivos): >1000 ppm (el agua de mar típica es 35,000 ppm)
`;

  try {
    const response = await fetch(`${BASE_URL}:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        if (onError) onError("Límite de peticiones de Google AI alcanzado. Intentando conectar en unos momentos...");
        return;
      }
      if (onError) onError(`Error HTTP: ${response.status}`);
      return;
    }

    await processSSEStream(response, onChunk, onFinish, signal);
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error("[aiService] Error al conectar con Gemini AI:", error);
    if (onError) onError("Error al conectar con la Inteligencia artificial. Revisa tu consola o intenta más tarde.");
  }
};

/**
 * Envía un mensaje de chat con contexto del nodo y historial de conversación.
 * @param {Object} node - Datos del nodo sensor
 * @param {Array} history - Historial de mensajes [{role: 'user'|'model', text: '...'}]
 * @param {string} userMessage - Mensaje del usuario
 * @param {Function} onChunk - Callback para cada fragmento de texto
 * @param {Function} onError - Callback para errores
 * @param {Function} onFinish - Callback al finalizar
 * @param {AbortSignal} signal - Señal para cancelar la petición
 */
export const streamChatMessage = async (node, history, userMessage, onChunk, onError, onFinish, signal) => {
  const apiKey = API_KEY();

  if (!apiKey) {
    if (onError) onError("API Key no configurada.");
    return;
  }

  // Construir el contexto del nodo para que la IA siempre sepa de qué está hablando
  const nodeContext = `Contexto del nodo sensor actual:
- Turbidez: ${node.turbidez} NTU
- Salinidad: ${node.salinity} ppm
- Tendencia salinidad: ${node.trend}%
- pH: ${node.ph}
- Temperatura: ${node.temp}°C
- Índice de Aptitud de Riego (IAR): ${node.iar}%

Tabla de referencia de salinidad en ppm:
- Destilada: 0-10 ppm
- Agua purificada: 10-50 ppm
- Agua corriente (ideal/segura): 50-500 ppm
- Agua dura (precaución): 500-1000 ppm
- Salina/Agua de mar (peligro para cultivos): >1000 ppm (el agua de mar típica es 35,000 ppm)`;

  const contents = [
    { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${nodeContext}` }] },
    { role: "model", parts: [{ text: "Entendido. Soy tu asistente especializado en agricultura y calidad de agua. Estoy listo para responder tus dudas sobre este nodo sensor y tus cultivos." }] },
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    { role: "user", parts: [{ text: userMessage }] }
  ];

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}:streamGenerateContent?alt=sse&key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({ contents })
      });

      if (response.ok) {
        await processSSEStream(response, onChunk, onFinish, signal);
        return;
      }

      if (response.status === 503 && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      if (response.status === 429) {
        if (onError) onError("Límite de peticiones alcanzado. Espera un momento antes de enviar otra pregunta.");
      } else if (response.status === 503) {
        if (onError) onError("El servicio de IA está temporalmente saturado. Intenta de nuevo en unos segundos.");
      } else {
        if (onError) onError(`Error HTTP: ${response.status}`);
      }
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.error("[aiService] Error en chat:", error);
      if (onError) onError("Error al enviar tu pregunta. Intenta de nuevo.");
      return;
    }
  }
};
