import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Text, mergeClasses, Input } from '@fluentui/react-components';
import {
    //  Add20Regular, 
    Delete20Regular
} from '@fluentui/react-icons';
import { mainLayoutStyles } from '../styles/Styles';
import KanbanCard, { type Task } from './KanbanCard';
import { useState, useRef, useEffect } from 'react';

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
    onUpdateColumn?: (columnId: string, newTitle: string) => Promise<void>;
}

export default function KanbanColumn({ column, onTaskClick, onDeleteColumn, onUpdateColumn }: KanbanColumnProps) {
    const styles = mainLayoutStyles();
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(column.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const taskIds = column.tasks.map(task => task.id);

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        setEditedTitle(column.title);
    }, [column.title]);

    const handleTitleDoubleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleSave = async () => {
        if (editedTitle.trim() && editedTitle !== column.title && onUpdateColumn) {
            await onUpdateColumn(column.id, editedTitle.trim());
        } else {
            setEditedTitle(column.title);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setEditedTitle(column.title);
            setIsEditingTitle(false);
        }
    };

    const handleTitleBlur = () => {
        handleTitleSave();
    };

    return (
        <div
            ref={setNodeRef}
            className={mergeClasses(styles.kanbanColumn, styles.hFull, isOver && styles.kanbanDragOver)}
        >
            <div className={styles.kanbanColumnHeader}>
                {isEditingTitle ? (
                    <Input
                        ref={inputRef}
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleTitleBlur}
                        size="small"
                        style={{ flex: 1, fontWeight: 600 }}
                    />
                ) : (
                    <Text
                        className={styles.kanbanColumnTitle}
                        onDoubleClick={handleTitleDoubleClick}
                        style={{ cursor: 'text' }}
                        title="Double-click to edit"
                    >
                        {column.title} ({column.tasks.length})
                    </Text>
                )}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {/* {onAddTask && (
                        <Button
                            appearance="transparent"
                            icon={<Add20Regular />}
                            size="small"
                            onClick={() => onAddTask(column.id)}
                        />
                    )} */}
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
