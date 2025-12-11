import { Breadcrumb, BreadcrumbButton, BreadcrumbDivider, BreadcrumbItem, Button, Card, mergeClasses, Tooltip } from "@fluentui/react-components";
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder20Regular, Board20Regular, TaskListSquareLtr20Regular, Settings20Regular, ChartMultiple20Regular } from '@fluentui/react-icons';
import React, { useEffect, useState } from 'react';
import { mainLayoutStyles } from "../styles/Styles";
import { projectsApi } from "../apis/projects";
import { useUser } from "../../hooks/useUser";

function titleCase(segment: string) {
    // make a friendly label from a path segment
    if (!segment) return '';
    return segment
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
}

export default function NavigationHeader() {
    const location = useLocation();
    const navigate = useNavigate();
    const s = mainLayoutStyles();
    const { user } = useUser();
    const [userProjectRole, setUserProjectRole] = useState<string | null>(null);

    // Build path segments, remove empty and leading 'home'
    const rawSegments = location.pathname.split('/').filter(Boolean);
    const segments = rawSegments[0] === 'home' ? rawSegments.slice(1) : rawSegments;

    // Build cumulative paths (we want clicks to navigate to the correct /home/... route)
    const crumbs = segments.map((seg, i) => {
        // cumulative path should include /home as the root when navigating
        const pathSegments = ['home', ...segments.slice(0, i + 1)];
        const path = '/' + pathSegments.join('/');
        return { label: titleCase(seg), path };
    });

    // Check if we're in a project context to show Kanban, Tasks, and Settings buttons
    const isInProject = segments.length >= 2 && segments[0] === 'project';
    const projectName = isInProject ? segments[1] : null;

    // Fetch user's role in the current project
    useEffect(() => {
        const fetchProjectRole = async () => {
            if (!isInProject || !projectName || !user?.id) {
                setUserProjectRole(null);
                return;
            }
            try {
                // Decode project name from URL and find matching project
                const decodedName = decodeURIComponent(projectName).replace(/-/g, ' ');
                const projects = await projectsApi.getProjectsAsMember();
                const project = projects.find(p => p.projectName.toLowerCase() === decodedName.toLowerCase());

                if (!project) {
                    console.warn('NavigationHeader - Project not found:', decodedName);
                    setUserProjectRole(null);
                    return;
                }

                const role = project.permissions?.[user.id] || 'Member';
                console.log('NavigationHeader - Project:', project.projectName, 'User ID:', user.id, 'Role:', role, 'Permissions:', project.permissions);
                setUserProjectRole(role);
            } catch (err) {
                console.error('Failed to fetch project role:', err);
                setUserProjectRole(null);
            }
        };
        fetchProjectRole();
    }, [isInProject, projectName, user?.id]);

    // Do not render breadcrumb for base/home with no meaningful segments
    if (!segments || segments.length === 0) return null;

    // Construct navigation paths
    const kanbanPath = projectName ? `/home/project/${projectName}/kanban` : null;
    const tasksPath = projectName ? `/home/project/${projectName}/tasks` : null;
    const analyticsPath = projectName ? `/home/project/${projectName}/analytics` : null;
    const settingsPath = projectName ? `/home/project/${projectName}` : null;

    // Check if current page is kanban, tasks, analytics, or settings
    const lastSegment = segments[segments.length - 1];
    const isKanbanPage = lastSegment === 'kanban';
    const isTasksPage = lastSegment === 'tasks';
    const isAnalyticsPageProject = lastSegment === 'analytics' && isInProject;
    const isSettingsPage = segments.length === 2 && segments[0] === 'project' && lastSegment !== 'kanban' && lastSegment !== 'tasks' && lastSegment !== 'analytics';

    return (
        <Card className={mergeClasses(s.flexRowFill, s.componentBorder)}>
            <Breadcrumb aria-label="Breadcrumb">
                {crumbs.map((c, idx) => (
                    <React.Fragment key={c.path}>
                        <BreadcrumbItem>
                            <BreadcrumbButton
                                onClick={() => navigate(c.path)}
                                current={idx === crumbs.length - 1}
                            >
                                {idx === 0 && segments[0] === 'project' ? <Folder20Regular style={{ marginRight: 8 }} /> : null}
                                {c.label}
                            </BreadcrumbButton>
                        </BreadcrumbItem>
                        {idx < crumbs.length - 1 && <BreadcrumbDivider />}
                    </React.Fragment>
                ))}
            </Breadcrumb>

            {/* Show buttons when in a project context - role-based visibility */}
            {isInProject && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    {/* Clients see only Analytics */}
                    {userProjectRole === 'Client' ? (
                        analyticsPath && (
                            <Tooltip content="Analytics Dashboard" relationship="label">
                                <Button
                                    appearance={isAnalyticsPageProject ? 'primary' : 'subtle'}
                                    icon={<ChartMultiple20Regular />}
                                    onClick={() => navigate(analyticsPath)}
                                >
                                    Analytics
                                </Button>
                            </Tooltip>
                        )
                    ) : (
                        <>
                            {/* Non-client users see Kanban, Tasks, Analytics, and Settings */}
                            {kanbanPath && (
                                <Tooltip content="Kanban Board" relationship="label">
                                    <Button
                                        appearance={isKanbanPage ? 'primary' : 'subtle'}
                                        icon={<Board20Regular />}
                                        onClick={() => navigate(kanbanPath)}
                                    >
                                        Kanban
                                    </Button>
                                </Tooltip>
                            )}
                            {tasksPath && (
                                <Tooltip content="Task List" relationship="label">
                                    <Button
                                        appearance={isTasksPage ? 'primary' : 'subtle'}
                                        icon={<TaskListSquareLtr20Regular />}
                                        onClick={() => navigate(tasksPath)}
                                    >
                                        Tasks
                                    </Button>
                                </Tooltip>
                            )}
                            {analyticsPath && (
                                <Tooltip content="Analytics Dashboard" relationship="label">
                                    <Button
                                        appearance={isAnalyticsPageProject ? 'primary' : 'subtle'}
                                        icon={<ChartMultiple20Regular />}
                                        onClick={() => navigate(analyticsPath)}
                                    >
                                        Analytics
                                    </Button>
                                </Tooltip>
                            )}
                            {settingsPath && (
                                <Tooltip content="Project Settings" relationship="label">
                                    <Button
                                        appearance={isSettingsPage ? 'primary' : 'subtle'}
                                        icon={<Settings20Regular />}
                                        onClick={() => navigate(settingsPath)}
                                    >
                                        Settings
                                    </Button>
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
