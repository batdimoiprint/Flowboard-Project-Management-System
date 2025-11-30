import { Button, Input, Spinner, tokens } from '@fluentui/react-components';
import { useEffect, useState, useMemo } from 'react';
import KanbanColumn from './KanbanColumn';
import TaskDialog from '../dialogs/TaskDialog';
import { projectsApi } from '../apis/projects';
import { mainLayoutStyles } from '../styles/Styles';
import { tasksApi } from '../apis/tasks';
import type { TaskResponse } from '../apis/tasks';
import { usersApi } from '../apis/users';
import type { User } from '../apis/auth';
import { categoriesApi } from '../apis/categories';
import { useUser } from '../../hooks/useUser';

export interface KanbanBoardProps {
  projectId?: string; // optional for now; if absent, show info message
}

const UNCATEGORIZED = 'Uncategorized';

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const styles = mainLayoutStyles();
  const { user: currentUser } = useUser();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState({
    title: '', description: '', priority: 'Low', status: 'To Do', startDate: '', endDate: '', assignedTo: [] as string[], createdBy: '', category: '', projectId: projectId || '', comments: ''
  });
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('edit');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [isLoadingAssignableUsers, setIsLoadingAssignableUsers] = useState(false);

  // Fetch categories and tasks
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      categoriesApi.getCategoriesByProject(projectId),
      tasksApi.getTasksByProject(projectId)
    ])
      .then(([cats, data]) => {
        setTasks(data);
        const categoryNames = cats.map(c => c.categoryName);
        const taskCategories = Array.from(new Set(data.map(t => (t.category || '').trim()))).filter(Boolean);
        const merged = Array.from(new Set([...categoryNames, ...taskCategories]));
        if (data.some(t => !t.category)) merged.push(UNCATEGORIZED);
        setColumns(merged);

        // Build map of categoryName -> categoryId
        const catMap: Record<string, string> = {};
        cats.forEach(c => {
          catMap[c.categoryName] = c.id;
        });
        setCategoriesMap(catMap);
      })
      .catch(e => setError((e as Error)?.message || 'Failed to load board'))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Fetch user details for assigned users
  useEffect(() => {
    const uniqueUserIds = Array.from(new Set(tasks.flatMap(t => t.assignedTo)));
    if (uniqueUserIds.length === 0) return;
    Promise.all(uniqueUserIds.map(id => usersApi.getUserById(id).catch(() => null)))
      .then(results => {
        const map: Record<string, User> = {};
        results.filter(Boolean).forEach(u => { if (u) map[u.id] = u; });
        setUsersById(map);
      });
  }, [tasks]);

  // Load assignable users (project team members, with fallback to all users)
  useEffect(() => {
    if (!projectId) return;
    setIsLoadingAssignableUsers(true);

    projectsApi.getProjectMembers(projectId)
      .then(members => {
        // Convert ProjectMember[] to User[] (they have compatible structures)
        const users: User[] = members.map(member => ({
          id: member.id,
          userName: member.userName,
          firstName: member.firstName,
          middleName: member.middleName,
          lastName: member.lastName,
          email: member.email,
          userIMG: member.userIMG,
        } as User));

        if (users.length > 0) {
          setAssignableUsers(users);
        } else {
          // Fallback: fetch all users if no team members found
          usersApi.getAllUsers().then(setAssignableUsers).catch(() => setAssignableUsers([]));
        }
      })
      .catch(async () => {
        // On error, try to fetch all users as fallback
        try {
          const allUsers = await usersApi.getAllUsers();
          setAssignableUsers(allUsers);
        } catch {
          setAssignableUsers([]);
        }
      })
      .finally(() => setIsLoadingAssignableUsers(false));
  }, [projectId]);

  function safeCategory(name: string | undefined) { return (name || '').trim() || UNCATEGORIZED; }

  // Normalized tasks by column title
  const tasksByColumn = useMemo(() => {
    const map: Record<string, TaskResponse[]> = {};
    columns.forEach(c => { map[c] = []; });
    tasks.forEach(task => {
      const col = safeCategory(task.category);
      if (!map[col]) map[col] = [];
      map[col].push(task);
    });
    return map;
  }, [tasks, columns]);

  async function handleDropTask(taskId: string, newCategory: string) {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      // Optimistic update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, category: newCategory === UNCATEGORIZED ? '' : newCategory } : t));
      if (newCategory !== UNCATEGORIZED) {
        await tasksApi.patchTask(taskId, { category: newCategory });
      } else {
        await tasksApi.patchTask(taskId, { category: '' });
      }
    } catch {
      setError('Failed to move task');
    }
  }

  // (Removed unused helper functions – inline handlers used instead)

  async function handleAddColumn() {
    const name = newColumnName.trim();
    if (!name || !projectId) return;
    if (columns.includes(name)) return;
    try {
      const created = await categoriesApi.createCategory({ projectId, categoryName: name, createdBy: 'system' });
      setColumns(prev => [...prev, created.categoryName]);
      setCategoriesMap(prev => ({ ...prev, [created.categoryName]: created.id }));
      setNewColumnName('');
      setAddingColumn(false);
    } catch {
      setError('Failed to create column');
    }
  }

  async function handleDeleteColumn(columnTitle: string) {
    const categoryId = categoriesMap[columnTitle];
    if (!categoryId) return;

    // Check if column has tasks
    const columnTasks = tasksByColumn[columnTitle] || [];
    if (columnTasks.length > 0) {
      setError('Cannot delete column with tasks. Please move or delete tasks first.');
      return;
    }

    try {
      await categoriesApi.deleteCategory(categoryId);
      setColumns(prev => prev.filter(c => c !== columnTitle));
      setCategoriesMap(prev => {
        const newMap = { ...prev };
        delete newMap[columnTitle];
        return newMap;
      });
    } catch {
      setError('Failed to delete column');
    }
  }

  function handleAddTask(categoryTitle: string) {
    if (!currentUser?.id) {
      setError('User not authenticated. Please log in.');
      return;
    }
    setDialogMode('add');
    setSelectedTaskId(null);
    setDialogForm({
      title: '',
      description: '',
      priority: 'Low',
      status: 'To Do',
      startDate: '',
      endDate: '',
      assignedTo: [],
      createdBy: currentUser.id,
      category: categoryTitle === UNCATEGORIZED ? '' : categoryTitle,
      projectId: projectId || '',
      comments: ''
    });
    setDialogOpen(true);
  }

  if (!projectId) {
    return <div style={{ padding: tokens.spacingHorizontalL }}>Select a project to view its Kanban board.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
      {error && <div style={{ color: tokens.colorPaletteRedForeground3 }}>{error}</div>}
      <div className={styles.kanbanBoard}>
        {columns.map(col => (
          <KanbanColumn
            key={col}
            title={col}
            tasks={tasksByColumn[col] || []}
            usersById={usersById}
            onDropTask={handleDropTask}
            onDeleteColumn={handleDeleteColumn}
            onAddTask={handleAddTask}
            categoryId={categoriesMap[col]}
            onTaskClick={(task) => {
              // Helper to format date for HTML date input (YYYY-MM-DD)
              const formatDateForInput = (dateValue: string | null | undefined): string => {
                if (!dateValue) return '';
                try {
                  const date = new Date(dateValue);
                  if (isNaN(date.getTime())) return '';
                  return date.toISOString().split('T')[0];
                } catch {
                  return '';
                }
              };

              // Open dialog with clicked task
              setDialogMode('edit');
              setDialogForm({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Low',
                status: task.status || 'To Do',
                startDate: formatDateForInput(task.startDate),
                endDate: formatDateForInput(task.endDate),
                assignedTo: task.assignedTo || [],
                createdBy: task.createdBy || '',
                category: task.category || '',
                projectId: task.projectId || projectId || '',
                comments: ''
              });
              // Persist selected task id in component state instead of window
              setSelectedTaskId(task._id);
              setDialogOpen(true);
            }}
          />
        ))}
        <div className={styles.kanbanAddColumn}>
          {!addingColumn ? (
            <Button appearance="transparent" onClick={() => setAddingColumn(true)}>+ Add Column</Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
              <Input
                placeholder="Column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                <Button appearance="primary" size="small" disabled={!newColumnName.trim()} onClick={handleAddColumn}>Add</Button>
                <Button size="small" onClick={() => { setAddingColumn(false); setNewColumnName(''); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading && <Spinner label="Loading tasks" />}
      {dialogOpen && (
        <TaskDialog
          open={dialogOpen}
          onOpenChange={(o) => setDialogOpen(o)}
          form={dialogForm}
          onInputChange={(e) => {
            const { name, value } = e.target as HTMLInputElement;
            setDialogForm(prev => ({ ...prev, [name]: value }));
          }}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (dialogMode === 'edit' && selectedTaskId) {
                // Update existing task
                await tasksApi.patchTask(selectedTaskId, {
                  title: dialogForm.title,
                  description: dialogForm.description,
                  priority: dialogForm.priority,
                  status: dialogForm.status,
                  category: dialogForm.category,
                  startDate: dialogForm.startDate,
                  endDate: dialogForm.endDate,
                  assignedTo: dialogForm.assignedTo,
                });
              } else if (dialogMode === 'add') {
                // Create new task
                if (!currentUser?.id) {
                  setError('User not authenticated. Please log in.');
                  return;
                }
                await tasksApi.createTask({
                  title: dialogForm.title,
                  description: dialogForm.description,
                  priority: dialogForm.priority,
                  status: dialogForm.status,
                  category: dialogForm.category,
                  startDate: dialogForm.startDate,
                  endDate: dialogForm.endDate,
                  assignedTo: dialogForm.assignedTo,
                  createdBy: currentUser.id,
                  projectId: projectId || '',
                  comments: dialogForm.comments || ''
                });
              }

              // Refresh tasks
              if (projectId) {
                const refreshed = await tasksApi.getTasksByProject(projectId);
                setTasks(refreshed);
              }
              setDialogOpen(false);
            } catch {
              setError(dialogMode === 'edit' ? 'Failed to update task' : 'Failed to create task');
            }
          }}
          assignableUsers={assignableUsers}
          isLoadingAssignableUsers={isLoadingAssignableUsers}
          currentUser={currentUser}
          dialogMode={dialogMode}
          hideProjectField={true}
          categories={columns.filter(c => c !== 'Uncategorized').map(name => ({ id: name, projectId: projectId || '', categoryName: name, createdBy: '' }))}
          isLoadingCategories={false}
        />
      )}
    </div>
  );
}
