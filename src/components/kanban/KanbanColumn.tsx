import { tokens, Button } from '@fluentui/react-components';
import { Delete24Regular } from '@fluentui/react-icons';
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
  onDeleteColumn?: (columnTitle: string) => void;
  onAddTask?: (categoryTitle: string) => void;
  categoryId?: string;
}

export default function KanbanColumn({ title, tasks, usersById, onTaskClick, onDropTask, onDeleteColumn, onAddTask, categoryId }: KanbanColumnProps) {
  const styles = mainLayoutStyles();
  const canDelete = title !== 'Uncategorized' && categoryId;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
          <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>{tasks.length}</div>
          {canDelete && (
            <Button
              appearance="subtle"
              size="small"
              icon={<Delete24Regular />}
              onClick={() => onDeleteColumn?.(title)}
              title="Delete column"
              style={{ minWidth: 'auto', padding: tokens.spacingHorizontalXS }}
            />
          )}
        </div>
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
        {onAddTask && (
          <Button
            appearance="transparent"
            size="small"
            onClick={() => onAddTask(title)}
            style={{
              width: '100%',
              marginTop: tokens.spacingVerticalXS,
              justifyContent: 'flex-start'
            }}
          >
            + Add Task
          </Button>
        )}
      </div>
    </div>
  );
}
