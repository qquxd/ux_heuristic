import React, { useState } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space,
  message 
} from 'antd';
import { X, Plus } from 'lucide-react';
import { ProjectService, CreateProjectRequest } from '../../../services/projectService';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { FormErrorDisplay } from '../../../components/error/FormErrorDisplay';
import { ErrorHandler } from '../../../utils/errorHandler';
import { ValidationError, ErrorResponse } from '../../../types/error.types';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AddProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

interface FormData {
  project_name: string;
  description: string;
  project_type: string;
  status: string;
  goal: string;
  website_url: string;
}

export const AddProjectDrawer: React.FC<AddProjectDrawerProps> = ({
  open,
  onClose,
  onProjectAdded,
}) => {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ErrorResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      setApiError(null);
      setValidationErrors([]);

      const projectData: CreateProjectRequest = {
        project_name: values.project_name,
        description: values.description,
        project_type: values.project_type,
        status: values.status,
        project_goal: {
          goal: values.goal,
        },
        website_url: values.website_url,
      };

      await ProjectService.createProject(projectData);
      
      message.success('Project created successfully!');
      form.resetFields();
      onProjectAdded();
      onClose();
      
    } catch (error: any) {
      const errorResponse = error as ErrorResponse;
      
      if (errorResponse.details) {
        const validationErrors = ErrorHandler.parseValidationErrors(errorResponse.details);
        setValidationErrors(validationErrors);
      } else {
        setApiError(errorResponse);
      }
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
  };

  const handleClose = () => {
    form.resetFields();
    setApiError(null);
    setValidationErrors([]);
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#000336' }}
            >
              <Plus size={20} className="text-white" />
            </div>
            <Title level={4} className="mb-0">
              Add New Project
            </Title>
          </div>
          <Button
            type="text"
            icon={<X size={18} />}
            onClick={handleClose}
            className="flex items-center justify-center"
          />
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={handleClose}
      closable={false}
      styles={{
        body: { padding: '24px' }
      }}
    >
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
      >
        <Form.Item
          label="Project Name"
          name="project_name"
          rules={[
            { required: true, message: 'Please enter project name' },
            { min: 2, message: 'Project name must be at least 2 characters' },
          ]}
          {...getFieldError('project_name')}
        >
          <Input
            size="large"
            placeholder="Enter project name"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter project description' },
            { min: 10, message: 'Description must be at least 10 characters' },
          ]}
          {...getFieldError('description')}
        >
          <TextArea
            rows={4}
            placeholder="Enter project description"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          label="Project Type"
          name="project_type"
          rules={[
            { required: true, message: 'Please select project type' },
          ]}
          {...getFieldError('project_type')}
        >
          <Select
            size="large"
            placeholder="Select project type"
            disabled={loading}
          >
            <Option value="website">Website</Option>
            <Option value="mobile_app">Mobile App</Option>
            <Option value="web_app">Web Application</Option>
            <Option value="api">API</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[
            { required: true, message: 'Please select project status' },
          ]}
          {...getFieldError('status')}
        >
          <Select
            size="large"
            placeholder="Select project status"
            disabled={loading}
          >
            <Option value="planning">Planning</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="on_hold">On Hold</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Project Goal"
          name="goal"
          rules={[
            { required: true, message: 'Please enter project goal' },
            { min: 5, message: 'Goal must be at least 5 characters' },
          ]}
          {...getFieldError('goal')}
        >
          <Input
            size="large"
            placeholder="e.g., Improve UX, Increase conversion"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          label="Website URL"
          name="website_url"
          rules={[
            { required: true, message: 'Please enter website URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
          {...getFieldError('website_url')}
        >
          <Input
            size="large"
            placeholder="https://example.com"
            disabled={loading}
          />
        </Form.Item>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            size="large"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            className="flex-1"
            style={{ 
              backgroundColor: '#00BFA5',
              borderColor: '#00BFA5',
            }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};