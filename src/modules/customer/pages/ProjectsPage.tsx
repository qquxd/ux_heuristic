import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Tag, 
  Space, 
  Spin, 
  Empty,
  Radio,
  Table,
  Avatar,
  Divider,
  Input,
  Select,
  Tooltip,
  Badge,
  message,
  TableColumnsType
} from 'antd';
import { 
  FolderOpen, 
  Globe, 
  Target, 
  Calendar,
  Grid,
  Table as TableIcon,
  ExternalLink,
  Plus,
  Search,
  Filter,
  SortAsc,
  AlertCircle,
  CheckCircle2,
  Clock,
  Pause,
  X as XIcon
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { ProjectService, Project } from '../../../services/projectService';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { ErrorResponse } from '../../../types/error.types';
import { AddProjectDrawer } from '../components/AddProjectDrawer';

const { Title, Text, Paragraph } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

type ViewType = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'status';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, statusFilter, sortBy]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjectService.getProjects();
      setProjects(response.results || []);
      
    } catch (err: any) {
      setError(err as ErrorResponse);
      message.error('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_goal.goal.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.project_name.localeCompare(b.project_name);
        case 'date':
          if (!a.created_on || !b.created_on) return 0;
          return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectAdded = () => {
    fetchProjects();
    message.success('Project created successfully!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
  };

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return { 
          color: '#00BFA5', 
          icon: <CheckCircle2 size={12} />, 
          label: 'Completed',
          ariaLabel: 'Project status: Completed'
        };
      case 'in_progress':
      case 'in progress':
        return { 
          color: '#FFD700', 
          icon: <Clock size={12} />, 
          label: 'In Progress',
          ariaLabel: 'Project status: In Progress'
        };
      case 'planning':
        return { 
          color: '#1890ff', 
          icon: <Target size={12} />, 
          label: 'Planning',
          ariaLabel: 'Project status: Planning'
        };
      case 'on_hold':
      case 'on hold':
        return { 
          color: '#faad14', 
          icon: <Pause size={12} />, 
          label: 'On Hold',
          ariaLabel: 'Project status: On Hold'
        };
      case 'cancelled':
        return { 
          color: '#ff4d4f', 
          icon: <XIcon size={12} />, 
          label: 'Cancelled',
          ariaLabel: 'Project status: Cancelled'
        };
      default:
        return { 
          color: '#666', 
          icon: <AlertCircle size={12} />, 
          label: status.replace('_', ' '),
          ariaLabel: `Project status: ${status.replace('_', ' ')}`
        };
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'website':
        return <Globe size={16} aria-label="Website project" />;
      case 'mobile_app':
        return <FolderOpen size={16} aria-label="Mobile app project" />;
      case 'web_app':
        return <FolderOpen size={16} aria-label="Web application project" />;
      case 'api':
        return <FolderOpen size={16} aria-label="API project" />;
      default:
        return <FolderOpen size={16} aria-label="Project" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set((projects || []).map(p => p.status.toLowerCase()))];
    return statuses.map(status => ({
      value: status,
      label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  const renderGridView = () => (
    <Row gutter={[24, 24]} role="grid" aria-label="Projects grid view">
      {filteredProjects.map((project, index) => {
        const statusConfig = getStatusConfig(project.status);
        return (
          <Col xs={24} sm={12} lg={8} xl={6} key={project.id} role="gridcell">
            <Card
              className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500"
              actions={[
                <Tooltip title={`Visit ${project.project_name} website`} key="visit">
                  <Button
                    type="link"
                    icon={<ExternalLink size={16} />}
                    onClick={() => window.open(project.website_url, '_blank', 'noopener,noreferrer')}
                    className="flex items-center justify-center gap-2 text-base font-medium"
                    aria-label={`Visit ${project.project_name} website (opens in new tab)`}
                  >
                    Visit Site
                  </Button>
                </Tooltip>,
                <Tooltip title="View project details" key="details">
                  <Button
                    type="link"
                    onClick={() => navigate(`/customer/projects/${project.id}`)}
                    className="flex items-center justify-center gap-2 text-base font-medium"
                    aria-label={`View ${project.project_name} details`}
                  >
                    View Details
                  </Button>
                </Tooltip>
              ]}
              tabIndex={0}
              role="article"
              aria-labelledby={`project-title-${project.id}`}
              aria-describedby={`project-desc-${project.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Title
                      level={4} 
                      className="mb-2 truncate cursor-pointer hover:text-blue-600 transition-colors text-lg font-semibold" 
                      id={`project-title-${project.id}`}
                      title={project.project_name}
                      onClick={() => navigate(`/customer/projects/${project.id}`)}
                    >
                      {project.project_name}
                    </Title>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        color={statusConfig.color}
                        text={
                          <span className="flex items-center gap-1 text-xs font-medium">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        }
                        aria-label={statusConfig.ariaLabel}
                      />
                    </div>
                  </div>
                  <Tooltip title={`${project.project_type.replace('_', ' ')} project`}>
                    <Avatar
                      size="small"
                      icon={getProjectTypeIcon(project.project_type)}
                      style={{ backgroundColor: '#00BFA5' }}
                      aria-label={`${project.project_type.replace('_', ' ')} project type`}
                    />
                  </Tooltip>
                </div>

                <Paragraph 
                  className="text-gray-600 text-base mb-4 leading-relaxed"
                  ellipsis={{ rows: 2, tooltip: project.description }}
                  id={`project-desc-${project.id}`}
                >
                  {project.description}
                </Paragraph>

                <div className="space-y-2" role="list" aria-label="Project details">
                  <div className="flex items-center gap-2" role="listitem">
                    <Target size={12} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <Text className="text-gray-600 text-sm truncate" title={project.project_goal.goal}>
                      <span className="sr-only">Goal: </span>
                      {project.project_goal.goal}
                    </Text>
                  </div>
                  
                  <div className="flex items-center gap-2" role="listitem">
                    <Globe size={12} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <Text className="text-gray-600 text-sm capitalize">
                      <span className="sr-only">Type: </span>
                      {project.project_type.replace('_', ' ')}
                    </Text>
                  </div>

                  {project.created_on && (
                    <div className="flex items-center gap-2" role="listitem">
                      <Calendar size={12} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <Text className="text-gray-500 text-sm">
                        <span className="sr-only">Created on: </span>
                        {formatDate(project.created_on)}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const renderListView = () => (
    <Table<Project>
      columns={getTableColumns()}
      dataSource={filteredProjects}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
      }}
      scroll={{ x: 800 }}
      className="bg-white rounded-2xl shadow-lg"
      role="list"
      aria-label="Projects table view"
      size="middle"
    />
  );

  const getTableColumns = (): TableColumnsType<Project> => [
    {
      title: 'Project',
      dataIndex: 'project_name',
      key: 'project_name',
      width: 200,
      fixed: 'left',
      render: (name: string, record: Project) => (
        <div className="flex items-center gap-3">
          <Tooltip title={`${record.project_type.replace('_', ' ')} project`}>
            <Avatar
              size="default"
              icon={getProjectTypeIcon(record.project_type)}
              style={{ backgroundColor: '#00BFA5' }}
              aria-label={`${record.project_type.replace('_', ' ')} project type`}
            />
          </Tooltip>
          <div className="min-w-0 flex-1">
            <Text 
              strong 
              className="block truncate cursor-pointer hover:text-blue-600 transition-colors" 
              style={{ fontSize: '16px' }}
              title={name}
              onClick={() => navigate(`/customer/projects/${record.id}`)}
            >
              {name}
            </Text>
            <Text className="text-gray-500 text-sm capitalize">
              {record.project_type.replace('_', ' ')}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.project_name.localeCompare(b.project_name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) => (
        <Tooltip title={description}>
          <Text className="text-gray-600 block text-sm" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4em',
            maxHeight: '2.8em'
          }}>
            {description}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const statusConfig = getStatusConfig(status);
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusConfig.color }}
            />
            <span className="flex items-center gap-1 font-medium">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
        );
      },
      filters: getUniqueStatuses().map(status => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status.toLowerCase() === value,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Goal',
      dataIndex: ['project_goal', 'goal'],
      key: 'goal',
      width: 200,
      render: (goal: string) => (
        <div className="flex items-center gap-2">
          <Target size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
          <Tooltip title={goal}>
            <Text className="text-gray-600 truncate text-sm">
              {goal}
            </Text>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_on',
      key: 'created_on',
      width: 120,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" aria-hidden="true" />
          <Text className="text-gray-500 text-sm font-medium">
            {formatDate(date)}
          </Text>
        </div>
      ),
      sorter: (a, b) => {
        if (!a.created_on || !b.created_on) return 0;
        return new Date(a.created_on).getTime() - new Date(b.created_on).getTime();
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record: Project) => (
        <div className="flex items-center gap-2">
          <Tooltip title="View project details">
            <Button
              type="link"
              onClick={() => navigate(`/customer/projects/${record.id}`)}
              aria-label={`View ${record.project_name} details`}
              className="flex items-center justify-center p-0"
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title={`Visit ${record.project_name} website`}>
            <Button
              type="link"
              icon={<ExternalLink size={16} />}
              onClick={() => window.open(record.website_url, '_blank', 'noopener,noreferrer')}
              aria-label={`Visit ${record.project_name} website (opens in new tab)`}
              className="flex items-center justify-center p-0"
            >
              Visit
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || sortBy !== 'date';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
          <div>
            <Title level={1} className="mb-3 text-3xl lg:text-4xl font-bold">
              Projects
            </Title>
            <Text className="text-gray-600 text-xl leading-relaxed">
              Manage and view all your projects
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              className="text-base font-medium"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#00BFA5',
                borderColor: '#00BFA5',
              }}
              aria-label="Add new project"
            >
              Add Project
            </Button>
            
            <Radio.Group
              value={viewType}
              onChange={(e) => {
                setViewType(e.target.value);
              }}
              buttonStyle="solid"
              aria-label="View type selection"
            >
              <Radio.Button value="grid" aria-label="Grid view">
                <Grid size={16} className="mr-2" aria-hidden="true" />
                Grid
              </Radio.Button>
              <Radio.Button value="list" aria-label="List view">
                <TableIcon size={16} className="mr-2" aria-hidden="true" />
                Table
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <AntSearch
                placeholder="Search projects by name, description, or goal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                prefix={<Search size={16} className="text-gray-400" />}
                allowClear
                aria-label="Search projects"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                }}
                size="large"
                style={{ minWidth: 140 }}
                aria-label="Filter by status"
                suffixIcon={<Filter size={16} />}
              >
                <Option value="all">All Status</Option>
                {getUniqueStatuses().map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>

              <Select
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                }}
                size="large"
                style={{ minWidth: 140 }}
                aria-label="Sort projects"
                suffixIcon={<SortAsc size={16} />}
              >
                <Option value="date">Date Created</Option>
                <Option value="name">Name</Option>
                <Option value="status">Status</Option>
              </Select>

              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  size="large"
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        {projects && projects.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span role="status" aria-live="polite">
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
              {hasActiveFilters && (
                <Badge count="Filtered" style={{ backgroundColor: '#1890ff' }} />
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={fetchProjects}
          className="mb-6"
        />
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20" role="status" aria-live="polite">
          <Spin size="large" />
          <Text className="mt-4 text-gray-500">Loading projects...</Text>
        </div>
      ) : !projects || filteredProjects.length === 0 ? (
        <Card className="text-center py-20">
          <Empty
            image={<FolderOpen size={64} className="mx-auto text-gray-300" />}
            description={
              <div>
                <Title level={4} className="text-gray-400 mb-2">
                  {!projects || projects.length === 0 ? 'No Projects Found' : 'No Matching Projects'}
                </Title>
                <Text className="text-gray-500 text-base">
                  {!projects || projects.length === 0 
                    ? "You haven't created any projects yet. Start by creating your first project."
                    : "Try adjusting your search or filter criteria to find projects."
                  }
                </Text>
              </div>
            }
          >
            {!projects || projects.length === 0 ? (
              <Button 
                type="primary" 
                size="large" 
                className="mt-4"
                onClick={() => setDrawerOpen(true)}
                style={{ 
                  backgroundColor: '#00BFA5',
                  borderColor: '#00BFA5',
                }}
              >
                Create Project
              </Button>
            ) : (
              <Button 
                size="large" 
                className="mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <div role="main" aria-label="Projects content">
          {viewType === 'grid' ? renderGridView() : renderListView()}
        </div>
      )}

      <AddProjectDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onProjectAdded={handleProjectAdded}
      />
    </DashboardLayout>
  );
};