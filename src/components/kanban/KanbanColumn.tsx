import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Text, mergeClasses } from '@fluentui/react-components';
import { Add20Regular, Delete20Regular } from '@fluentui/react-icons';
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
    onDeleteColumn?: (columnId: string) => void;
}

export default function KanbanColumn({ column, onAddTask, onTaskClick, onDeleteColumn }: KanbanColumnProps) {
    const styles = mainLayoutStyles();
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const taskIds = column.tasks.map(task => task.id);

    return (
        <div
            ref={setNodeRef}
            className={mergeClasses(styles.kanbanColumn, styles.hFull, isOver && styles.kanbanDragOver)}
        >
            <div className={styles.kanbanColumnHeader}>
                <Text className={styles.kanbanColumnTitle}>
                    {column.title} ({column.tasks.length})
                </Text>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {onAddTask && (
                        <Button
                            appearance="transparent"
                            icon={<Add20Regular />}
                            size="small"
                            onClick={() => onAddTask(column.id)}
                        />
                    )}
                    {onDeleteColumn && (
                        <Button
                            appearance="transparent"
                            icon={<Delete20Regular />}
                            size="small"
                            onClick={() => onDeleteColumn(column.id)}
                        />
                    )}
                </div>
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
