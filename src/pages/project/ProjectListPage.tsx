import { useEffect, useState } from 'react';
import { Avatar, Button, Input, Label, Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens, Card } from '@fluentui/react-components';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router';
import { projectsApi, type Project } from '../../components/apis/projects';
import { mainLayoutStyles } from '../../components/styles/Styles';

export default function ProjectListPage() {
    const styles = mainLayoutStyles();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch users map for avatar lookup
                const users = await usersApi.getAllUsers();
                const map: Record<string, User> = {};
                users.forEach((u) => { map[u.id] = u; });
                setUsersMap(map);

                // If user not available, fetch all projects as fallback
                if (!user || !user.id) {
                    const allProjects = await projectsApi.getAllProjects();
                    setProjects(allProjects);
                } else {
                    const userProjects = await projectsApi.getProjectsByUser(user.id);
                    // The backend returns either a single project (when id is a project id) or a list of projects for the user
                    // Our method expects an array, so keep as-is
                    setProjects(userProjects);
                }
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError('Failed to load projects');
            } finally { setLoading(false); }
        };

        fetch();
    }, [user]);

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
        <Card className={`${styles.artifCard} ${styles.wFull} ${styles.hFull} ${styles.layoutPadding}`}>
            <div className={`${styles.spaceBetweenRow} ${styles.alignCenter}`} style={{ marginBottom: tokens.spacingVerticalM }}>
                <div className={`${styles.personaRow}`}>
                    <Label>Projects List</Label>
                </div>
                <div className={`${styles.actionsRight} ${styles.alignCenter}`}>
                    <Button appearance="primary" onClick={() => navigate('/home/project/create')}>
                        Create Project
                    </Button>
                    <Input placeholder="Search Task" style={{ width: 280 }} />
                    <Input readOnly value="Newest - Oldest" style={{ width: 175 }} />
                </div>
            </div>

            {loading && (
                <div className={styles.alignCenter} style={{ padding: tokens.spacingVerticalL }}>
                    <Spinner label="Loading projects" />
                </div>
            )}

            {!loading && error && (
                <div className={styles.errorText}>{error}</div>
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
                            let ownerId: string | undefined;
                            if (project.permissions) {
                                for (const [uid, role] of Object.entries(project.permissions)) {
                                    if (role === 'Owner') { ownerId = uid; break; }
                                }
                            }
                            if (!ownerId) ownerId = project.createdBy;
                            const owner = ownerId ? usersMap[ownerId] : undefined;
                            const memberIds = (project.teamMembers ?? []).filter((memberId) => memberId !== ownerId);
                            return (
                                <TableRow key={project.id} onClick={() => navigate(`/home/project/${slug}`)} className={styles.pointer}>
                                    <TableCell>{project.projectName}</TableCell>
                                    <TableCell>{project.description}</TableCell>
                                    <TableCell>
                                        {/* Project Manager / Owner */}
                                        <div className={styles.personaRow}>
                                            <>
                                                <Avatar name={owner ? `${owner.firstName} ${owner.lastName}` : (ownerId ?? 'Unknown')} size={32} image={{ src: owner?.userIMG || undefined }} />
                                                <span style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>{owner ? owner.userName || 'Owner' : 'Owner'}</span>
                                            </>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={styles.personaRow}>
                                            {memberIds.slice(0, 3).map((memberId) => {
                                                const member = usersMap[memberId];
                                                return (
                                                    <Avatar key={memberId} name={member ? `${member.firstName} ${member.lastName}` : memberId} size={16} image={{ src: member?.userIMG || undefined }} />
                                                );
                                            })}
                                            {memberIds.length > 3 && (
                                                <span style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>
                                                    +{memberIds.length - 3}
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
