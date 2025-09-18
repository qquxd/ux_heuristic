import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { AuthService, LoginRequest } from '../../../services/authService';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { ErrorResponse } from '../../../types/error.types';

const { Title, Text } = Typography;

interface FormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [form] = Form.useForm<FormData>();
  const navigate = useNavigate();
  const { setUser, setTokens, setLoading, setError, isLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<ErrorResponse | null>(null);

  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || dev;

  // Dummy credentials for development
  const dummyCredentials = {
    email: 'user@example.com',
    password: 'testpass123'
  };

  const handleDummyLogin = () => {
    form.setFieldsValue(dummyCredentials);
  };

  const handleSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      setApiError(null);
      setError(null);

      const loginData: LoginRequest = {
        email: values.email,
        password: values.password,
      };

      const response = await AuthService.login(loginData);
      
      // Store tokens
      setTokens(response.access, response.refresh);
      
      // Store user data
      setUser(response.user);
      
      // Navigate to dashboard
      navigate('/customer/dashboard');
      
    } catch (error: any) {
      const errorResponse = error as ErrorResponse;
      setApiError(errorResponse);
      setError(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setApiError(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card 
          className="shadow-lg border-0 rounded-2xl overflow-hidden"
          styles={{
            body: { padding: '32px' }
          }}
        >
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#000336' }}
            >
              <LogIn size={32} className="text-white" />
            </div>
            <Title level={2} className="mb-2 text-gray-800">
              Welcome Back
            </Title>
            <Text className="text-gray-600 text-base">
              Sign in to your account to continue
            </Text>
            {isDevelopment && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text className="text-yellow-800 text-sm block mb-2">
                  🚀 Development Mode
                </Text>
                <Button
                  size="small"
                  onClick={handleDummyLogin}
                  className="text-yellow-700 border-yellow-300 hover:border-yellow-400"
                  disabled={isLoading}
                >
                  Use Dummy Credentials
                </Button>
              </div>
            )}
          </div>

          {apiError && (
            <ErrorDisplay 
              error={apiError} 
              onRetry={handleRetry}
              className="mb-6"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="text-gray-700 font-medium">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input
                size="large"
                prefix={<Mail size={16} className="text-gray-400" />}
                placeholder="Enter your email address"
                className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
              ]}
            >
              <Input
                size="large"
                type={showPassword ? 'text' : 'password'}
                prefix={<Lock size={16} className="text-gray-400" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                placeholder="Enter your password"
                className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isLoading}
                className="w-full rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: '#00BFA5',
                  borderColor: '#00BFA5',
                  height: '48px'
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6" />

          <div className="text-center">
            <Text className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/customer/registration')}
                className="font-medium hover:underline transition-all"
                style={{ color: '#000336' }}
                disabled={isLoading}
              >
                Create one here
              </button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};