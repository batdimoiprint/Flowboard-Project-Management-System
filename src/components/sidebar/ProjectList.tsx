import { mergeClasses, NavItem, NavSectionHeader, Text, tokens, Button, makeStyles } from "@fluentui/react-components";
import { Folder20Regular, AddCircle24Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { useUser } from "../../hooks/useUser";
import { projectsApi, type Project } from "../apis/projects";

interface ProjectListProps {
    refreshSignal?: number;
}

const useProjectListStyles = makeStyles({
    projectListContainer: {
        maxHeight: "300px",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    navItem: {
        paddingInline: tokens.spacingHorizontalS,
        paddingBlock: tokens.spacingVerticalS,
        display: 'flex',
        alignItems: 'center',
        background: tokens.colorNeutralBackground2,
    },
    navItemLabel: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
        maxWidth: '100%'
    },
    selectedItem: {
        backgroundColor: tokens.colorNeutralBackground1Selected,
        color: tokens.colorBrandBackground,
        fontWeight: tokens.fontWeightBold
    },
});

const buildSlug = (name: string) =>
    encodeURIComponent(
        name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
    );

export default function ProjectList({ refreshSignal }: ProjectListProps) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user: currentUser } = useUser();
    const styles = useProjectListStyles();
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

    useEffect(() => {
        let active = true;

        const fetchProjects = async () => {
            setLoading(true);
            setError("");
            try {
                let allProjects: Project[] = [];

                if (currentUser?.id) {
                    // Fetch projects created by the user
                    const createdProjects = await projectsApi.getProjectsByUser(currentUser.id);
                    if (Array.isArray(createdProjects)) {
                        allProjects = allProjects.concat(createdProjects);
                    } else if (createdProjects) {
                        allProjects.push(createdProjects as Project);
                    }

                    // Fetch projects where the user is a team member
                    const memberProjects = await projectsApi.getProjectsAsMember();
                    if (Array.isArray(memberProjects)) {
                        allProjects = allProjects.concat(memberProjects);
                    } else if (memberProjects) {
                        allProjects.push(memberProjects as Project);
                    }

                    // Remove duplicates by ID
                    const uniqueProjects = Array.from(
                        new Map(allProjects.map((p) => [p.id, p])).values()
                    );
                    setProjects(uniqueProjects);
                } else {
                    const data = await projectsApi.getAllProjects();
                    setProjects(Array.isArray(data) ? data : data ? [data as Project] : []);
                }
            } catch (err) {
                if (!active) return;
                setError(err instanceof Error ? err.message : "Unable to load projects");
                setProjects([]);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchProjects();
        return () => {
            active = false;
        };
    }, [currentUser?.id, refreshSignal]);

    const handleProjectClick = (project: Project) => {
        const slug = buildSlug(project.projectName);
        // Check if user is a client in this project
        const userRole = project.permissions?.[currentUser?.id || ''];
        const isClient = userRole === 'Client';
        // Redirect clients to analytics, others to kanban
        const targetPath = isClient ? 'analytics' : 'kanban';
        navigate(`/home/project/${slug}/${targetPath}`);
    };

    return (
        <>
            <NavSectionHeader>
                <div className={styles.sectionHeader}>
                    <span>Projects</span>
                    <Button
                        aria-label="Create project"
                        appearance="subtle"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/home/create');
                        }}
                    >
                        <AddCircle24Regular />
                    </Button>
                </div>
            </NavSectionHeader>

            <NavItem
                icon={<Folder20Regular />}
                value="all-projects"
                className={mergeClasses(styles.navItem, selectedValue === 'all-projects' && styles.selectedItem)}
                onClick={() => { setSelectedValue('all-projects'); navigate('/home/project'); }}
            >
                <span className={styles.navItemLabel}>All Projects</span>
            </NavItem>

            <div className={styles.projectListContainer}>
                {loading && (
                    <Text size={200} style={{ paddingInline: tokens.spacingHorizontalM }}>
                        Loading projects...
                    </Text>
                )}

                {!loading && error && (
                    <Text size={200} style={{ paddingInline: tokens.spacingHorizontalM, color: tokens.colorPaletteRedForeground1 }}>
                        {error}
                    </Text>
                )}

                {!loading && !error && projects.length === 0 && (
                    <Text size={200} style={{ paddingInline: tokens.spacingHorizontalM }}>
                        No projects yet
                    </Text>
                )}

                {!loading && !error && projects.map((project) => (
                    <NavItem
                        key={project.id}
                        value={project.id}
                        className={mergeClasses(styles.navItem, selectedValue === project.id && styles.selectedItem)}
                        onClick={() => { setSelectedValue(project.id); handleProjectClick(project); }}
                    >
                        <span className={styles.navItemLabel}>{project.projectName}</span>
                    </NavItem>
                ))}
            </div>
        </>
    );
}