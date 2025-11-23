import { Card, tokens } from '@fluentui/react-components';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import { projectsApi } from '../../components/apis/projects';
import type { Project } from '../../components/apis/projects';
import { useEffect, useState } from 'react';

// Route currently only provides projectName; we look up projectId by name.
export default function KanbanPage() {
    const { projectName } = useParams<{ projectName: string }>();
    const decodedName = projectName ? decodeURIComponent(projectName).replace(/-/g, ' ') : '';
    const [projectId, setProjectId] = useState<string | undefined>(undefined);
    const [loadingProject, setLoadingProject] = useState(false);
    const [projectError, setProjectError] = useState<string | null>(null);

    useEffect(() => {
        if (!decodedName) return;
        setLoadingProject(true);
        projectsApi.getAllProjects()
            .then((projects: Project[]) => {
                const match = projects.find(p => p.projectName.toLowerCase() === decodedName.toLowerCase());
                if (match) setProjectId(match.id);
                else setProjectError('Project not found');
            })
            .catch((e: unknown) => setProjectError((e as Error)?.message || 'Failed to load project'))
            .finally(() => setLoadingProject(false));
    }, [decodedName]);

    const title = decodedName || 'Project';

    return (
        <Card style={{ padding: tokens.spacingVerticalXXL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
            <h1 style={{ margin: 0 }}>{title} - Kanban</h1>
            {projectError && (
                <div style={{ color: tokens.colorPaletteRedForeground3 }}>{projectError}</div>
            )}
            <KanbanBoard projectId={projectId} />
            {loadingProject && <div style={{ color: tokens.colorNeutralForeground3 }}>Resolving project…</div>}
        </Card>
    );
}
