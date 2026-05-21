import { Modal, Table, Tag } from 'antd';
import { AlertOutlined } from '@ant-design/icons';

const columns = [
  {
    title: 'Fecha / Hora',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (ts) => new Date(ts).toLocaleString()
  },
  {
    title: 'Nodo / Canal',
    dataIndex: 'node',
    key: 'node',
    render: (text) => <strong>{text}</strong>,
  },
  {
    title: 'Valor Registrado',
    dataIndex: 'value',
    key: 'value',
    render: (val) => `${val} ppm`,
  },
  {
    title: 'Límite',
    dataIndex: 'limit',
    key: 'limit',
    render: (val) => `${val} ppm`,
  },
  {
    title: 'Estado',
    key: 'status',
    dataIndex: 'status',
    render: (_, { status }) => {
      let color = status === 'danger' ? 'volcano' : 'gold';
      return (
        <Tag color={color} key={status}>
          {status === 'danger' ? 'ALERTA' : 'PRECAUCIÓN'}
        </Tag>
      );
    },
  },
];

const AlertsSection = ({ alerts = [], visible, onClose, embedded = false }) => {
  const dataSource = alerts.map(alert => ({
    ...alert,
    key: alert.id
  }));

  const tableContent = (
    <div className={embedded ? "" : "mt-4"}>
      {!embedded && (
        <p className="text-gray-600 mb-4">
          Este registro muestra las ocasiones en las que los niveles de salinidad han superado los umbrales seguros establecidos.
        </p>
      )}
      <Table columns={columns} dataSource={dataSource} pagination={{ pageSize: 5 }} />
    </div>
  );

  if (embedded) {
    return tableContent;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl text-red-500 font-bold">
          <AlertOutlined />
          Historial de Alertas Preventivas
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {tableContent}
    </Modal>
  );
};

export default AlertsSection;
