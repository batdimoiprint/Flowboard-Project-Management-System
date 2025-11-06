import {
    Card,
    NavDrawer,
    NavDrawerBody,
    NavDrawerHeader,
    NavItem,
    Text,
    tokens,
} from "@fluentui/react-components";
import { TaskListSquarePerson20Regular } from "@fluentui/react-icons";
import { useState } from "react";
import logo from '../../assets/logo.webp';
import SidebarProfileActions from "./SidebarProfileActions";
import { useSidebarStyles } from '../styles/Styles';

import ProjectList from './ProjectList';
import NotificationList from "./NotificationList";

export default function Sidebar() {

    const [openCategories, setOpenCategories] = useState<string[]>(['projects']);
    const styles = useSidebarStyles();

    // Allow multiple categories open (adjust if single-open behavior is desired)
    const isMultiple = true;

    function handleCategoryToggle(_: Event | React.SyntheticEvent, data: any) {
        const category = data.categoryValue as string | undefined;
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
        <Card className={styles.root}>
            <NavDrawer
                type="inline"
                open={true}
                multiple={isMultiple}
                onNavCategoryItemToggle={handleCategoryToggle}
                openCategories={openCategories}
                className={styles.drawer}
                style={{
                    backgroundColor: tokens.colorNeutralBackground1
                }}
            >
                <NavDrawerHeader className={styles.headerContainer}>
                    <img src={logo} alt="FlowBoard" style={{ width: '48px', height: '48px' }} />
                    <Text weight="semibold" size={700}>FlowBoard</Text>
                </NavDrawerHeader>

                <NavDrawerBody className={styles.body}>
                    <div className={styles.bodyItems}>

                        <NavItem as="button" value="myTasks" icon={<TaskListSquarePerson20Regular />}>
                            My Tasks
                        </NavItem>
                        {/* Project List Section */}
                        <ProjectList openCategories={openCategories} />

                        <NotificationList openCategories={openCategories} />
                    </div>

                    <SidebarProfileActions />
                </NavDrawerBody>
            </NavDrawer>
        </Card>
    );
}