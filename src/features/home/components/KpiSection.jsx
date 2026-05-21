import { useState, useEffect, useRef } from 'react';
import { Statistic, Row, Col, Card, Progress, Tag, Badge, Typography, Spin, Input, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, RobotOutlined, WarningOutlined, CheckCircleOutlined, LoadingOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons';
import { streamAIInsight, streamChatMessage } from '@/services/aiService';

const { Text } = Typography;

// ─── Componente de Chat ──────────────────────────────────────
const AiChat = ({ node, initialAnalysis }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll interno del chat (no mueve la página)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Resetear chat cuando cambia el nodo
  useEffect(() => {
    setMessages([]);
    setIsOpen(false);
    setInput("");
  }, [node?.id]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isResponding) return;

    // Cancelar petición anterior si existe
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Agregar mensaje del usuario
    const userMsg = { role: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsResponding(true);

    // Preparar historial para la API (excluye el mensaje actual)
    const history = messages.map(m => ({ role: m.role, text: m.text }));

    let botText = "";
    // Agregar placeholder del bot
    setMessages(prev => [...prev, { role: "model", text: "" }]);

    await streamChatMessage(
      node,
      history,
      trimmed,
      (chunk) => {
        botText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "model", text: botText };
          return updated;
        });
      },
      (errorMsg) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "model", text: errorMsg, isError: true };
          return updated;
        });
        setIsResponding(false);
      },
      () => {
        setIsResponding(false);
      },
      abortRef.current.signal
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-3">
      {/* Botón para abrir/cerrar chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors cursor-pointer bg-transparent border-none p-0"
      >
        <MessageOutlined />
        {isOpen ? "Cerrar chat" : "¿Tienes dudas? Pregúntale a la IA"}
      </button>

      {isOpen && (
        <div className="mt-3 border border-blue-200 rounded-lg overflow-hidden bg-white">
          {/* Área de mensajes */}
          <div 
            ref={chatContainerRef}
            className="p-3 overflow-y-auto flex flex-col gap-2"
            style={{ maxHeight: '250px', minHeight: '100px' }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-xs py-4">
                Pregunta lo que necesites sobre tus cultivos, riego o calidad del agua.
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : msg.isError
                        ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                  }`}
                >
                  {msg.text || (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-2 border-t border-blue-100 bg-blue-50/50">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={isResponding}
              size="small"
              className="flex-1"
              maxLength={300}
            />
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={isResponding}
              disabled={!input.trim()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Componente Principal ────────────────────────────────────
const KpiSection = ({ node }) => {
  const [aiMessage, setAiMessage] = useState("");
  const [loadingAi, setLoadingAi] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    let charQueue = [];
    let displayedText = "";
    let typingInterval = null;

    const startTyping = () => {
      if (typingInterval) return;
      setIsTyping(true);
      typingInterval = setInterval(() => {
        if (charQueue.length > 0) {
          const nextChar = charQueue.shift();
          displayedText += nextChar;
          setAiMessage(displayedText);
        } else if (!loadingRef.current) {
          clearInterval(typingInterval);
          typingInterval = null;
          setIsTyping(false);
          setAnalysisComplete(true);
        }
      }, 15);
    };

    const loadingRef = { current: true };

    const fetchAI = async () => {
      setLoadingAi(true);
      setAiMessage("");
      setAnalysisComplete(false);

      await streamAIInsight(
        node,
        (chunk) => {
          if (abortController.signal.aborted) return;
          setLoadingAi(false);
          charQueue.push(...chunk);
          startTyping();
        },
        (errorMsg) => {
          if (abortController.signal.aborted) return;
          setLoadingAi(false);
          loadingRef.current = false;
          setAiMessage(errorMsg);
          setAnalysisComplete(true);
        },
        () => {
          loadingRef.current = false;
        },
        abortController.signal
      );
    };

    const nodeReady = node && node.id && node.turbidez !== undefined && node.salinity !== undefined;

    if (nodeReady) {
      fetchAI();
    }

    return () => {
      abortController.abort();
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [node?.id]);

  const statusIcon = node.iar > 80 ? <CheckCircleOutlined className="text-green-500 text-xl" /> : <WarningOutlined className="text-red-500 text-xl" />;

  return (
    <Row gutter={[16, 16]}>
      {/* KPI Predictivo / Agente Experto */}
      <Col xs={24}>
        <Card
          variant="borderless"
          className="shadow-md rounded-xl border-l-4 border-l-blue-500 bg-blue-50"
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div className="flex items-start gap-3">
            <RobotOutlined className="text-3xl text-blue-500 mt-1" />
            <div className="flex-1 w-full">
              <h4 className="text-blue-800 font-bold mb-1 m-0 text-sm">Análisis Predictivo del Sistema</h4>
              {loadingAi && !aiMessage ? (
                <div className="flex items-center gap-2 mt-2">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                  <Text className="text-blue-600 text-sm">Analizando datos con Gemini AI...</Text>
                </div>
              ) : (
                <Text className="text-gray-700 leading-relaxed text-sm block mt-1">
                  {aiMessage}
                  {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
                </Text>
              )}

              {/* Chat - solo visible después del análisis inicial */}
              {analysisComplete && <AiChat node={node} initialAnalysis={aiMessage} />}
            </div>
          </div>
        </Card>
      </Col>

      {/* KPI 1: Índice de Aptitud de Riego (IAR) y Semáforo */}
      <Col xs={24} md={12}>
        <Card variant="borderless" className="shadow-sm h-full text-center">
          <h4 className="text-gray-500 font-bold mb-1">Calidad del Agua para Riego</h4>
          <p className="text-xs text-gray-400 mb-3">Índice IAR basado en acidez y sales</p>
          <Progress
            type="dashboard"
            percent={node.iar}
            strokeColor={node.iar > 80 ? '#52c41a' : node.iar > 50 ? '#faad14' : '#f5222d'}
            format={percent => `${percent}%`}
            size={120}
          />
          <div className="mt-4 flex flex-col gap-2">
            <Tag color={node.salinity < 1000 ? 'success' : 'error'} className="text-xs px-2 py-1 mx-0 flex justify-center">
              🌽 Apta para Maíz/Alfalfa (Límite: 1000 ppm)
            </Tag>
            <Tag color={node.salinity < 500 ? 'success' : 'error'} className="text-xs px-2 py-1 mx-0 flex justify-center">
              🥬 Apta para Hortalizas Sensibles (Límite: 500 ppm)
            </Tag>
          </div>
        </Card>
      </Col>

      {/* Detalle de Variables Clave */}
      <Col xs={24} md={12}>
        <div className="flex flex-col gap-4 h-full">
          {/* Suciedad del Agua (Turbidez) */}
          <Card variant="borderless" className="shadow-sm bg-gray-50 flex-1">
            <h4 className="text-gray-500 font-bold mb-1 text-xs uppercase">Suciedad (Sólidos)</h4>
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-gray-800">
                {node.turbidez < 50 ? 'Agua Limpia' : node.turbidez < 100 ? 'Regular' : 'Muy Sucia'}
              </div>
              <Badge
                status={node.turbidez < 100 ? 'success' : 'warning'}
                text={node.turbidez < 100 ? 'Filtros Seguros' : 'Riesgo Tapones'}
              />
            </div>
          </Card>

          {/* Variación de Salinidad */}
          <Card variant="borderless" className="shadow-sm bg-gray-50 flex-1">
            <Row align="middle">
              <Col span={12}>
                <h4 className="text-gray-500 font-bold mb-1 text-xs uppercase">Riesgo a futuro</h4>
                <p className="text-xs text-gray-400 m-0 leading-tight">Crecimiento de sales desde ayer</p>
              </Col>
              <Col span={12} className="text-right">
                <Statistic
                  value={Math.abs(node.trend)}
                  precision={1}
                  valueStyle={{ color: node.trend > 0 ? '#cf1322' : '#3f8600', fontSize: '18px', fontWeight: 'bold' }}
                  prefix={node.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>

          {/* Temperatura */}
          <Card variant="borderless" className="shadow-sm bg-gray-50 flex-1">
            <h4 className="text-gray-500 font-bold mb-1 text-xs uppercase">Temperatura</h4>
            <div className="flex items-center gap-3">
              <span className="text-2xl text-orange-500 leading-none">🌡️</span>
              <div>
                <span className="text-xl font-bold text-gray-800">{node.temp} °C</span>
              </div>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default KpiSection;
