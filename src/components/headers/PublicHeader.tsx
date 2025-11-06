import { Button, Card, TabList, Tab } from '@fluentui/react-components';
import { usePublicHeaderStyles } from '../styles/Styles';
import { Home24Regular, Sparkle24Regular, People24Regular, Mail24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.webp';


export default function PublicHeader() {
    const styles = usePublicHeaderStyles();
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
                    <Button appearance="primary" onClick={() => navigate("/login")}>Log In</Button>
                </div>
            </header>
        </Card>
    );
}
