import { NavCategory, NavCategoryItem, NavSectionHeader, NavSubItem, NavSubItemGroup } from "@fluentui/react-components";
import { ServiceBell20Regular } from "@fluentui/react-icons";
import { mainLayoutStyles } from '../styles/Styles';

interface NotificaionListProps {
    openCategories: string[];
}

export default function NotificationList({ openCategories }: NotificaionListProps) {
    const styles = mainLayoutStyles();
    return (
        <>
            <NavSectionHeader>Notifications</NavSectionHeader>
            <NavCategory value="notifications">
                {/* category is a toggle-only control; children are links */}
                <NavCategoryItem
                    value="notifications"
                    icon={<ServiceBell20Regular />}
                    aria-expanded={openCategories.includes('notifications')}
                    className={styles.navMainItem}
                >
                    3 New Notifications
                </NavCategoryItem>

                <NavSubItemGroup>
                    <NavSubItem href="#" value="1" >
                        Julliana Rox has assigned a task.
                    </NavSubItem>
                    <NavSubItem href="#" value="2" >
                        Julliana Rox has assigned a task.
                    </NavSubItem>
                </NavSubItemGroup>
            </NavCategory>
        </>
    );
}