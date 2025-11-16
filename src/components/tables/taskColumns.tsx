import { createTableColumn } from '@fluentui/react-components';
import type { TableColumnDefinition } from '@fluentui/react-components';
import { Avatar, Badge } from '@fluentui/react-components';
import type { Task } from '../../types/MyTasksTypes';

export const taskColumns: TableColumnDefinition<Task>[] = [
    createTableColumn<Task>({
        columnId: 'title',
        renderHeaderCell: () => 'Task Name',
        renderCell: (item) => item.title,
    }),
    createTableColumn<Task>({
        columnId: 'status',
        renderHeaderCell: () => 'Status',
        renderCell: (item) => (
            <Badge
                appearance="outline"
                size="extra-large"
                color={
                    item.status === 'To Do' ? 'brand' :
                        item.status === 'In Progress' ? 'warning' :
                            item.status === 'Done' ? 'success' :
                                'informative'
                }
            >
                {item.status}
            </Badge>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'priority',
        renderHeaderCell: () => 'Priority',
        renderCell: (item) => (
            <Badge
                appearance="outline"
                size="extra-large"
                color={
                    item.priority === 'Important' ? 'brand' :
                        item.priority === 'Medium' ? 'warning' :
                            item.priority === 'Done' ? 'success' :
                                'informative'
                }
            >
                {item.priority}
            </Badge>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'createdBy',
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
        renderHeaderCell: () => 'Assigned To',
        renderCell: (item) => item.assignedToUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                    name={`${item.assignedToUser.firstName} ${item.assignedToUser.lastName}`}
                    size={32}
                    color='blue'
                    image={{ src: item.assignedToUser.userIMG || undefined }}
                />
                {`${item.assignedToUser.firstName} ${item.assignedToUser.lastName}`}
            </div>
        ) : item.assignedTo,
    }),
    createTableColumn<Task>({
        columnId: 'createdAt',
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
