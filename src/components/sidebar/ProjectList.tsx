import { mergeClasses, NavCategory, NavCategoryItem, NavSectionHeader, NavSubItem, NavSubItemGroup, Text, tokens, Button } from "@fluentui/react-components";
import { Folder20Regular, AddCircle24Regular } from "@fluentui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import { useUser } from "../../hooks/useUser";
import { projectsApi, type Project } from "../apis/projects";
import { mainLayoutStyles } from '../styles/Styles';

interface ProjectListProps {
    openCategories: string[];
    onNavigateToProjects: () => void;
    refreshSignal?: number;
}

const RECENT_LIMIT = 4;

const buildSlug = (name: string) =>
    encodeURIComponent(
        name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
    );

export default function ProjectList({ openCategories, onNavigateToProjects, refreshSignal }: ProjectListProps) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user: currentUser } = useUser();
    const s = mainLayoutStyles();

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

    const recentProjects = useMemo(() => {
        return [...projects]
            .sort((a, b) => {
                const aDate = new Date(a.createdAt ?? 0).getTime();
                const bDate = new Date(b.createdAt ?? 0).getTime();
                return bDate - aDate;
            })
            .slice(0, RECENT_LIMIT);
    }, [projects]);

    const handleProjectClick = (projectName: string) => {
        const slug = buildSlug(projectName);
        navigate(`/home/project/${slug}/kanban`);
    };

    return (
        <>

            <NavCategory value="projects">

                <NavSectionHeader>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>Projects</span>
                        <Button aria-label="Create project" appearance="subtle" onClick={(e) => { e.stopPropagation(); navigate('/home/create'); }}>
                            <AddCircle24Regular />
                        </Button>
                    </div>
                </NavSectionHeader>
                <NavCategoryItem
                    value="projects"
                    icon={<Folder20Regular />}
                    aria-expanded={openCategories.includes('projects')}
                    className={mergeClasses(s.navMainItem)}
                    onClick={onNavigateToProjects}
                >
                    Projects List
                </NavCategoryItem>

                {/* Render subitems group always (status messages will appear as subitems) */}
                <NavSubItemGroup>
                    {loading && (
                        <Text size={200} style={{ paddingInline: tokens.spacingHorizontalS }}>
                            Loading projects...
                        </Text>
                    )}

                    {!loading && error && (
                        <Text size={200} style={{ paddingInline: tokens.spacingHorizontalS, color: tokens.colorPaletteRedForeground1 }}>
                            {error}
                        </Text>
                    )}

                    {!loading && !error && recentProjects.length === 0 && (
                        <Text size={200} style={{ paddingInline: tokens.spacingHorizontalS }}>
                            No projects yet
                        </Text>
                    )}

                    {recentProjects.map((project) => (
                        <NavSubItem
                            as="button"
                            key={project.id}
                            value={project.id}
                            className={mergeClasses(s.navSubItem)}
                            onClick={() => handleProjectClick(project.projectName)}
                        >
                            {project.projectName}
                        </NavSubItem>
                    ))}
                </NavSubItemGroup>

            </NavCategory>
        </>
    );
}