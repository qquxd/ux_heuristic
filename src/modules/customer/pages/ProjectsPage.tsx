import React, { useState, useEffect } from 'react';
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
  List,
  Avatar,
  Divider
} from 'antd';
import { 
  FolderOpen, 
  Globe, 
  Target, 
  Calendar,
  Grid,
  List as ListIcon,
  ExternalLink,
  Plus
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { ProjectService, Project } from '../../../services/projectService';
import { ErrorDisplay } from '../../../components/error/ErrorDisplay';
import { ErrorResponse } from '../../../types/error.types';
import { AddProjectDrawer } from '../components/AddProjectDrawer';

const { Title, Text, Paragraph } = Typography;

type ViewType = 'grid' | 'list';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjectService.getProjects();
      setProjects(response.results);
    } catch (err: any) {
      setError(err as ErrorResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAdded = () => {
    fetchProjects();
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return '#00BFA5';
      case 'in_progress':
      case 'in progress':
        return '#FFD700';
      case 'pending':
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'website':
        return <Globe size={16} />;
      default:
        return <FolderOpen size={16} />;
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

  const renderGridView = () => (
    <Row gutter={[24, 24]}>
      {projects.map((project) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
          <Card
            className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300"
            actions={[
              <Button
                type="link"
                icon={<ExternalLink size={16} />}
                onClick={() => window.open(project.website_url, '_blank')}
                className="flex items-center justify-center gap-2"
              >
                Visit Site
              </Button>
            ]}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Title level={5} className="mb-1 line-clamp-1">
                    {project.project_name}
                  </Title>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag 
                      color={getStatusColor(project.status)}
                      className="text-xs"
                    >
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </div>
                </div>
                <Avatar
                  size="small"
                  icon={getProjectTypeIcon(project.project_type)}
                  style={{ backgroundColor: '#000336' }}
                />
              </div>

              <Paragraph 
                className="text-gray-600 text-sm mb-3"
                ellipsis={{ rows: 2, tooltip: project.description }}
              >
                {project.description}
              </Paragraph>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target size={12} className="text-gray-400 flex-shrink-0" />
                  <Text className="text-gray-600 text-xs line-clamp-1">
                    {project.project_goal.goal}
                  </Text>
                </div>
                
                <div className="flex items-center gap-2">
                  <Globe size={12} className="text-gray-400 flex-shrink-0" />
                  <Text className="text-gray-600 text-xs capitalize">
                    {project.project_type.replace('_', ' ')}
                  </Text>
                </div>

                {project.created_on && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                    <Text className="text-gray-500 text-xs">
                      {formatDate(project.created_on)}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={projects}
      renderItem={(project) => (
        <List.Item
          actions={[
            <Button
              type="link"
              icon={<ExternalLink size={16} />}
              onClick={() => window.open(project.website_url, '_blank')}
            >
              Visit Site
            </Button>
          ]}
          className="bg-white p-6 mb-4 rounded-2xl shadow-lg border-0"
        >
          <List.Item.Meta
            avatar={
              <Avatar
                size="large"
                icon={getProjectTypeIcon(project.project_type)}
                style={{ backgroundColor: '#000336' }}
              />
            }
            title={
              <div className="flex items-center gap-3">
                <Title level={4} className="mb-0">
                  {project.project_name}
                </Title>
                <Tag color={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </div>
            }
            description={
              <div className="space-y-2">
                <Paragraph className="text-gray-600 mb-2">
                  {project.description}
                </Paragraph>
                <Space size="large">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-gray-400" />
                    <Text className="text-gray-600">
                      {project.project_goal.goal}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-gray-400" />
                    <Text className="text-gray-600 capitalize">
                      {project.project_type.replace('_', ' ')}
                    </Text>
                  </div>
                  {project.created_on && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <Text className="text-gray-500">
                        Created: {formatDate(project.created_on)}
                      </Text>
                    </div>
                  )}
                </Space>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={1} className="mb-2">
              Projects
            </Title>
            <Text className="text-gray-600 text-lg">
              Manage and view all your projects
            </Text>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2"
              style={{ 
                backgroundColor: '#00BFA5',
                borderColor: '#00BFA5',
              }}
            >
              Add Project
            </Button>
            
            <Radio.Group
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="grid">
                <Grid size={16} className="mr-2" />
                Grid
              </Radio.Button>
              <Radio.Button value="list">
                <ListIcon size={16} className="mr-2" />
                List
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Total: {projects.length} projects</span>
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
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-20">
          <Empty
            image={<FolderOpen size={64} className="mx-auto text-gray-300" />}
            description={
              <div>
                <Title level={4} className="text-gray-400 mb-2">
                  No Projects Found
                </Title>
                <Text className="text-gray-500">
                  You haven't created any projects yet. Start by creating your first project.
                </Text>
              </div>
            }
          >
            <Button type="primary" size="large" className="mt-4">
              Create Project
            </Button>
          </Empty>
        </Card>
      ) : (
        <div>
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