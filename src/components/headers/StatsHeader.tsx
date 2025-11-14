import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Checkmark24Regular, HourglassHalf24Regular, Timer24Regular, TextboxCheckmark24Regular } from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import { useStatsStyles } from '../styles/Styles';

interface StatsHeaderProps {
    totalTasks?: number;
    pending?: number;
    ongoing?: number;
    completed?: number;
    className?: string;
}

export default function StatsHeader({
    totalTasks = 0,
    pending = 0,
    ongoing = 0,
    completed = 0,
    className,
}: StatsHeaderProps) {
    const styles = useStatsStyles();
    const location = useLocation();

    const rawSegments = location.pathname.split('/').filter(Boolean);
    const segments = rawSegments[0] === 'home' ? rawSegments.slice(1) : rawSegments;
    const projectSlug = segments[0] === 'project' ? segments[1] ?? '' : '';

    const derivedStats = useMemo(() => {
        if (!projectSlug) {
            return { totalTasks, pending, ongoing, completed };
        }

        const numericSeed = projectSlug
            .toLowerCase()
            .split('')
            .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

        const generatedTotal = 25 + (numericSeed % 40);
        const generatedPending = (numericSeed % 7) + 3;
        const generatedOngoing = ((numericSeed >> 3) % 10) + 2;
        const generatedCompleted = Math.max(generatedTotal - generatedPending - generatedOngoing, 0);

        return {
            totalTasks: generatedTotal,
            pending: generatedPending,
            ongoing: generatedOngoing,
            completed: generatedCompleted,
        };
    }, [projectSlug, totalTasks, pending, ongoing, completed]);

    const stats = projectSlug
        ? derivedStats
        : { totalTasks, pending, ongoing, completed };
    return (
        <div className={className ?? styles.statsRow}>
            <div className={styles.statItem}>
                <Checkmark24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span className={styles.statNumber}>{stats.totalTasks}</span>
                <span className={styles.statLabel}>Total Tasks</span>
            </div>
            <div className={styles.statItem}>
                <HourglassHalf24Regular style={{ color: '#288BE6' }} />
                <span className={styles.statNumber}>{stats.pending}</span>
                <span className={styles.statLabel}>Pendings</span>
            </div>
            <div className={styles.statItem}>
                <Timer24Regular style={{ color: '#E87C1E' }} />
                <span className={styles.statNumber}>{stats.ongoing}</span>
                <span className={styles.statLabel}>Ongoing</span>
            </div>
            <div className={styles.statItem}>
                <TextboxCheckmark24Regular style={{ color: '#1A8F3A' }} />
                <span className={styles.statNumber}>{stats.completed}</span>
                <span className={styles.statLabel}>Completed</span>
            </div>
        </div>
    );
}
