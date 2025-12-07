import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Badge, Card, Text } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { useState, useEffect } from 'react';
import { usersApi, type User } from '../apis/users';

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority?: 'Low' | 'Medium' | 'High';
    status?: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
    assignee?: string;
    assignedTo?: string[];
}

interface KanbanCardProps {
    task: Task;
    onClick?: () => void;
}

export default function KanbanCard({ task, onClick }: KanbanCardProps) {
    const styles = mainLayoutStyles();
    const [assigneeUser, setAssigneeUser] = useState<User | null>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Fetch assignee user data when task.assignee changes
    useEffect(() => {
        if (!task.assignee) {
            setAssigneeUser(null);
            return;
        }

        usersApi.getUserById(task.assignee)
            .then(user => setAssigneeUser(user))
            .catch(err => {
                console.error(`Failed to load user ${task.assignee}:`, err);
                setAssigneeUser(null);
            });
    }, [task.assignee]);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'informative';
        }
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={styles.kanbanTaskCard}
            onClick={onClick}
        >
            <Text className={styles.kanbanTaskTitle}>{task.title}</Text>

            {task.description && (
                <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>
                    {task.description}
                </Text>
            )}

            <div className={styles.kanbanTaskMetaRow}>
                {task.priority && (
                    <Badge appearance="filled" color={getPriorityColor(task.priority)}>
                        {task.priority}
                    </Badge>
                )}
                {task.dueDate && (
                    <Text size={200} className={styles.kanbanSmallBadge}>
                        {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                )}
            </div>

            {task.assignee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <Avatar
                        name={assigneeUser ? `${assigneeUser.firstName} ${assigneeUser.lastName}` : 'User'}
                        size={24}
                        color="colorful"
                        image={assigneeUser?.userIMG ? { src: assigneeUser.userIMG } : undefined}
                    />
                </div>
            )}
        </Card>
    );
}
