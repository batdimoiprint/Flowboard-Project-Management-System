import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Text } from '@fluentui/react-components';
import { Add20Regular } from '@fluentui/react-icons';
import { mainLayoutStyles } from '../styles/Styles';
import KanbanCard, { type Task } from './KanbanCard';

export interface Column {
    id: string;
    title: string;
    tasks: Task[];
}

interface KanbanColumnProps {
    column: Column;
    onAddTask?: (columnId: string) => void;
    onTaskClick?: (task: Task) => void;
}

export default function KanbanColumn({ column, onAddTask, onTaskClick }: KanbanColumnProps) {
    const styles = mainLayoutStyles();
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const taskIds = column.tasks.map(task => task.id);

    return (
        <div
            ref={setNodeRef}
            className={`${styles.kanbanColumn} ${isOver ? styles.kanbanDragOver : ''}`}
        >
            <div className={styles.kanbanColumnHeader}>
                <Text className={styles.kanbanColumnTitle}>
                    {column.title} ({column.tasks.length})
                </Text>
                {onAddTask && (
                    <Button
                        appearance="transparent"
                        icon={<Add20Regular />}
                        size="small"
                        onClick={() => onAddTask(column.id)}
                    />
                )}
            </div>

            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className={styles.kanbanTaskList}>
                    {column.tasks.map(task => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick?.(task)}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
