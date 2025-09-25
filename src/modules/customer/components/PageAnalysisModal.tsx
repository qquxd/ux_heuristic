import React from 'react';
import { 
  Modal, 
  Typography, 
  Card, 
  Space, 
  Tag, 
  Divider, 
  Image, 
  Alert,
  Row,
  Col,
  Badge,
  Button,
  Tooltip
} from 'antd';
import { 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Target,
  Lightbulb
} from 'lucide-react';
import { PageRoute, UXIssue } from '../../../types/project.types';

const { Title, Text, Paragraph } = Typography;

interface PageAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  page: PageRoute | null;
}

export const PageAnalysisModal: React.FC<PageAnalysisModalProps> = ({
  open,
  onClose,
  page,
}) => {
  if (!page) return null;

  const getSeverityConfig = (severity: number) => {
    switch (severity) {
      case 1:
        return { color: '#52c41a', icon: <Info size={16} />, label: 'Low', bgColor: '#f6ffed' };
      case 2:
        return { color: '#faad14', icon: <AlertTriangle size={16} />, label: 'Medium', bgColor: '#fffbe6' };
      case 3:
        return { color: '#ff4d4f', icon: <AlertTriangle size={16} />, label: 'High', bgColor: '#fff2f0' };
      default:
        return { color: '#666', icon: <Info size={16} />, label: 'Unknown', bgColor: '#f5f5f5' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const renderIssueCard = (issue: UXIssue, index: number) => {
    const severityConfig = getSeverityConfig(issue.severity);
    
    return (
      <Card 
        key={index}
        className="mb-4 border-l-4"
        style={{ borderLeftColor: severityConfig.color }}
        size="small"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  color={severityConfig.color}
                  text={
                    <span className="flex items-center gap-1 font-medium">
                      {severityConfig.icon}
                      {severityConfig.label} Severity
                    </span>
                  }
                />
                <Tag color="blue">{issue.heuristic}</Tag>
              </div>
              <Title level={5} className="mb-2">
                {issue.label}
              </Title>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Text strong className="flex items-center gap-1 mb-1">
                <Target size={14} />
                Observation
              </Text>
              <Paragraph className="text-gray-600 mb-0 pl-5">
                {issue.observation}
              </Paragraph>
            </div>

            <div>
              <Text strong className="flex items-center gap-1 mb-1">
                <Lightbulb size={14} />
                Recommended Solution
              </Text>
              <Paragraph className="text-gray-600 mb-0 pl-5">
                {issue.solution}
              </Paragraph>
            </div>

            <div className="text-xs text-gray-500 pl-5">
              Location: x:{issue.bounding_box.x}, y:{issue.bounding_box.y}, 
              size:{issue.bounding_box.width}×{issue.bounding_box.height}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const hasAnalysis = page.report_json && page.status === 'completed';
  const uxScore = hasAnalysis ? page.report_json.ux_score : null;
  const issues = hasAnalysis ? page.report_json.issues || [] : [];

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="mb-1">
              {page.page_name}
            </Title>
            <Text className="text-gray-500 text-sm">
              UX Analysis Report
            </Text>
          </div>
          <Button
            type="link"
            icon={<ExternalLink size={16} />}
            onClick={() => window.open(page.page_url, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-1"
          >
            Visit Page
          </Button>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className="top-4"
      styles={{
        body: { maxHeight: '80vh', overflowY: 'auto' }
      }}
    >
      <div className="space-y-6">
        {/* Status and Score Overview */}
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" className="text-center">
              <div className="space-y-2">
                <Text className="text-gray-500 text-sm">Status</Text>
                <div>
                  <Badge
                    status={page.status === 'completed' ? 'success' : page.status === 'pending' ? 'processing' : 'default'}
                    text={
                      <span className="capitalize font-medium">
                        {page.status}
                      </span>
                    }
                  />
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" className="text-center">
              <div className="space-y-2">
                <Text className="text-gray-500 text-sm">UX Score</Text>
                <div>
                  {uxScore !== null ? (
                    <Text 
                      strong 
                      className="text-2xl"
                      style={{ color: getScoreColor(uxScore) }}
                    >
                      {uxScore}/100
                    </Text>
                  ) : (
                    <Text className="text-gray-400">-</Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Analysis Status */}
        {!hasAnalysis && (
          <Alert
            message={
              page.status === 'pending' 
                ? 'Analysis Pending' 
                : page.status === 'in_progress'
                ? 'Analysis In Progress'
                : 'Analysis Not Available'
            }
            description={
              page.status === 'pending'
                ? 'This page is queued for analysis. Results will appear here once the analysis is complete.'
                : page.status === 'in_progress'
                ? 'Analysis is currently running. This page will update automatically when complete.'
                : 'No analysis data is available for this page.'
            }
            type={page.status === 'pending' || page.status === 'in_progress' ? 'info' : 'warning'}
            showIcon
          />
        )}

        {/* Screenshot */}
        {page.annotated_snapshot_path && (
          <Card title="Annotated Screenshot" size="small">
            <div className="text-center">
              <Image
                src={page.annotated_snapshot_path}
                alt={`Screenshot of ${page.page_name}`}
                className="max-w-full rounded-lg shadow-md"
                placeholder={
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <Text className="text-gray-400">Loading screenshot...</Text>
                  </div>
                }
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </div>
          </Card>
        )}

        {/* Issues Analysis */}
        {hasAnalysis && issues.length > 0 && (
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>UX Issues Found ({issues.length})</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(severity => {
                    const count = issues.filter(issue => issue.severity === severity).length;
                    const config = getSeverityConfig(severity);
                    return count > 0 ? (
                      <Tooltip key={severity} title={`${count} ${config.label} severity issues`}>
                        <Badge
                          count={count}
                          style={{ backgroundColor: config.color }}
                          size="small"
                        />
                      </Tooltip>
                    ) : null;
                  })}
                </div>
              </div>
            }
            size="small"
          >
            <div className="space-y-4">
              {issues
                .sort((a, b) => b.severity - a.severity)
                .map((issue, index) => renderIssueCard(issue, index))}
            </div>
          </Card>
        )}

        {/* No Issues */}
        {hasAnalysis && issues.length === 0 && (
          <Card size="small">
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <Title level={4} className="text-green-600 mb-2">
                Great UX!
              </Title>
              <Text className="text-gray-600">
                No significant UX issues were found on this page.
              </Text>
            </div>
          </Card>
        )}

        {/* Page URL */}
        <Card size="small">
          <div className="flex items-center justify-between">
            <div>
              <Text strong>Page URL:</Text>
              <br />
              <Text className="text-blue-600 break-all">
                {page.page_url}
              </Text>
            </div>
            <Button
              type="link"
              icon={<ExternalLink size={16} />}
              onClick={() => window.open(page.page_url, '_blank', 'noopener,noreferrer')}
            >
              Open
            </Button>
          </div>
        </Card>
      </div>
    </Modal>
  );
};