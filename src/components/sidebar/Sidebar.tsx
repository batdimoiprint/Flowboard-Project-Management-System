import {
    mergeClasses,
    NavDrawer,
    NavDrawerBody,
    NavDrawerHeader,
    NavItem,
} from "@fluentui/react-components";
import { TaskListSquarePerson20Regular } from "@fluentui/react-icons";
import { useState } from "react";
import SidebarProfileActions from "./SidebarProfileActions";
import { mainLayoutStyles } from '../styles/Styles';

import ProjectList from './ProjectList';
import NotificationList from "./NotificationList";
import { useNavigate } from "react-router";
import BrandHeader from "../headers/BrandHeader";

export default function Sidebar() {

    const [openCategories, setOpenCategories] = useState<string[]>(['projects']);
    const s = mainLayoutStyles();
    const navigate = useNavigate();
    const handleProjectsNav = () => navigate('/home/project');

    // Allow multiple categories open (adjust if single-open behavior is desired)
    const isMultiple = true;

    function handleCategoryToggle(_: Event | React.SyntheticEvent, data: { categoryValue?: string }) {
        const category = data.categoryValue;
        if (!category) return;

        if (isMultiple) {
            if (openCategories.includes(category)) {
                setOpenCategories(openCategories.filter((c) => c !== category));
            } else {
                setOpenCategories([...openCategories, category]);
            }
        } else {
            if (openCategories.includes(category)) setOpenCategories([]);
            else setOpenCategories([category]);
        }
    }

    return (
        // <Card className={s.root}>
        <NavDrawer
            type="inline"
            open={true}
            multiple={isMultiple}
            onNavCategoryItemToggle={handleCategoryToggle}
            openCategories={openCategories}
            className={mergeClasses(s.flexColFit, s.drawer, s.artifCard, s.layoutPadding, s.spaceBetween)}
        >
            <NavDrawerHeader >
                <BrandHeader navigateTo="/home" />
            </NavDrawerHeader>



            <div className={mergeClasses(s.bodyItems, s.debugBG)}>

                <NavItem as="button" value="myTasks" onClick={() => { navigate('/home') }} icon={<TaskListSquarePerson20Regular />} className={s.navMainItem}>
                    My Tasks
                </NavItem>
                {/* Project List Section */}
                <ProjectList openCategories={openCategories} styles={s} onNavigateToProjects={handleProjectsNav} />

                <NotificationList openCategories={openCategories} styles={s} />
            </div>

            <SidebarProfileActions />


        </NavDrawer>
        // </Card>
    );
}