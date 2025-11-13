
import { Card } from '@fluentui/react-components';
import { WeatherMoon20Filled, WeatherSunny20Filled } from '@fluentui/react-icons';
import React from 'react';
import { useHomeHeaderStyles } from '../styles/Styles';
import StatsHeader from './StatsHeader';

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

export default function HomeHeader({
    firstName = 'John Kenny',
    totalTasks = 0,
    pending = 0,
    ongoing = 0,
    completed = 0,
    todayCompleted = 0,
    todayTotal = 0,
}: Partial<HomeHeaderProps> = {}) {
    const styles = useHomeHeaderStyles();

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
            <StatsHeader
                totalTasks={totalTasks}
                pending={pending}
                ongoing={ongoing}
                completed={completed}
                className={styles.statsRow}
            />
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
