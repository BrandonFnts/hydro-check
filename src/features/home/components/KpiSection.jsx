import { useState, useEffect, useRef, useCallback } from 'react';
import { Statistic, Row, Col, Card, Progress, Tag, Badge, Typography, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, RobotOutlined, WarningOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { streamAIInsight } from '@/services/aiService';

const { Text } = Typography;

const KpiSection = ({ node }) => {
  const [aiMessage, setAiMessage] = useState("");
  const [loadingAi, setLoadingAi] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

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
        }
      }, 15);
    };

    const loadingRef = { current: true };

    const fetchAI = async () => {
      setLoadingAi(true);
      setAiMessage("");

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
            <Tag color={node.salinity < 2.0 ? 'success' : 'error'} className="text-xs px-2 py-1 mx-0 flex justify-center">
              🌽 Apta para Maíz/Alfalfa
            </Tag>
            <Tag color={node.salinity < 1.0 ? 'success' : 'error'} className="text-xs px-2 py-1 mx-0 flex justify-center">
              🥬 Apta para Hortalizas Sensibles
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
