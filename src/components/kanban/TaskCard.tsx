import { Avatar, Card, CardHeader, CardPreview, Text, Tooltip, Badge, tokens } from '@fluentui/react-components';
import type { TaskResponse } from '../apis/tasks';
import type { User } from '../apis/auth';

export interface TaskCardProps {
  task: TaskResponse;
  assignedUsers?: User[];
  onClick?: (task: TaskResponse) => void;
  draggable?: boolean;
}

export default function TaskCard({ task, assignedUsers = [], onClick, draggable = true }: TaskCardProps) {
  // Map priority to badge appearance
  const getPriorityAppearance = (priority: string): "filled" | "outline" | "tint" => {
    switch (priority?.toLowerCase()) {
      case 'important':
        return 'filled';
      case 'medium':
        return 'tint';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string): "danger" | "warning" | "informative" => {
    switch (priority?.toLowerCase()) {
      case 'important':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'informative';
    }
  };

  return (
    <Card
      size="small"
      draggable={draggable}
      tabIndex={0}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/task-id', task._id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onClick?.(task)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(task); } }}
      role="button"
      aria-label={`Task ${task.title}`}
      style={{ cursor: 'pointer', marginBottom: tokens.spacingVerticalS }}
    >
      <CardHeader
        header={
          <Text weight="semibold" style={{ wordBreak: 'break-word' }}>
            {task.title || 'Untitled Task'}
          </Text>
        }
        description={
          task.priority && (
            <Badge
              appearance={getPriorityAppearance(task.priority)}
              color={getPriorityColor(task.priority)}
              size="small"
              style={{ textTransform: 'capitalize', marginTop: tokens.spacingVerticalXS }}
            >
              {task.priority}
            </Badge>
          )
        }
      />

      {task.description && (
        <CardPreview style={{ padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}` }}>
          <Text
            size={200}
            style={{
              color: tokens.colorNeutralForeground3,
              lineHeight: '1.4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {task.description}
          </Text>
        </CardPreview>
      )}

      {assignedUsers.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacingHorizontalXS,
          padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`
        }}>
          {assignedUsers.slice(0, 3).map(u => (
            <Tooltip key={u.id} content={`${u.firstName} ${u.lastName}`} relationship="label">
              <Avatar
                name={`${u.firstName} ${u.lastName}`}
                size={24}
                color="colorful"
                image={u.userIMG ? { src: u.userIMG } : undefined}
              />
            </Tooltip>
          ))}
          {assignedUsers.length > 3 && (
            <Badge appearance="outline" size="small">+{assignedUsers.length - 3}</Badge>
          )}
        </div>
      )}
    </Card>
  );
}
