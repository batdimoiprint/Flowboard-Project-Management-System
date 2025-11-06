import { NavCategory, NavCategoryItem, NavSubItemGroup, NavSubItem, NavSectionHeader } from "@fluentui/react-components";
import { TaskListSquarePerson20Regular } from "@fluentui/react-icons";

interface ProjectListProps {
    openCategories: string[];
}

export default function ProjectList({ openCategories }: ProjectListProps) {
    return (
        <>
            <NavSectionHeader>Projects</NavSectionHeader>
            <NavCategory value="projects">
                {/* category is a toggle-only control; children are links */}
                <NavCategoryItem
                    value="projects"
                    icon={<TaskListSquarePerson20Regular />}
                    aria-expanded={openCategories.includes('projects')}
                >
                    Projects List
                </NavCategoryItem>

                <NavSubItemGroup>
                    <NavSubItem href="#" value="3" >
                        SE101
                    </NavSubItem>
                    <NavSubItem href="#" value="4">
                        IPT102
                    </NavSubItem>

                </NavSubItemGroup>
            </NavCategory>
        </>
    );
}