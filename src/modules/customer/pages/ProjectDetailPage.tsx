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
  TableColumnsType,
  Select
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
  Loader2,
  BarChart3,
  Eye,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { ProjectService, Project } from '../../../services/projectService';
import { PageRoute } from '../../../types/project.types';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { ErrorResponse } from '../../../types/error.types';
import { PageAnalysisModal } from '../components/PageAnalysisModal';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<PageRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<PageRoute[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [findingPages, setFindingPages] = useState(false);
  const [analyzingPages, setAnalyzingPages] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [routesError, setRoutesError] = useState<ErrorResponse | null>(null);
  const [findPagesProgress, setFindPagesProgress] = useState(0);
  const [hasInitialRoutes, setHasInitialRoutes] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<PageRoute | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchAvailableRoutes();
    }
  }, [id]);

  useEffect(() => {
    filterRoutes();
  }, [availableRoutes, statusFilter]);

  const filterRoutes = () => {
    let filtered = [...availableRoutes];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(route => route.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    setFilteredRoutes(filtered);
  };

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

  const handleAnalyzePages = async () => {
    try {
      setAnalyzingPages(true);
      setRoutesError(null);
      
      const pageIds = selectedRowKeys.map(key => Number(key));
      await ProjectService.analyzePages(parseInt(id!), pageIds);
      
      message.success(`Analysis started for ${pageIds.length} pages successfully!`);
      
      // Clear selection after successful analysis
      setSelectedRowKeys([]);

      // Refresh routes immediately to show updated status
      setTimeout(() => {
        fetchAvailableRoutes();
      }, 1000);
      
    } catch (err: any) {
      setRoutesError(err as ErrorResponse);
      message.error('Failed to start page analysis. Please try again.');
    } finally {
      setAnalyzingPages(false);
    }
  };

  const handleViewAnalysis = (page: PageRoute) => {
    setSelectedPage(page);
    setModalOpen(true);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(availableRoutes.map(route => route.status.toLowerCase()))];
    return statuses.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }));
  };

  const calculateAverageScore = () => {
    const scoresWithValues = availableRoutes
      .filter(route => route.ux_score && route.ux_score.trim() !== '')
      .map(route => parseFloat(route.ux_score));
    
    if (scoresWithValues.length === 0) return null;
    
    const sum = scoresWithValues.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scoresWithValues.length);
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
      case 'pending':
        return { 
          color: '#1890ff', 
          icon: <Clock size={16} />, 
          label: 'Pending' 
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
        const statusConfig = getStatusConfig(status);
        return (
          <Badge
            color={statusConfig.color}
            text={
              <span className="flex items-center gap-1 font-medium">
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            }
          />
        );
      },
      filters: getUniqueStatuses().map(status => ({
        text: status.label,
        value: status.value,
      })),
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
      title: 'UX Score',
      dataIndex: 'ux_score',
      key: 'ux_score',
      width: 100,
      render: (score: string) => (
        <Text className="font-medium">
          {score && score.trim() !== '' ? score : '-'}
        </Text>
      ),
      sorter: (a, b) => {
        const scoreA = a.ux_score && a.ux_score.trim() !== '' ? parseFloat(a.ux_score) : -1;
        const scoreB = b.ux_score && b.ux_score.trim() !== '' ? parseFloat(b.ux_score) : -1;
        return scoreA - scoreB;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record: PageRoute) => (
        <div className="flex items-center gap-2">
          <Tooltip title="View analysis details">
            <Button
              type="link"
              icon={<Eye size={16} />}
              onClick={() => handleViewAnalysis(record)}
              aria-label={`View ${record.page_name} analysis`}
              className="flex items-center justify-center p-0"
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title={`Visit ${record.page_name}`}>
            <Button
              type="link"
              icon={<ExternalLink size={16} />}
              onClick={() => window.open(record.page_url, '_blank', 'noopener,noreferrer')}
              aria-label={`Visit ${record.page_name} (opens in new tab)`}
              className="flex items-center justify-center p-0"
            >
              Visit
            </Button>
          </Tooltip>
        </div>
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              size="large"
              icon={analyzingPages ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
              onClick={handleAnalyzePages}
              loading={analyzingPages}
              disabled={analyzingPages || selectedRowKeys.length === 0}
              className="flex items-center justify-center gap-2"
            >
              {analyzingPages ? 'Analyzing...' : `Analyze${selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}`}
            </Button>
            
            <Button
              type="primary"
              size="large"
              icon={findingPages ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              onClick={handleFindPages}
              loading={findingPages}
              disabled={findingPages}
              className="flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#00BFA5',
                borderColor: '#00BFA5',
              }}
            >
              {findingPages ? 'Finding Pages...' : 'Find Pages'}
            </Button>
            
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


      {/* Two Column Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Available Pages */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#000336' }}
                >
                  <FileSearch size={20} className="text-white" />
                </div>
                <span>Available Pages</span>
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

            {/* Status Filter */}
            {availableRoutes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <Text strong>Filter by Status:</Text>
                  <Select
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    style={{ minWidth: 150 }}
                    suffixIcon={<Filter size={16} />}
                  >
                    <Option value="all">All Status</Option>
                    {getUniqueStatuses().map(status => (
                      <Option key={status.value} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
                  <Text className="text-gray-500 text-sm">
                    Showing {filteredRoutes.length} of {availableRoutes.length} pages
                  </Text>
                </div>
              </div>
            )}

            {routesLoading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <Spin size="large" />
                <Text className="mt-4 text-gray-500">Loading available pages...</Text>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-12">
                <Empty
                  image={<FileSearch size={64} className="mx-auto text-gray-300" />}
                  description={
                    <div>
                      <Title level={4} className="text-gray-400 mb-2">
                        {availableRoutes.length === 0 
                          ? (hasInitialRoutes ? 'No Pages Found' : 'No Pages Available')
                          : 'No Pages Match Filter'
                        }
                      </Title>
                      <Text className="text-gray-500">
                        {availableRoutes.length === 0
                          ? (hasInitialRoutes 
                            ? "The search didn't find any pages. Try clicking 'Find Pages' to discover new pages."
                            : "No pages have been discovered yet. Click 'Find Pages' to start discovering pages on your website.")
                          : "Try changing the status filter to see more pages."
                        }
                      </Text>
                    </div>
                  }
                >
                  {availableRoutes.length === 0 ? (
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
                  ) : (
                    <Button 
                      size="large" 
                      onClick={() => setStatusFilter('all')}
                      className="mt-4"
                    >
                      Clear Filter
                    </Button>
                  )}
                </Empty>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Text className="text-gray-600">
                    Found {filteredRoutes.length} pages
                    {selectedRowKeys.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        ({selectedRowKeys.length} selected)
                      </span>
                    )}
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
                  rowSelection={rowSelection}
                  columns={getTableColumns()}
                  dataSource={filteredRoutes}
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
        </Col>

        {/* Right Column - Project Information & Quick Stats */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            {/* Project Information */}
            <Card 
              title="Project Information"
              className="shadow-lg border-0 rounded-2xl"
            >
              <Descriptions column={1} className="mt-4">
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
                  <div className="flex items-center gap-1">
                    <Badge
                      color={statusConfig.color}
                      text={
                        <span className="flex items-center gap-1">
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      }
                    />
                  </div>
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

            {/* Quick Stats */}
            <Card 
              title="Quick Stats"
              className="shadow-lg border-0 rounded-2xl"
            >
              <Space direction="vertical" size="large" className="w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: calculateAverageScore() ? (calculateAverageScore()! >= 80 ? '#00BFA5' : calculateAverageScore()! >= 60 ? '#FFD700' : '#ff4d4f') : '#666' }}>
                    {calculateAverageScore() !== null ? `${calculateAverageScore()}/100` : 'N/A'}
                  </div>
                  <Text className="text-gray-500">Average UX Score</Text>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {availableRoutes.length}
                  </div>
                  <Text className="text-gray-500">Available Pages</Text>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {availableRoutes.filter(route => route.status === 'completed').length}
                  </div>
                  <Text className="text-gray-500">Analyzed</Text>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: statusConfig.color }}>
                    {statusConfig.label}
                  </div>
                  <Text className="text-gray-500">Current Status</Text>
                </div>
              </Space>
            </Card>
          </div>
        </Col>
      </Row>

      <PageAnalysisModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPage(null);
        }}
        page={selectedPage}
      />
    </DashboardLayout>
  );
};