import React, { useState } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space,
  message,
  Alert
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

  const handleFormValuesChange = () => {
    // Clear validation errors when form values change
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    if (apiError) {
      setApiError(null);
    }
  };
  return (
    <Drawer
      title={
        <div className="flex items-center justify-between" role="banner">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#00BFA5' }}
              aria-hidden="true"
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
            aria-label="Close drawer"
          />
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={handleClose}
      closable={false}
      destroyOnClose
      maskClosable={false}
      keyboard={true}
      styles={{
        body: { padding: '24px' }
      }}
      role="dialog"
      aria-labelledby="drawer-title"
      aria-modal="true"
    >
      <Alert
        message="Create New Project"
        description="Fill in the details below to create a new project. All fields marked with * are required."
        type="info"
        showIcon
        className="mb-6"
        role="region"
        aria-label="Form instructions"
      />

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
        onValuesChange={handleFormValuesChange}
        autoComplete="off"
        requiredMark={false}
        preserve={false}
        scrollToFirstError
      >
        <Form.Item
          label={<span>Project Name <span className="text-red-500" aria-label="required">*</span></span>}
          name="project_name"
          rules={[
            { required: true, message: 'Please enter project name' },
            { min: 2, message: 'Project name must be at least 2 characters' },
            { max: 100, message: 'Project name must not exceed 100 characters' },
            { whitespace: true, message: 'Project name cannot be empty' },
          ]}
          {...getFieldError('project_name')}
        >
          <Input
            size="large"
            placeholder="Enter project name"
            disabled={loading}
            maxLength={100}
            showCount
            aria-describedby="project-name-help"
          />
          <div id="project-name-help" className="sr-only">
            Enter a descriptive name for your project (2-100 characters)
          </div>
        </Form.Item>

        <Form.Item
          label={<span>Description <span className="text-red-500" aria-label="required">*</span></span>}
          name="description"
          rules={[
            { required: true, message: 'Please enter project description' },
            { min: 10, message: 'Description must be at least 10 characters' },
            { max: 500, message: 'Description must not exceed 500 characters' },
            { whitespace: true, message: 'Description cannot be empty' },
          ]}
          {...getFieldError('description')}
        >
          <TextArea
            rows={4}
            placeholder="Enter project description"
            disabled={loading}
            maxLength={500}
            showCount
            aria-describedby="description-help"
          />
          <div id="description-help" className="sr-only">
            Provide a detailed description of your project (10-500 characters)
          </div>
        </Form.Item>

        <Form.Item
          label={<span>Project Type <span className="text-red-500" aria-label="required">*</span></span>}
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
            aria-describedby="project-type-help"
          >
            <Option value="website">Website</Option>
            <Option value="mobile_app">Mobile App</Option>
            <Option value="web_app">Web Application</Option>
            <Option value="api">API</Option>
            <Option value="other">Other</Option>
          </Select>
          <div id="project-type-help" className="sr-only">
            Choose the type of project you are creating
          </div>
        </Form.Item>

        <Form.Item
          label={<span>Status <span className="text-red-500" aria-label="required">*</span></span>}
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
            aria-describedby="status-help"
          >
            <Option value="planning">Planning</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="on_hold">On Hold</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          <div id="status-help" className="sr-only">
            Select the current status of your project
          </div>
        </Form.Item>

        <Form.Item
          label={<span>Project Goal <span className="text-red-500" aria-label="required">*</span></span>}
          name="goal"
          rules={[
            { required: true, message: 'Please enter project goal' },
            { min: 5, message: 'Goal must be at least 5 characters' },
            { max: 200, message: 'Goal must not exceed 200 characters' },
            { whitespace: true, message: 'Goal cannot be empty' },
          ]}
          {...getFieldError('goal')}
        >
          <Input
            size="large"
            placeholder="e.g., Improve UX, Increase conversion"
            disabled={loading}
            maxLength={200}
            showCount
            aria-describedby="goal-help"
          />
          <div id="goal-help" className="sr-only">
            Describe the main goal or objective of this project (5-200 characters)
          </div>
        </Form.Item>

        <Form.Item
          label={<span>Website URL <span className="text-red-500" aria-label="required">*</span></span>}
          name="website_url"
          rules={[
            { required: true, message: 'Please enter website URL' },
            { type: 'url', message: 'Please enter a valid URL' },
            { whitespace: true, message: 'Website URL cannot be empty' },
          ]}
          {...getFieldError('website_url')}
        >
          <Input
            size="large"
            placeholder="https://example.com"
            disabled={loading}
            aria-describedby="url-help"
          />
          <div id="url-help" className="sr-only">
            Enter the full URL of the website (must start with http:// or https://)
          </div>
        </Form.Item>

        <div className="flex gap-3 pt-4 border-t border-gray-200" role="group" aria-label="Form actions">
          <Button
            size="large"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
            aria-label="Cancel and close form"
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
            aria-label={loading ? 'Creating project, please wait' : 'Create new project'}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};