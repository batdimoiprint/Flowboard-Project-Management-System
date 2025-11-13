import { NavCategory, NavCategoryItem, NavSubItemGroup, NavSubItem, NavSectionHeader, Button } from "@fluentui/react-components";
import { Folder20Regular } from "@fluentui/react-icons";
import { useSidebarStyles } from '../styles/Styles';
import { useNavigate } from "react-router";

interface ProjectListProps {
    openCategories: string[];
    styles: ReturnType<typeof useSidebarStyles>;
}

export default function ProjectList({ openCategories, styles }: ProjectListProps) {
    const navigate = useNavigate()
    return (
        <>
            <NavSectionHeader>Projects</NavSectionHeader>
            <NavCategory value="projects">
                {/* category is a toggle-only control; children are links */}
                <NavCategoryItem
                    value="projects"
                    icon={<Folder20Regular />}
                    aria-expanded={openCategories.includes('projects')}
                    className={styles.navItem}
                >
                    Projects List
                    <Button size="small" onClick={() => { navigate("/home/project/create") }} appearance="secondary"   >Create Project</Button>
                </NavCategoryItem>

                <NavSubItemGroup>
                    <NavSubItem href="#" value="3" className={styles.navItem}>
                        SE101
                    </NavSubItem>
                    <NavSubItem href="#" value="4" className={styles.navItem}>
                        IPT102
                    </NavSubItem>

                </NavSubItemGroup>
            </NavCategory>
        </>
    );
}