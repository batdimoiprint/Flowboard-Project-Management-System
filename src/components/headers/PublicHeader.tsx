import { Button, makeStyles, tokens, Card, typographyStyles, TabList, Tab } from '@fluentui/react-components';
import { Home24Regular, Sparkle24Regular, People24Regular, Mail24Regular } from '@fluentui/react-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.webp';

const useStyles = makeStyles({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground1,
        gap: tokens.spacingHorizontalM,
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    logoIcon: {
        width: '48px',
        height: '48px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',



    },
    brand: {
        ...typographyStyles.title3,
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '100px',
        flex: 1,
    },

    navLabel: {
        fontSize: '14px',
    },

    right: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
});


export default function PublicHeader() {
    const styles = useStyles();
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    return (
        <Card >
            <header className={styles.header} role="banner">
                <div className={styles.left}>
                    <div className={styles.logoIcon} aria-hidden>
                        <img src={logo} alt="FlowBoard" style={{ width: '48px', height: '48px' }} />
                    </div>
                    <div className={styles.brand}>FlowBoard</div>
                </div>


                <TabList selectedValue={pathname} className={styles.nav} onTabSelect={(_, data) => navigate(data.value as string)}>
                    <Tab
                        value="/"

                        aria-current={pathname === '/' ? 'page' : undefined}
                    >
                        <Home24Regular />
                        <div className={styles.navLabel}>Home</div>
                    </Tab>
                    <Tab
                        value="/features"

                        aria-current={pathname === '/features' ? 'page' : undefined}
                    >
                        <Sparkle24Regular />
                        <div className={styles.navLabel}>Features</div>
                    </Tab>
                    <Tab
                        value="/team"

                        aria-current={pathname === '/team' ? 'page' : undefined}
                    >
                        <People24Regular />
                        <div className={styles.navLabel}>Our Team</div>
                    </Tab>
                    <Tab
                        value="/contact"

                        aria-current={pathname === '/contact' ? 'page' : undefined}
                    >
                        <Mail24Regular />
                        <div className={styles.navLabel}>Contact Us</div>
                    </Tab>
                </TabList>


                <div className={styles.right}>
                    <Button appearance="primary">Log In</Button>
                </div>
            </header>
        </Card>
    );
}
