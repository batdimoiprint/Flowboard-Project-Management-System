import { Button, Persona, mergeClasses } from "@fluentui/react-components";
import { useNavigate } from "react-router";
import { useUser } from "../../hooks/useUser";
import { mainLayoutStyles } from "../styles/Styles";
import ThemeToggle from "../styles/ThemeToggle";

export default function SidebarProfileActions() {
    const s = mainLayoutStyles();
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    };

    // Format user's full name
    const fullName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim()
        : 'Guest User';

    return (
        <div className={mergeClasses(s.flexColFit, s.gap)}>

            <Persona
                name={fullName}
                secondaryText={user?.email || 'Not logged in'}
                presence={{ status: 'available' }}
                size="huge"
                textPosition="below"
                avatar={user?.userIMG ? { image: { src: user.userIMG } } : undefined}
                onClick={() => { navigate('/home/profile') }}
                className={s.pointer}
            />


            <ThemeToggle />
            {/* <Button appearance="outline" icon={<Person20Filled />}>
                    My Profile
                </Button> */}



            <Button appearance="primary" onClick={handleSignOut}>Sign Out</Button>
        </div>
    );
}
