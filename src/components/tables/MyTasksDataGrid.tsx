

import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, createTableColumn } from '@fluentui/react-table';
import type { TableColumnDefinition } from '@fluentui/react-table';
import { tokens } from '@fluentui/react-components';
import { Button, Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions, Field, Input, Textarea } from '@fluentui/react-components';
import * as React from 'react';



type Task = {
    _id: string;
    categoryId: string;
    assignedTo: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    createdAt: string;
    comments: { user: string; text: string }[];
};

const initialTasks: Task[] = [
    {
        _id: '654321',
        categoryId: 'cat123',
        assignedTo: 'user456',
        title: 'Design Landing Page',
        description: 'Create the main landing page for the new product.',
        priority: 'Important',
        status: 'In Progress',
        startDate: '2025-11-01',
        endDate: '2025-11-10',
        createdBy: 'pm789',
        createdAt: '2025-10-30',
        comments: [
            { user: 'user456', text: 'Started working on wireframes.' },
            { user: 'pm789', text: 'Please use the new color palette.' },
        ],
    },
    {
        _id: '654322',
        categoryId: 'cat124',
        assignedTo: 'user457',
        title: 'Set Up Database',
        description: 'Initialize MongoDB cluster and collections.',
        priority: 'Medium',
        status: 'To Do',
        startDate: '2025-11-05',
        endDate: '2025-11-12',
        createdBy: 'pm789',
        createdAt: '2025-10-31',
        comments: [],
    },
];



const columns: TableColumnDefinition<Task>[] = [
    createTableColumn<Task>({
        columnId: 'title',
        renderHeaderCell: () => 'Task Name',
        renderCell: (item) => item.title,
    }),
    createTableColumn<Task>({
        columnId: 'description',
        renderHeaderCell: () => 'Details',
        renderCell: (item) => item.description,
    }),
    createTableColumn<Task>({
        columnId: 'priority',
        renderHeaderCell: () => 'Priority',
        renderCell: (item) => item.priority,
    }),
    createTableColumn<Task>({
        columnId: 'status',
        renderHeaderCell: () => 'Status',
        renderCell: (item) => item.status,
    }),
    createTableColumn<Task>({
        columnId: 'startDate',
        renderHeaderCell: () => 'Start',
        renderCell: (item) => item.startDate,
    }),
    createTableColumn<Task>({
        columnId: 'endDate',
        renderHeaderCell: () => 'Deadline',
        renderCell: (item) => item.endDate,
    }),
    createTableColumn<Task>({
        columnId: 'assignedTo',
        renderHeaderCell: () => 'Assigned To',
        renderCell: (item) => item.assignedTo,
    }),
    createTableColumn<Task>({
        columnId: 'createdBy',
        renderHeaderCell: () => 'Created By',
        renderCell: (item) => item.createdBy,
    }),
    createTableColumn<Task>({
        columnId: 'createdAt',
        renderHeaderCell: () => 'Created At',
        renderCell: (item) => item.createdAt,
    }),
    createTableColumn<Task>({
        columnId: 'comments',
        renderHeaderCell: () => 'Comments',
        renderCell: (item) => item.comments.length,
    }),
];

function MyTasksDataGrid() {
    const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
    const [open, setOpen] = React.useState(false);
    // Form state
    const [form, setForm] = React.useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: '',
        createdBy: '',
        categoryId: '',
    });

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        setForm((prev) => ({ ...prev, [name]: value }));
    }


    // removed Fluent Dropdown handler in favor of native select to avoid typing issues

    function handleAddTask(e: React.FormEvent) {
        e.preventDefault();
        const newTask: Task = {
            _id: Math.random().toString(36).slice(2),
            categoryId: form.categoryId,
            assignedTo: form.assignedTo,
            title: form.title,
            description: form.description,
            priority: form.priority,
            status: form.status,
            startDate: form.startDate,
            endDate: form.endDate,
            createdBy: form.createdBy,
            createdAt: new Date().toISOString().slice(0, 10),
            comments: [],
        };
        setTasks((prev) => [newTask, ...prev]);
        setOpen(false);
        setForm({
            title: '',
            description: '',
            priority: 'Medium',
            status: 'To Do',
            startDate: '',
            endDate: '',
            assignedTo: '',
            createdBy: '',
            categoryId: '',
        });
    }

    return (
        <div style={{ padding: tokens.spacingHorizontalL }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacingVerticalM }}>
                <h2 style={{ margin: 0 }}>My Tasks</h2>
                <Button appearance="primary" onClick={() => setOpen(true)}>
                    Add Task
                </Button>
            </div>
            <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
                <DialogSurface>
                    <form onSubmit={handleAddTask}>
                        <DialogTitle>Add New Task</DialogTitle>
                        <DialogBody>
                            <Field label="Task Name" required>
                                <Input name="title" value={form.title} onChange={handleInputChange} required />
                            </Field>
                            <Field label="Details">
                                <Textarea name="description" value={form.description} onChange={handleInputChange} />
                            </Field>
                            <Field label="Priority">
                                <select name="priority" value={form.priority} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4 }}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Important">Important</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select name="status" value={form.status} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4 }}>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </Field>
                            <Field label="Start Date">
                                <Input name="startDate" type="date" value={form.startDate} onChange={handleInputChange} />
                            </Field>
                            <Field label="Deadline">
                                <Input name="endDate" type="date" value={form.endDate} onChange={handleInputChange} />
                            </Field>
                            <Field label="Assigned To">
                                <Input name="assignedTo" value={form.assignedTo} onChange={handleInputChange} />
                            </Field>
                            <Field label="Created By">
                                <Input name="createdBy" value={form.createdBy} onChange={handleInputChange} />
                            </Field>
                            <Field label="Category ID">
                                <Input name="categoryId" value={form.categoryId} onChange={handleInputChange} />
                            </Field>
                        </DialogBody>
                        <DialogActions>
                            <Button type="button" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button appearance="primary" type="submit">
                                Add
                            </Button>
                        </DialogActions>
                    </form>
                </DialogSurface>
            </Dialog>
            <Table aria-label="My Tasks Table">
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHeaderCell key={column.columnId}>{column.renderHeaderCell()}</TableHeaderCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((item) => (
                        <TableRow key={item._id}>
                            {columns.map((column) => (
                                <TableCell key={column.columnId}>{column.renderCell(item)}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default MyTasksDataGrid;

