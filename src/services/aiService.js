export const streamAIInsight = async (node, onChunk, onError, onFinish, signal) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
- Salinidad (CE): ${node.salinity} ppt
- Tendencia salinidad desde ayer: ${node.trend}%
- pH: ${node.ph}
- Temperatura: ${node.temp}°C
- Índice de Aptitud de Riego (IAR): ${node.iar}%
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal,
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

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
              if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                onChunk(data.candidates[0].content.parts[0].text);
              }
            } catch (e) {
            }
          }
        }
        boundary = buffer.indexOf('\n\n');
      }
    }

    if (onFinish) onFinish();
  } catch (error) {
    // Si se abortó la petición (por cambio de nodo), ignorar silenciosamente
    if (error.name === 'AbortError') return;
    console.error("[aiService] Error al conectar con Gemini AI:", error);
    if (onError) onError("Error al conectar con la Inteligencia artificial. Revisa tu consola o intenta más tarde.");
  }
};
