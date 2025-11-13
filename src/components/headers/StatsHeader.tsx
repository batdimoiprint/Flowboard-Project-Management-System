import { Checkmark24Regular, HourglassHalf24Regular, Timer24Regular, TextboxCheckmark24Regular } from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import { makeStyles } from '@fluentui/react-components';

interface StatsHeaderProps {
    totalTasks: number;
    pending: number;
    ongoing: number;
    completed: number;
    className?: string;
}

const useStatsStyles = makeStyles({
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
});

export default function StatsHeader({ totalTasks, pending, ongoing, completed, className }: StatsHeaderProps) {
    const styles = useStatsStyles();
    return (
        <div className={className ?? styles.statsRow}>
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
    );
}
