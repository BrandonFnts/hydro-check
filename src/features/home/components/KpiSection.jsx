import { Statistic, Row, Col, Card, Progress, Tag, Badge } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const KpiSection = ({ node }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* KPI 1: Índice de Aptitud de Riego (IAR) */}
      <Col xs={24} md={12}>
        <Card variant="borderless" className="shadow-sm h-full text-center">
          <h4 className="text-gray-500 font-bold mb-2">Aptitud de Riego (IAR)</h4>
          <Progress 
            type="dashboard" 
            percent={node.iar} 
            strokeColor={node.iar > 80 ? '#52c41a' : node.iar > 50 ? '#faad14' : '#f5222d'}
            format={percent => `${percent}%`}
          />
          <p className="text-xs text-gray-400 mt-2">Basado en pH ({node.ph}) y CE ({node.salinity})</p>
        </Card>
      </Col>

      {/* KPI 2: Tendencia de Salinidad */}
      <Col xs={24} md={12}>
        <Card variant="borderless" className="shadow-sm h-full flex flex-col justify-center">
          <Statistic
            title="Tendencia Salinidad"
            value={Math.abs(node.trend)}
            precision={1}
            valueStyle={{ color: node.trend > 0 ? '#cf1322' : '#3f8600' }}
            prefix={node.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix="%"
          />
          <p className="text-xs text-gray-400 mt-2">Vs última alerta histórica</p>
        </Card>
      </Col>

      {/* KPI 3: Semáforo de Cultivos */}
      <Col xs={24}>
        <Card variant="borderless" className="shadow-sm" title={<span className="text-sm font-bold text-gray-600">Aptitud por Cultivo</span>}>
          <div className="flex flex-wrap gap-2">
            <Tag color={node.salinity < 2.0 ? 'success' : 'error'} className="text-sm px-3 py-1">
              🌽 Maíz / Alfalfa 
            </Tag>
            <Tag color={node.salinity < 1.0 ? 'success' : 'error'} className="text-sm px-3 py-1">
              🥬 Hortalizas / Cilantro
            </Tag>
          </div>
        </Card>
      </Col>

      {/* KPI 4: Carga de Sólidos */}
      <Col xs={24} md={12}>
        <Card variant="borderless" className="shadow-sm h-full">
          <h4 className="text-gray-500 font-bold mb-2 text-xs uppercase">Carga de Sólidos</h4>
          <div className="text-lg font-bold mb-1">
             {node.turbidez < 50 ? 'Clara' : node.turbidez < 100 ? 'Turbia' : 'Muy Turbia'}
          </div>
          <Badge 
            status={node.turbidez < 100 ? 'success' : 'warning'} 
            text={node.turbidez < 100 ? 'Filtros Seguros' : 'Riesgo Taponamiento'} 
          />
        </Card>
      </Col>

      {/* KPI 5: Temperatura */}
      <Col xs={24} md={12}>
        <Card variant="borderless" className="shadow-sm h-full">
          <h4 className="text-gray-500 font-bold mb-2 text-xs uppercase">Temperatura</h4>
          <div className="flex items-center gap-3">
             <div className="text-2xl text-orange-500">
                🌡️
             </div>
             <div>
               <div className="text-xl font-bold">{node.temp} °C</div>
               <div className="text-xs text-gray-400">Temperatura del Agua</div>
             </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default KpiSection;
