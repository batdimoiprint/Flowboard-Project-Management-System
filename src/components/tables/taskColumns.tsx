import { createTableColumn, tokens } from '@fluentui/react-components';
import type { TableColumnDefinition } from '@fluentui/react-components';
import { Avatar, Badge } from '@fluentui/react-components';
import type { Task } from '../../types/MyTasksTypes';

const statusPillStyles: Record<string, { bg: string; color: string; border: string }> = {
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
    Done: {
        bg: tokens.colorPaletteGreenBackground2,
        color: tokens.colorPaletteGreenForeground2,
        border: tokens.colorPaletteGreenBorderActive,
    },
    Blocked: {
        bg: tokens.colorPaletteRedBackground3,
        color: tokens.colorPaletteRedForeground2,
        border: tokens.colorPaletteRedBorderActive,
    },
};

const priorityPillStyles: Record<string, { bg: string; color: string; border: string }> = {
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

const getPillColors = (value: string, map: Record<string, { bg: string; color: string; border: string }>) => {
    const fallback = {
        bg: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground2,
        border: tokens.colorNeutralStroke2,
    };
    return map[value] ?? fallback;
};

export const taskColumns: TableColumnDefinition<Task>[] = [
    createTableColumn<Task>({
        columnId: 'title',
        compare: (a, b) => (a.title || '').localeCompare(b.title || ''),
        renderHeaderCell: () => 'Task Name',
        renderCell: (item) => item.title,
    }),
    createTableColumn<Task>({
        columnId: 'projectName',
        compare: (a, b) => (a.projectName || '').localeCompare(b.projectName || ''),
        renderHeaderCell: () => 'Project',
        renderCell: (item) => item.projectName || item.projectId || '—',
    }),
    createTableColumn<Task>({
        columnId: 'status',
        compare: (a, b) => (a.status || '').localeCompare(b.status || ''),
        renderHeaderCell: () => 'Status',
        renderCell: (item) => (
            <Badge
                appearance="tint"
                size="large"
                style={(() => {
                    const colors = getPillColors(item.status, statusPillStyles);
                    return {
                        backgroundColor: colors.bg,
                        color: colors.color,
                        borderColor: colors.border,
                        paddingInline: tokens.spacingHorizontalS,
                    };
                })()}
            >
                {item.status}
            </Badge>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'priority',
        compare: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
        renderHeaderCell: () => 'Priority',
        renderCell: (item) => (
            <Badge
                appearance="tint"
                size="large"
                style={(() => {
                    const colors = getPillColors(item.priority, priorityPillStyles);
                    return {
                        backgroundColor: colors.bg,
                        color: colors.color,
                        borderColor: colors.border,
                        paddingInline: tokens.spacingHorizontalS,
                    };
                })()}
            >
                {item.priority}
            </Badge>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'createdBy',
        compare: (a, b) => {
            const aName = a.createdByUser ? `${a.createdByUser.firstName} ${a.createdByUser.lastName}` : (a.createdBy || '');
            const bName = b.createdByUser ? `${b.createdByUser.firstName} ${b.createdByUser.lastName}` : (b.createdBy || '');
            return aName.localeCompare(bName);
        },
        renderHeaderCell: () => 'Created By',
        renderCell: (item) => item.createdByUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                    name={`${item.createdByUser.firstName} ${item.createdByUser.lastName}`}
                    size={32}
                    color='blue'
                    image={{ src: item.createdByUser.userIMG || undefined }}
                />
                {`${item.createdByUser.firstName} ${item.createdByUser.lastName}`}
            </div>
        ) : item.createdBy,
    }),
    createTableColumn<Task>({
        columnId: 'assignedTo',
        compare: (a, b) => {
            const aName = a.assignedToUsers && a.assignedToUsers[0]
                ? `${a.assignedToUsers[0].firstName} ${a.assignedToUsers[0].lastName}`
                : (a.assignedTo?.[0] || '');
            const bName = b.assignedToUsers && b.assignedToUsers[0]
                ? `${b.assignedToUsers[0].firstName} ${b.assignedToUsers[0].lastName}`
                : (b.assignedTo?.[0] || '');
            return aName.localeCompare(bName);
        },
        renderHeaderCell: () => 'Assigned To',
        renderCell: (item) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {item.assignedToUsers && item.assignedToUsers.length > 0 ? (
                    item.assignedToUsers.map((user) => (
                        <Avatar
                            key={user.id}
                            name={`${user.firstName} ${user.lastName}`}
                            size={32}
                            color='colorful'
                            image={{ src: user.userIMG || undefined }}
                            title={`${user.firstName} ${user.lastName}`}
                        />
                    ))
                ) : (
                    <span>{item.assignedTo?.join(', ') || 'Unassigned'}</span>
                )}
            </div>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'createdAt',
        compare: (a, b) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aDate - bDate;
        },
        renderHeaderCell: () => 'Created At',
        renderCell: (item) => {
            if (!item.createdAt) return '';
            const date = new Date(item.createdAt);
            if (isNaN(date.getTime())) return item.createdAt;
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    }),
    createTableColumn<Task>({
        columnId: 'endDate',
        compare: (a, b) => {
            const aDate = a.endDate ? new Date(a.endDate).getTime() : 0;
            const bDate = b.endDate ? new Date(b.endDate).getTime() : 0;
            return aDate - bDate;
        },
        renderHeaderCell: () => 'Due Date',
        renderCell: (item) => {
            if (!item.endDate) return '';
            const date = new Date(item.endDate);
            if (isNaN(date.getTime())) return item.endDate;
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    }),
];
