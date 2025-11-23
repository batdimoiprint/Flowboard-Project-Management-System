import { tokens } from '@fluentui/react-components';
import TaskCard from './TaskCard';
import { mainLayoutStyles } from '../styles/Styles';
import type { TaskResponse } from '../apis/tasks';
import type { User } from '../apis/auth';

export interface KanbanColumnProps {
  title: string;
  tasks: TaskResponse[];
  usersById: Record<string, User>;
  onTaskClick?: (task: TaskResponse) => void;
  onDropTask?: (taskId: string, newStatus: string) => void;
}

export default function KanbanColumn({ title, tasks, usersById, onTaskClick, onDropTask }: KanbanColumnProps) {
  const styles = mainLayoutStyles();
  return (
    <div
      className={styles.kanbanColumn}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData('text/task-id');
        if (taskId) {
          onDropTask?.(taskId, title);
        }
      }}
    >
      <div className={styles.kanbanColumnHeader}>
        <h3 className={styles.kanbanColumnTitle}>{title}</h3>
        <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>{tasks.length}</div>
      </div>
      <div className={styles.kanbanTaskList}>
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            assignedUsers={task.assignedTo.map(id => usersById[id]).filter(Boolean)}
            onClick={onTaskClick}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: tokens.spacingVerticalM,
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            border: `1px dashed ${tokens.colorNeutralStroke3}`,
            borderRadius: tokens.borderRadiusMedium
          }}>No tasks</div>
        )}
      </div>
    </div>
  );
}
