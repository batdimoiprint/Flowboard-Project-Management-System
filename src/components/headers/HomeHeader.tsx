
import React from 'react';
import { tokens, makeStyles, typographyStyles, Card } from '@fluentui/react-components';
import { Checkmark24Regular, HourglassHalf24Regular, Timer24Regular, TextboxCheckmark24Regular, WeatherMoon20Filled, WeatherSunny20Filled } from '@fluentui/react-icons';

interface HomeHeaderProps {
    firstName: string;
    totalTasks: number;
    pending: number;
    ongoing: number;
    completed: number;
    today: string;
    time: string;
    todayCompleted: number;
    todayTotal: number;
}



const useStyles = makeStyles({
    header: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 'auto',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: '32px'
    },
    leftCard: {
        display: 'flex',
        flexDirection: 'row',
        background: tokens.colorNeutralBackground1,
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
    greetingCol: {
        display: 'flex',
        flexDirection: 'column',
        width: 'auto',
    },
    greetingTitle: {
        width: "100%",
        ...typographyStyles.title1
    },
    greetingName: {
        color: tokens.colorNeutralForeground3,
        fontSize: '18px',

    },
    statsRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '64px',

    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    statNumber: {
        fontWeight: 600,
        fontSize: '18px',
    },
    statLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: '16px',

    },
    rightCard: {
        display: 'flex',
        flexDirection: 'row',
        background: tokens.colorNeutralBackground1,
        alignItems: 'center',
        minWidth: 0,

    },
    dateCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 0,

    },
    dateTitle: {
        fontSize: '28px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    moonIcon: {
        fontSize: '28px',

    },
    dateTime: {
        color: tokens.colorNeutralForeground3,
        fontSize: '16px',

    },
    todayCol: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        minWidth: 0,
    },
    todayCount: {
        fontSize: '28px',
        fontWeight: 600,
    },
    todayLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: '16px',
    },
});


export default function HomeHeader({
    firstName = 'John Kenny',
    totalTasks = 41,
    pending = 24,
    ongoing = 32,
    completed = 41,
    todayCompleted = 0,
    todayTotal = 21,
}: Partial<HomeHeaderProps> = {}) {
    const styles = useStyles();

    // Real-time date and time state
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Format date and time
    const today = now.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: undefined,
    });
    const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Determine dark mode (night: 18:00-6:00)
    const hour = now.getHours();
    const darkMode = hour >= 18 || hour < 6;

    return (<>
        {/* Left Card */}
        <Card className={styles.leftCard}>
            {/* Greeting */}
            <div className={styles.greetingCol}>
                <span className={styles.greetingTitle}>{darkMode ? 'Good Evening!' : 'Good Morning!'}</span>
                <span className={styles.greetingName}>{firstName}</span>
            </div>
            {/* Stats Row */}
            <div className={styles.statsRow}>
                {/* Total Tasks */}
                <div className={styles.statItem}>
                    <Checkmark24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <span className={styles.statNumber}>{totalTasks}</span>
                    <span className={styles.statLabel}>Total Tasks</span>
                </div>
                {/* Pending */}
                <div className={styles.statItem}>
                    <HourglassHalf24Regular style={{ color: '#288BE6' }} />
                    <span className={styles.statNumber}>{pending}</span>
                    <span className={styles.statLabel}>Pendings</span>
                </div>
                {/* Ongoing */}
                <div className={styles.statItem}>
                    <Timer24Regular style={{ color: '#E87C1E' }} />
                    <span className={styles.statNumber}>{ongoing}</span>
                    <span className={styles.statLabel}>Ongoing</span>
                </div>
                {/* Completed */}
                <div className={styles.statItem}>
                    <TextboxCheckmark24Regular style={{ color: '#1A8F3A' }} />
                    <span className={styles.statNumber}>{completed}</span>
                    <span className={styles.statLabel}>Completed</span>
                </div>
            </div>
        </Card>
        {/* Right Card */}
        <Card className={styles.rightCard}>
            {/* Date and Time */}
            {darkMode ? <WeatherMoon20Filled className={styles.moonIcon} /> : <WeatherSunny20Filled className={styles.moonIcon} />}
            <div className={styles.dateCol}>

                <span className={styles.dateTitle}>

                    {today}
                </span>
                <span className={styles.dateTime}>{time}</span>
            </div>
            {/* Today's Tasks Completed */}
            <div className={styles.todayCol}>
                <span className={styles.todayCount}>{todayCompleted} out of {todayTotal}</span>
                <span className={styles.todayLabel}>today's tasks completed</span>
            </div>
        </Card>
    </>);
}
