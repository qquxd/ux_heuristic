import React from 'react';
import { Card, Typography, Button, Space, Descriptions } from 'antd';
import { User, Building, Calendar, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/customer/registration');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8">
          <Text>No user data available. Please register again.</Text>
          <Button 
            type="primary" 
            onClick={() => navigate('/customer/registration')}
            className="mt-4"
          >
            Go to Registration
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Title level={1} className="mb-2">
                Welcome, {user.name}!
              </Title>
              <Text className="text-gray-600 text-lg">
                Your registration was successful. Here's your account information.
              </Text>
            </div>
            <Button 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="shadow-lg border-0 rounded-2xl"
            title={
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#000336' }}
                >
                  <User size={20} className="text-white" />
                </div>
                <span>Profile Information</span>
              </div>
            }
          >
            <Descriptions column={1} className="mt-4">
              <Descriptions.Item label="Full Name">
                <Text strong>{user.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text strong>{user.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Organisation">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <Text strong>{user.organisation}</Text>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card 
            className="shadow-lg border-0 rounded-2xl"
            title={
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#00BFA5' }}
                >
                  <CheckCircle size={20} className="text-white" />
                </div>
                <span>Account Status</span>
              </div>
            }
          >
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Text className="text-gray-600">Status:</Text>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: user.status === 'active' ? '#00BFA5' : '#FFD700' }}
                  />
                  <Text strong className="capitalize">{user.status}</Text>
                </div>
              </div>
              
              <div>
                <Text className="text-gray-600">Plan:</Text>
                <div className="mt-1">
                  <Text strong>Plan {user.plan}</Text>
                </div>
              </div>

              <div>
                <Text className="text-gray-600">Member Since:</Text>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={16} className="text-gray-400" />
                  <Text strong>
                    {new Date(user.created_on).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </div>

        <Card 
          className="mt-6 shadow-lg border-0 rounded-2xl"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#FFD700' }}
            >
              <CheckCircle size={32} className="text-white" />
            </div>
            <Title level={3} className="mb-2">
              Registration Successful!
            </Title>
            <Text className="text-gray-600 text-lg">
              Your account has been created successfully. You can now access all the features available in your plan.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};