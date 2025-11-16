import { Button, Card, TabList, Tab, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { Sparkle24Regular, People24Regular, Mail24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../styles/ThemeToggle';
import BrandHeader from './BrandHeader';


export default function PublicHeader() {
    const s = mainLayoutStyles();
    const navigate = useNavigate();
    const pathname = location.pathname;

    return (
        <Card >
            <header className={mergeClasses(s.header)} role="banner">
                <BrandHeader navigateTo="/" />

                <TabList selectedValue={pathname} className={mergeClasses(s.flexRowFit, s.largeGap)} onTabSelect={(_, data) => navigate(data.value as string)}>
                    <Tab
                        value="/features"
                        aria-current={pathname === '/features' ? 'page' : undefined}
                    >
                        <Sparkle24Regular />
                        <a className={s.flexColFit}>Features</a>
                    </Tab>
                    <Tab
                        value="/team"
                        aria-current={pathname === '/team' ? 'page' : undefined}
                    >
                        <People24Regular />
                        <a className={s.flexColFit}>Our Team</a>
                    </Tab>
                    <Tab
                        value="/contact"
                        aria-current={pathname === '/contact' ? 'page' : undefined}
                    >
                        <Mail24Regular />
                        <a className={s.flexColFit}>Contact Us</a>
                    </Tab>
                </TabList>

                <a className={mergeClasses(s.flexRowFit, s.alignCenter, s.gap, s.pointer)}>
                    <ThemeToggle />
                    <Button appearance="primary" onClick={() => navigate("/login")}>Log In</Button>
                </a>
            </header>
        </Card >
    );
}
