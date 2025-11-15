import { Label, NavCategory, NavCategoryItem, NavSectionHeader, NavSubItem, NavSubItemGroup, Text, tokens } from "@fluentui/react-components";
import { AddCircle24Regular, Folder20Regular } from "@fluentui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import { projectsApi, type Project } from "../apis/projects";
import { mainLayoutStyles } from '../styles/Styles';

interface ProjectListProps {
    openCategories: string[];
    onNavigateToProjects: () => void;
}

const RECENT_LIMIT = 5;

const buildSlug = (name: string) =>
    encodeURIComponent(
        name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
    );

export default function ProjectList({ openCategories, onNavigateToProjects }: ProjectListProps) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const styles = mainLayoutStyles();

    useEffect(() => {
        let active = true;

        const fetchProjects = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await projectsApi.getAllProjects();
                if (!active) return;
                setProjects(data);
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
    }, []);

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
        navigate(`/home/project/${slug}`);
    };

    return (
        <>

            <NavCategory value="projects">

                <NavSectionHeader>Projects</NavSectionHeader>
                <NavCategoryItem
                    value="projects"
                    icon={<Folder20Regular />}
                    aria-expanded={openCategories.includes('projects')}
                    className={styles.navMainItem}
                    onClick={onNavigateToProjects}
                >
                    Projects List

                </NavCategoryItem>
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
                    {!loading && !error && recentProjects.map((project) => (
                        <NavSubItem
                            as="button"
                            key={project.id}
                            value={project.id}
                            className={styles.navSubItem}
                            onClick={() => handleProjectClick(project.projectName)}
                        >
                            {project.projectName}
                        </NavSubItem>

                    ))}
                    <NavSubItem as="button" className={styles.navSubItem} value="createProject"
                        onClick={(event) => { event.stopPropagation(); navigate("/home/project/create"); }}>
                        <AddCircle24Regular />
                        <Label>Create Project</Label>

                    </NavSubItem>


                </NavSubItemGroup>
            </NavCategory>
        </>
    );
}