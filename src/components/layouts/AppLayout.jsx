import { useState } from 'react';
import { Button, Layout, Drawer, Menu, message, Tooltip } from 'antd';
import { MenuOutlined, HomeOutlined, InfoCircleOutlined, DashboardOutlined, RocketOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { seedMockData } from '@/utils/simulator';

const { Header, Content } = Layout;

export const AppLayout = ({ alerts, monitors }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleMenuClick = ({ key }) => {
    setIsMenuVisible(false);
    if (key === '/') navigate('/');
    if (key === '/dashboard') navigate('/dashboard');
  };

  const handleSimulate = () => {
    seedMockData();
    message.success("Datos de prueba enviados a Firebase (Realtime)");
  };

  return (
    <Layout className="min-h-screen relative" style={{ background: '#f5f5f5' }}>
      <Header className="bg-white px-4 flex items-center justify-between z-10 shadow-md relative" style={{ height: '64px', lineHeight: '64px', padding: '0 20px', background: '#fff' }}>
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ fontSize: '20px' }} />} 
            onClick={() => setIsMenuVisible(true)}
            style={{ padding: '0 8px' }}
          />
          <h1 onClick={() => navigate('/')} className="text-xl md:text-2xl font-bold text-gray-800 m-0 tracking-wide flex items-center cursor-pointer">
            Hydro<span className="text-blue-600">Check</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip title="Simular lectura de RTU">
            <Button 
              type="default" 
              icon={<RocketOutlined className="text-blue-600" />} 
              onClick={handleSimulate}
              className="border-blue-200 hover:border-blue-500 hover:text-blue-600 shadow-sm"
            >
              <span className="hidden sm:inline">Simular</span>
            </Button>
          </Tooltip>
          <Button 
            type="primary" 
            icon={<DashboardOutlined />} 
            size="middle"
            className="shadow-md"
            onClick={() => navigate('/dashboard')}
          >
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </div>
      </Header>
      
      <Drawer
        title="Menú de Navegación"
        placement="left"
        onClose={() => setIsMenuVisible(false)}
        open={isMenuVisible}
        styles={{ body: { padding: 0 } }}
      >
        <Menu 
            mode="vertical" 
            selectedKeys={[location.pathname]} 
            onClick={handleMenuClick}
            className="border-r-0"
            items={[
               { key: '/', icon: <HomeOutlined />, label: 'Vista General' },
               { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard de Alertas' },
               { key: '/about', icon: <InfoCircleOutlined />, label: 'Acerca del Sistema' },
            ]}
        />
      </Drawer>

      <Content className="relative">
        <Outlet />
      </Content>
    </Layout>
  );
};
