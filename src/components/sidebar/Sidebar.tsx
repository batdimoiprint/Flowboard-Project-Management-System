import * as React from "react";
import {
    AppItem,
    Hamburger,
    NavCategory,
    NavCategoryItem,
    NavDivider,
    NavDrawer,
    NavDrawerBody,
    NavDrawerHeader,
    NavItem,
    NavSectionHeader,
    tokens,
    Text,
    Button,
} from "@fluentui/react-components";
import SidebarProfileActions from "./SidebarProfileActions";
import {
    Board20Filled,
    Board20Regular,
    MegaphoneLoud20Filled,
    MegaphoneLoud20Regular,
    NotePin20Filled,
    NotePin20Regular,
    PersonCircle32Regular,
    bundleIcon,
} from "@fluentui/react-icons";

const Dashboard = bundleIcon(Board20Filled, Board20Regular);
const Announcements = bundleIcon(MegaphoneLoud20Filled, MegaphoneLoud20Regular);
const JobPostings = bundleIcon(NotePin20Filled, NotePin20Regular);

export default function Sidebar() {
    const [isOpen, setIsOpen] = React.useState(true);
    const [notifications, setNotifications] = React.useState<string[]>([]);
    const [darkMode, setDarkMode] = React.useState(false);

    function readAllNotifications() {
        setNotifications([]);
    }

    return (
        <div style={{ height: "100vh", minWidth: 260, background: tokens.colorNeutralBackground2, borderRight: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <NavDrawer open={isOpen} type="inline" className="sidebar-nav" style={{ minHeight: "100vh" }}>
                <NavDrawerHeader>
                    <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS, padding: tokens.spacingHorizontalL }}>
                        <PersonCircle32Regular />
                        <Text weight="semibold" size={400}>FlowBoard</Text>
                        <Hamburger onClick={() => setIsOpen(!isOpen)} />
                    </div>
                </NavDrawerHeader>
                <NavDrawerBody>
                    <AppItem icon={<Dashboard />} as="a" href="#">My Tasks</AppItem>
                    <NavSectionHeader>Projects</NavSectionHeader>
                    <NavCategory value="projects">
                        <NavCategoryItem icon={<JobPostings />}>Projects List</NavCategoryItem>
   
                    </NavCategory>
                    <NavDivider />
                    <NavSectionHeader>Notifications</NavSectionHeader>
                    <NavCategory value="notifications">
                        {notifications.length === 0 ? (
                            <NavCategoryItem value="none">
                                <Text as="span" style={{ color: tokens.colorNeutralForegroundDisabled }}>No notifications</Text>
                            </NavCategoryItem>
                        ) : (
                            notifications.map((n, idx) => (
                                <NavCategoryItem key={idx} value={`n-${idx}`} icon={<Announcements />}>
                                    <NavItem as="button" value={`n-${idx}`}>{n}</NavItem>
                                </NavCategoryItem>
                            ))
                        )}
                    </NavCategory>
                    <Button appearance="outline" size="small" onClick={readAllNotifications} style={{ marginTop: tokens.spacingVerticalXS, marginBottom: tokens.spacingVerticalM }}>
                        Read All
                    </Button>
                    <NavDivider />
                    <SidebarProfileActions darkMode={darkMode} setDarkMode={setDarkMode} />
                </NavDrawerBody>
            </NavDrawer>
        </div>
    );
}
