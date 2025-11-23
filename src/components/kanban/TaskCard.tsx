import { Avatar, Tooltip, tokens } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import type { TaskResponse } from '../apis/tasks';
import type { User } from '../apis/auth';

export interface TaskCardProps {
  task: TaskResponse;
  assignedUsers?: User[];
  onClick?: (task: TaskResponse) => void;
  draggable?: boolean;
}

export default function TaskCard({ task, assignedUsers = [], onClick, draggable = true }: TaskCardProps) {
  const styles = mainLayoutStyles();

  return (
    <div
      className={styles.kanbanTaskCard}
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
    >
      <h4 className={styles.kanbanTaskTitle}>{task.title || 'Untitled Task'}</h4>
      {task.description && (
        <p style={{
          margin: 0,
          fontSize: tokens.fontSizeBase200,
          color: tokens.colorNeutralForeground3,
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>{task.description}</p>
      )}
      <div className={styles.kanbanTaskMetaRow}>
        <div style={{ display: 'flex', gap: 4 }}>
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
            <div className={styles.kanbanSmallBadge}>+{assignedUsers.length - 3}</div>
          )}
        </div>
        {task.priority && (
          <div className={styles.kanbanSmallBadge} style={{ textTransform: 'capitalize' }}>{task.priority}</div>
        )}
      </div>
    </div>
  );
}
