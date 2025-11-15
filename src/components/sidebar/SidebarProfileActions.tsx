import { Person20Filled } from "@fluentui/react-icons";
import { useSidebarProfileActionsStyles } from "../styles/Styles";
import { Button, Persona, NavItem } from "@fluentui/react-components";
import ThemeToggle from "../styles/ThemeToggle";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router";

export default function SidebarProfileActions() {
    const styles = useSidebarProfileActionsStyles();
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    // Format user's full name
    const fullName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim()
        : 'Guest User';

    return (
        <div className={styles.root}>
            <div >
                <Persona
                    name={fullName}
                    secondaryText={user?.email || 'Not logged in'}
                    presence={{ status: 'available' }}
                    size="huge"
                    textPosition="below"
                    avatar={user?.userIMG ? { image: { src: user.userIMG } } : undefined}
                />
            </div>
            <div className={styles.actionsContainer}>
                <ThemeToggle className={styles.button} />
                <NavItem as="button" value="profile" onClick={() => { navigate('/home/profile') }} className={styles.navMainItem} icon={<Person20Filled />}>
                    My Profile
                </NavItem>
                <Button appearance="primary" className={styles.button} onClick={handleSignOut}>Sign Out</Button>

            </div>
        </div>
    );
}
