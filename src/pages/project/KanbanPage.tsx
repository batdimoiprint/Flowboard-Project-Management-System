import { Card, tokens } from '@fluentui/react-components';
import { useParams } from 'react-router-dom';

export default function KanbanPage() {
    const { projectName } = useParams<{ projectName: string }>();
    const title = projectName
        ? decodeURIComponent(projectName).replace(/-/g, ' ')
        : 'Project';

    return (
        <Card style={{ padding: tokens.spacingVerticalXXL }}>
            <h1 style={{ margin: 0 }}>{title} - Kanban</h1>
            {/* TODO: Implement Kanban board for this project */}
        </Card>
    );
}
