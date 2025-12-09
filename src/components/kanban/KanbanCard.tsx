import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarGroup, AvatarGroupItem, Badge, Card, Text, Tooltip, tokens } from '@fluentui/react-components';
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
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);

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

    // Fetch all assigned users data
    useEffect(() => {
        const userIds = task.assignedTo || (task.assignee ? [task.assignee] : []);
        if (userIds.length === 0) {
            setAssignedUsers([]);
            return;
        }

        Promise.all(userIds.map(userId =>
            usersApi.getUserById(userId).catch(err => {
                console.error(`Failed to load user ${userId}:`, err);
                return null;
            })
        ))
            .then(users => setAssignedUsers(users.filter((u): u is User => u !== null)))
            .catch(err => {
                console.error('Failed to load assigned users:', err);
                setAssignedUsers([]);
            });
    }, [task.assignedTo, task.assignee]);

    const priorityStyles: Record<string, { bg: string; color: string; border: string }> = {
        Important: {
            bg: tokens.colorPaletteRedBackground3,
            color: tokens.colorPaletteRedForeground2,
            border: tokens.colorPaletteRedBorderActive,
        },
        Medium: {
            bg: tokens.colorPaletteGoldBackground2,
            color: tokens.colorPaletteGoldForeground2,
            border: tokens.colorPaletteGoldBorderActive,
        },
        Low: {
            bg: tokens.colorPaletteTealBackground2,
            color: tokens.colorPaletteTealForeground2,
            border: tokens.colorPaletteTealBorderActive,
        },
    };

    const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
        'To Do': {
            bg: tokens.colorPaletteSteelBackground2,
            color: tokens.colorPaletteSteelForeground2,
            border: tokens.colorPaletteSteelBorderActive,
        },
        'In Progress': {
            bg: tokens.colorPaletteBlueBackground2,
            color: tokens.colorPaletteBlueForeground2,
            border: tokens.colorPaletteBlueBorderActive,
        },
        'Done': {
            bg: tokens.colorPaletteGreenBackground2,
            color: tokens.colorPaletteGreenForeground2,
            border: tokens.colorPaletteGreenBorderActive,
        },
        'Blocked': {
            bg: tokens.colorPaletteRedBackground3,
            color: tokens.colorPaletteRedForeground2,
            border: tokens.colorPaletteRedBorderActive,
        },
    };

    const getPriorityStyle = (priority?: string) => {
        return priority && priorityStyles[priority] ? priorityStyles[priority] : {
            bg: tokens.colorNeutralBackground3,
            color: tokens.colorNeutralForeground2,
            border: tokens.colorNeutralStroke1,
        };
    };

    const getStatusStyle = (status?: string) => {
        return status && statusStyles[status] ? statusStyles[status] : {
            bg: tokens.colorNeutralBackground3,
            color: tokens.colorNeutralForeground2,
            border: tokens.colorNeutralStroke1,
        };
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
                {task.status && (
                    <Badge
                        appearance="filled"
                        style={{
                            backgroundColor: getStatusStyle(task.status).bg,
                            color: getStatusStyle(task.status).color,
                            borderColor: getStatusStyle(task.status).border,
                        }}
                    >
                        {task.status}
                    </Badge>
                )}
                {task.priority && (
                    <Badge
                        appearance="filled"
                        style={{
                            backgroundColor: getPriorityStyle(task.priority).bg,
                            color: getPriorityStyle(task.priority).color,
                            borderColor: getPriorityStyle(task.priority).border,
                        }}
                    >
                        {task.priority}
                    </Badge>
                )}
                {task.dueDate && (
                    <Text size={200} className={styles.kanbanSmallBadge}>
                        {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                )}
            </div>

            {assignedUsers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <Tooltip
                        content={assignedUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
                        relationship="label"
                    >
                        <div>
                            <AvatarGroup size={24} layout="stack">
                                {assignedUsers.slice(0, 3).map(user => (
                                    <AvatarGroupItem key={user.id} name={`${user.firstName} ${user.lastName}`}>
                                        <Avatar
                                            name={`${user.firstName} ${user.lastName}`}
                                            size={24}
                                            color="colorful"
                                            image={user.userIMG ? { src: user.userIMG } : undefined}
                                        />
                                    </AvatarGroupItem>
                                ))}
                            </AvatarGroup>
                        </div>
                    </Tooltip>
                </div>
            )}
        </Card>
    );
}
