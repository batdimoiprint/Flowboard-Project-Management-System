import { Card, makeStyles, tokens, Text, Button, Divider, typographyStyles } from '@fluentui/react-components';
import { useState } from 'react';

import logo from '../../assets/logo.webp';

const useStyles = makeStyles({
    root: {
        width: '320px',

        display: 'flex',
        flexDirection: 'column',

        height: '98vh',

    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        ...typographyStyles.title3,

    },
    logo: {
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        background: tokens.colorNeutralBackground3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        background: 'transparent',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    listItem: {
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        borderRadius: '4px',
        background: tokens.colorNeutralBackground1,
        color: tokens.colorNeutralForeground1,
        cursor: 'pointer',
    },
    activeItem: {
        background: tokens.colorNeutralBackground3,
        borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
    },
    notifications: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
        maxHeight: '160px',
        overflow: 'auto',
    },
    profile: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacingVerticalS,
        paddingTop: tokens.spacingVerticalL,
        paddingBottom: tokens.spacingVerticalL,
    },
    profileName: {
        fontWeight: '600',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    actionButton: {
        justifyContent: 'flex-start',
    }
});

export default function Sidebar() {
    const styles = useStyles();
    const [projectsOpen, setProjectsOpen] = useState(true);
    const [notifications, setNotifications] = useState<string[]>([

    ]);
    const [darkMode, setDarkMode] = useState(false);


    function readAllNotifications() {
        setNotifications([]);
    }

    return (
        <Card className={styles.root}>
            <div className={styles.header}>
                <div aria-hidden>
                    <img src={logo} alt="FlowBoard" style={{ width: '48px', height: '48px' }} />
                </div>
                <div>FlowBoard</div>
            </div>

            <div className={styles.section}>
                <Button appearance="subtle" className={styles.actionButton}>📋 My Tasks</Button>
            </div>

            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span aria-hidden>📁</span>
                        <Text>Projects List</Text>
                    </div>
                    <Button appearance="subtle" onClick={() => setProjectsOpen(!projectsOpen)}>{projectsOpen ? '˄' : '˅'}</Button>
                </div>
                {projectsOpen && (
                    <div className={styles.list}>

                    </div>
                )}
            </div>

            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span aria-hidden>🔔</span>
                        <Text>Notifications</Text>
                    </div>
                    <Button appearance="outline" size="small" onClick={readAllNotifications}>Read All</Button>
                </div>
                <div className={styles.notifications}>
                    {notifications.length === 0 ? (
                        <Text as="span" style={{ color: tokens.colorNeutralForegroundDisabled }}>No notifications</Text>
                    ) : (
                        notifications.map((n, idx) => (
                            <div key={idx} style={{ padding: '8px', background: tokens.colorNeutralBackground1, borderRadius: '4px' }}>
                                <Text weight={idx === 0 ? 'semibold' : 'regular'}>{n}</Text>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Divider />

            <div className={styles.profile}>
                <img src="/flowboard.svg" alt="avatar" style={{ width: 56, height: 56, borderRadius: '50%' }} />
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.profileName}>John Kenny Reyes</div>
                    <Text>Full Stack Vibe Coder</Text>
                </div>
            </div>

            <Divider />

            <div className={styles.actions}>
                <Button appearance="outline" className={styles.actionButton}>My Profile</Button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text>Dark Mode</Text>
                    </div>
                    <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} aria-label="dark-mode-toggle" />
                </div>
                <Button appearance="outline" className={styles.actionButton}>Sign Out</Button>
            </div>
        </Card >
    )
}
