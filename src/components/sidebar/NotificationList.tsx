import { NavCategory, NavCategoryItem, NavSectionHeader, NavSubItem, NavSubItemGroup } from "@fluentui/react-components";
import { ServiceBell20Regular } from "@fluentui/react-icons";
import { useSidebarStyles } from '../styles/Styles';

interface NotificaionListProps {
    openCategories: string[];
    styles: ReturnType<typeof useSidebarStyles>;
}

export default function NotificationList({ openCategories, styles }: NotificaionListProps) {
    return (
        <>
            <NavSectionHeader>Notifications</NavSectionHeader>
            <NavCategory value="notifications">
                {/* category is a toggle-only control; children are links */}
                <NavCategoryItem
                    value="notifications"
                    icon={<ServiceBell20Regular />}
                    aria-expanded={openCategories.includes('notifications')}
                    className={styles.navItem}
                >
                    3 New Notifications
                </NavCategoryItem>

                <NavSubItemGroup>
                    <NavSubItem href="#" value="1" className={styles.navItem}>
                        Julliana Rox has assigned a task.
                    </NavSubItem>
                    <NavSubItem href="#" value="2" className={styles.navItem}>
                        Julliana Rox has assigned a task.
                    </NavSubItem>
                </NavSubItemGroup>
            </NavCategory>
        </>
    );
}