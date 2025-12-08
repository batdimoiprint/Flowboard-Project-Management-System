import { Breadcrumb, BreadcrumbButton, BreadcrumbDivider, BreadcrumbItem, Button, Card, mergeClasses, Tooltip } from "@fluentui/react-components";
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder20Regular, Board20Regular, TaskListSquareLtr20Regular, Settings20Regular, ChartMultiple20Regular } from '@fluentui/react-icons';
import React from 'react';
import { mainLayoutStyles } from "../styles/Styles";

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
    const s = mainLayoutStyles()

    // Build path segments, remove empty and leading 'home'
    const rawSegments = location.pathname.split('/').filter(Boolean);
    const segments = rawSegments[0] === 'home' ? rawSegments.slice(1) : rawSegments;

    // Do not render breadcrumb for base/home with no meaningful segments
    if (!segments || segments.length === 0) return null;

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

            {/* Show Kanban, Tasks, Settings, and Analytics buttons when in a project context */}
            {isInProject && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
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
                </div>
            )}
        </Card>
    );
}
