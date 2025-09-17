import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { User, Mail, Lock, Building, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { AuthService, RegisterRequest } from '../../../services/authService';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { FormErrorDisplay } from '../../../components/error/FormErrorDisplay';
import { ErrorHandler } from '../../../utils/errorHandler';
import { ValidationError, ErrorResponse } from '../../../types/error.types';

const { Title, Text } = Typography;

interface FormData {
  email: string;
  name: string;
  password: string;
  password2: string;
  organisation: string;
}

export const RegistrationForm: React.FC = () => {
  const [form] = Form.useForm<FormData>();
  const navigate = useNavigate();
  const { setUser, setTokens, setLoading, setError, isLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<ErrorResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      setApiError(null);
      setValidationErrors([]);
      setError(null);

      const registerData: RegisterRequest = {
        email: values.email,
        name: values.name,
        password: values.password,
        password2: values.password2,
        organisation: values.organisation,
      };

      const response = await AuthService.register(registerData);
      
      // Store tokens
      setTokens(response.access, response.refresh);
      
      // Store user data
      setUser(response.user);
      
      // Navigate to dashboard or success page
      navigate('/customer/dashboard');
      
    } catch (error: any) {
      const errorResponse = error as ErrorResponse;
      
      if (errorResponse.details) {
        const validationErrors = ErrorHandler.parseValidationErrors(errorResponse.details);
        setValidationErrors(validationErrors);
      } else {
        setApiError(errorResponse);
      }
      
      setError(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string): { validateStatus?: 'error'; help?: string } => {
    const error = ErrorHandler.getFieldError(validationErrors, fieldName);
    return error ? { validateStatus: 'error', help: error } : {};
  };

  const handleRetry = () => {
    setApiError(null);
    setValidationErrors([]);
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
              <User size={32} className="text-white" />
            </div>
            <Title level={2} className="mb-2 text-gray-800">
              Create Account
            </Title>
            <Text className="text-gray-600 text-base">
              Join our platform and get started today
            </Text>
          </div>

          {apiError && (
            <ErrorDisplay 
              error={apiError} 
              onRetry={handleRetry}
              className="mb-6"
            />
          )}

          <FormErrorDisplay 
            errors={validationErrors} 
            className="mb-6"
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="text-gray-700 font-medium">Full Name</span>}
              name="name"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
              {...getFieldError('name')}
            >
              <Input
                size="large"
                prefix={<User size={16} className="text-gray-400" />}
                placeholder="Enter your full name"
                className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
              {...getFieldError('email')}
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
              label={<span className="text-gray-700 font-medium">Organisation</span>}
              name="organisation"
              rules={[
                { required: true, message: 'Please enter your organisation name' },
                { min: 2, message: 'Organisation name must be at least 2 characters' },
              ]}
              {...getFieldError('organisation')}
            >
              <Input
                size="large"
                prefix={<Building size={16} className="text-gray-400" />}
                placeholder="Enter your organisation name"
                className="rounded-lg border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
              {...getFieldError('password')}
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

            <Form.Item
              label={<span className="text-gray-700 font-medium">Confirm Password</span>}
              name="password2"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              {...getFieldError('password2')}
            >
              <Input
                size="large"
                type={showConfirmPassword ? 'text' : 'password'}
                prefix={<Lock size={16} className="text-gray-400" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                placeholder="Confirm your password"
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6" />

          <div className="text-center">
            <Text className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/customer/login')}
                className="font-medium hover:underline transition-all"
                style={{ color: '#000336' }}
                disabled={isLoading}
              >
                Sign in here
              </button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};