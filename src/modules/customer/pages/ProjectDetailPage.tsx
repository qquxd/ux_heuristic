import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Descriptions, 
  Tag, 
  Row, 
  Col, 
  Spin, 
  Empty,
  Table,
  Progress,
  Alert,
  Tooltip,
  Badge,
  message,
  TableColumnsType
} from 'antd';
import { 
  ArrowLeft, 
  Globe, 
  Target, 
  Calendar,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { ProjectService, Project } from '../../../services/projectService';
import { PageRoute } from '../../../types/project.types';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { ErrorResponse } from '../../../types/error.types';

const { Title, Text, Paragraph } = Typography;

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<PageRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [findingPages, setFindingPages] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [routesError, setRoutesError] = useState<ErrorResponse | null>(null);
  const [findPagesProgress, setFindPagesProgress] = useState(0);
  const [hasInitialRoutes, setHasInitialRoutes] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchAvailableRoutes();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll simulate getting project details from the projects list
      // In a real app, you'd have a getProject(id) API endpoint
      const projectsResponse = await ProjectService.getProjects();
      const foundProject = projectsResponse.results.find(p => p.id === parseInt(id!));
      
      if (foundProject) {
        setProject(foundProject);
      } else {
        setError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        });
      }
    } catch (err: any) {
      setError(err as ErrorResponse);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      setRoutesLoading(true);
      setRoutesError(null);
      
      const routes = await ProjectService.getAvailableRoutes(parseInt(id!));
      setAvailableRoutes(routes);
      setHasInitialRoutes(routes.length > 0);
    } catch (err: any) {
      setRoutesError(err as ErrorResponse);
      setAvailableRoutes([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleFindPages = async () => {
    try {
      setFindingPages(true);
      setRoutesError(null);
      setFindPagesProgress(0);

      // Simulate progress updates during the long-running operation
      const progressInterval = setInterval(() => {
        setFindPagesProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await ProjectService.findPages(parseInt(id!));
      
      clearInterval(progressInterval);
      setFindPagesProgress(100);
      
      // Replace (not append) the available routes with new data
      setAvailableRoutes(response.available_routes);
      
      message.success(`Found ${response.available_routes.length} pages successfully!`);
      
      setTimeout(() => {
        setFindPagesProgress(0);
      }, 1000);
      
    } catch (err: any) {
      setRoutesError(err as ErrorResponse);
      setFindPagesProgress(0);
      message.error('Failed to find pages. Please try again.');
    } finally {
      setFindingPages(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return { 
          color: '#00BFA5', 
          icon: <CheckCircle2 size={16} />, 
          label: 'Completed' 
        };
      case 'in_progress':
      case 'in progress':
        return { 
          color: '#FFD700', 
          icon: <Clock size={16} />, 
          label: 'In Progress' 
        };
      case 'planning':
        return { 
          color: '#1890ff', 
          icon: <Target size={16} />, 
          label: 'Planning' 
        };
      default:
        return { 
          color: '#666', 
          icon: <AlertCircle size={16} />, 
          label: status.replace('_', ' ') 
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTableColumns = (): TableColumnsType<PageRoute> => [
    {
      title: 'Page Name',
      dataIndex: 'page_name',
      key: 'page_name',
      width: 250,
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <FileSearch size={16} className="text-gray-400 flex-shrink-0" />
          <Text strong className="truncate" title={name}>
            {name}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.page_name.localeCompare(b.page_name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'active':
            case 'success':
              return '#00BFA5';
            case 'pending':
            case 'processing':
              return '#FFD700';
            case 'error':
            case 'failed':
              return '#ff4d4f';
            default:
              return '#666';
          }
        };
        
        return (
          <Badge
            color={getStatusColor(status)}
            text={
              <span className="capitalize font-medium">
                {status || 'Unknown'}
              </span>
            }
          />
        );
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Success', value: 'success' },
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Error', value: 'error' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value,
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: 'URL',
      dataIndex: 'page_url',
      key: 'page_url',
      render: (url: string) => (
        <Tooltip title={url}>
          <Text 
            className="text-blue-600 hover:text-blue-800 cursor-pointer truncate block max-w-xs"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          >
            {url}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: PageRoute) => (
        <Tooltip title={`Visit ${record.page_name}`}>
          <Button
            type="link"
            icon={<ExternalLink size={16} />}
            onClick={() => window.open(record.page_url, '_blank', 'noopener,noreferrer')}
            aria-label={`Visit ${record.page_name} (opens in new tab)`}
          >
            Visit
          </Button>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center py-20">
          <Spin size="large" />
          <Text className="mt-4 text-gray-500">Loading project details...</Text>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/customer/projects')}
            className="flex items-center gap-2"
          >
            Back to Projects
          </Button>
        </div>
        
        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={fetchProjectDetails}
          />
        )}
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(project.status);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/customer/projects')}
            className="flex items-center gap-2"
            aria-label="Back to projects"
          >
            Back to Projects
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <Title level={1} className="mb-2">
              {project.project_name}
            </Title>
            <div className="flex items-center gap-4 mb-4">
              <Badge
                color={statusConfig.color}
                text={
                  <span className="flex items-center gap-1 font-medium">
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                }
              />
              <Text className="text-gray-500 capitalize">
                {project.project_type.replace('_', ' ')}
              </Text>
            </div>
            <Paragraph className="text-gray-600 text-lg max-w-3xl">
              {project.description}
            </Paragraph>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="large"
              icon={<Globe size={18} />}
              onClick={() => window.open(project.website_url, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2"
            >
              Visit Website
            </Button>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card 
            title="Project Information"
            className="shadow-lg border-0 rounded-2xl"
          >
            <Descriptions column={{ xs: 1, sm: 2 }} className="mt-4">
              <Descriptions.Item label="Project Goal">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-gray-400" />
                  <Text>{project.project_goal.goal}</Text>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Project Type">
                <Text className="capitalize">
                  {project.project_type.replace('_', ' ')}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Badge
                  color={statusConfig.color}
                  text={
                    <span className="flex items-center gap-1">
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  }
                />
              </Descriptions.Item>

              <Descriptions.Item label="Website URL">
                <Button
                  type="link"
                  icon={<ExternalLink size={14} />}
                  onClick={() => window.open(project.website_url, '_blank', 'noopener,noreferrer')}
                  className="p-0 h-auto flex items-center gap-1"
                >
                  {project.website_url}
                </Button>
              </Descriptions.Item>

              {project.created_on && (
                <Descriptions.Item label="Created On">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <Text>{formatDate(project.created_on)}</Text>
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Quick Stats"
            className="shadow-lg border-0 rounded-2xl"
          >
            <Space direction="vertical" size="large" className="w-full">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {availableRoutes.length}
                </div>
                <Text className="text-gray-500">Available Pages</Text>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: statusConfig.color }}>
                  {statusConfig.label}
                </div>
                <Text className="text-gray-500">Current Status</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Available Pages Section */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#000336' }}
              >
                <FileSearch size={20} className="text-white" />
              </div>
              <span>Available Pages</span>
            </div>
            
            <div className="flex items-center gap-3">
              {findingPages && (
                <div className="flex items-center gap-2 mr-4">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <Text className="text-sm text-gray-600">
                    Finding pages... {Math.round(findPagesProgress)}%
                  </Text>
                </div>
              )}
              
              <Button
                type="primary"
                size="large"
                icon={findingPages ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                onClick={handleFindPages}
                loading={findingPages}
                disabled={findingPages}
                className="flex items-center gap-2"
                style={{ 
                  backgroundColor: '#00BFA5',
                  borderColor: '#00BFA5',
                }}
              >
                {findingPages ? 'Finding Pages...' : 'Find Pages'}
              </Button>
            </div>
          </div>
        }
        className="shadow-lg border-0 rounded-2xl"
      >
        {findingPages && (
          <div className="mb-6">
            <Progress 
              percent={Math.round(findPagesProgress)} 
              status="active"
              strokeColor="#00BFA5"
              className="mb-2"
            />
            <Alert
              message="Finding Pages"
              description="This process may take up to 30 seconds. Please wait while we discover all available pages on your website."
              type="info"
              showIcon
              icon={<Clock size={16} />}
            />
          </div>
        )}

        {routesError && (
          <ErrorDisplay 
            error={routesError} 
            onRetry={() => {
              setRoutesError(null);
              fetchAvailableRoutes();
            }}
            className="mb-6"
          />
        )}

        {routesLoading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <Spin size="large" />
            <Text className="mt-4 text-gray-500">Loading available pages...</Text>
          </div>
        ) : availableRoutes.length === 0 ? (
          <div className="text-center py-12">
            <Empty
              image={<FileSearch size={64} className="mx-auto text-gray-300" />}
              description={
                <div>
                  <Title level={4} className="text-gray-400 mb-2">
                    {hasInitialRoutes ? 'No Pages Found' : 'No Pages Available'}
                  </Title>
                  <Text className="text-gray-500">
                    {hasInitialRoutes 
                      ? "The search didn't find any pages. Try clicking 'Find Pages' to discover new pages."
                      : "No pages have been discovered yet. Click 'Find Pages' to start discovering pages on your website."
                    }
                  </Text>
                </div>
              }
            >
              <Button 
                type="primary" 
                size="large" 
                icon={<Search size={18} />}
                onClick={handleFindPages}
                loading={findingPages}
                className="mt-4"
                style={{ 
                  backgroundColor: '#00BFA5',
                  borderColor: '#00BFA5',
                }}
              >
                Find Pages
              </Button>
            </Empty>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Text className="text-gray-600">
                Found {availableRoutes.length} pages
              </Text>
              <Button
                icon={<RefreshCw size={16} />}
                onClick={fetchAvailableRoutes}
                disabled={routesLoading || findingPages}
                className="flex items-center gap-2"
              >
                Refresh
              </Button>
            </div>
            
            <Table<PageRoute>
              columns={getTableColumns()}
              dataSource={availableRoutes}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} pages`,
              }}
              scroll={{ x: 600 }}
              className="rounded-lg"
              size="middle"
            />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};