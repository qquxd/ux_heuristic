import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Typography, ConfigProvider } from 'antd';
import { 
  LayoutDashboard, 
  FolderOpen, 
  User, 
  LogOut, 
  Menu as MenuIcon,
  X 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/customer/login');
  };

  const handleProfile = () => {
    // Navigate to profile page when implemented
    console.log('Navigate to profile');
  };

  const menuItems = [
    {
      key: '/customer/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
      onClick: () => navigate('/customer/dashboard'),
    },
    {
      key: '/customer/projects',
      icon: <FolderOpen size={18} />,
      label: 'Projects',
      onClick: () => navigate('/customer/projects'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Profile',
      onClick: handleProfile,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#00BFA5',
            itemSelectedColor: '#ffffff',
            itemHoverBg: 'rgba(0, 191, 165, 0.1)',
            itemHoverColor: '#00BFA5',
          },
        },
      }}
    >
      <Layout className="min-h-screen">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="bg-white shadow-lg"
          width={250}
          collapsedWidth={80}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#00BFA5' }}
              >
                <Text className="text-white font-bold text-lg">
                  {collapsed ? 'L' : 'Logo'}
                </Text>
              </div>
              {!collapsed && (
                <div>
                  <Text strong className="text-gray-800 block">
                    Your Platform
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Dashboard
                  </Text>
                </div>
              )}
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none mt-4"
            style={{ backgroundColor: 'transparent' }}
          />
        </Sider>

        <Layout>
          <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
            <Button
              type="text"
              icon={collapsed ? <MenuIcon size={18} /> : <X size={18} />}
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center"
            />

            <div className="flex items-center gap-4">
              <Text className="text-gray-600 hidden md:block text-base font-medium">
                Welcome back, {user?.name}
              </Text>
              
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                  <Avatar 
                    size="large"
                    style={{ backgroundColor: '#00BFA5' }}
                    className="flex items-center justify-center"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="hidden md:block">
                    <Text strong className="text-gray-800 block text-base font-semibold">
                      {user?.name}
                    </Text>
                    <Text className="text-gray-500 text-sm font-medium">
                      {user?.organisation}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Header>

          <Content className="p-6 bg-gray-50">
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};