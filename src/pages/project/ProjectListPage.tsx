import { useEffect, useState } from 'react';
import { Avatar, Button, Input, Label, Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens, Card } from '@fluentui/react-components';
import { useNavigate } from 'react-router';
import { projectsApi, type Project } from '../../components/apis/projects';

export default function ProjectListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectsApi.getAllProjects();
                setProjects(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Failed to load projects');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        });
    };

    return (
        <Card style={{ padding: tokens.spacingVerticalL, width: '100%', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalM }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                    <Label>Projects List</Label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM }}>
                    <Button appearance="primary" onClick={() => navigate('/home/project/create')}>
                        Create Project
                    </Button>
                    <Input placeholder="Search Task" style={{ width: 280 }} />
                    <Input readOnly value="Newest - Oldest" style={{ width: 175 }} />
                </div>
            </div>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalL }}>
                    <Spinner label="Loading projects" />
                </div>
            )}

            {!loading && error && (
                <div style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</div>
            )}

            {!loading && !error && (
                <Table aria-label="Projects list table">
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Project Name</TableHeaderCell>
                            <TableHeaderCell>Description</TableHeaderCell>
                            <TableHeaderCell>Project Manager</TableHeaderCell>
                            <TableHeaderCell>Members</TableHeaderCell>
                            <TableHeaderCell>Created At</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => {
                            const slug = encodeURIComponent(project.projectName.toLowerCase().replace(/\s+/g, '-'));
                            return (
                                <TableRow key={project.id} onClick={() => navigate(`/home/project/${slug}/team`)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{project.projectName}</TableCell>
                                    <TableCell>{project.description}</TableCell>
                                    <TableCell>
                                        {/* Placeholder avatar until you map real user data */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                            <Avatar name="Project Owner" size={32} />
                                            <span style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>Owner</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                            {project.teamMembers.slice(0, 2).map((memberId) => (
                                                <Avatar key={memberId} name={memberId} size={16} />
                                            ))}
                                            {project.teamMembers.length > 2 && (
                                                <span style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>
                                                    +{project.teamMembers.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(project.createdAt)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </Card>
    );
}
