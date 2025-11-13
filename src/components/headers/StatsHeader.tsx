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
    return (
        <div className={className ?? styles.statsRow}>
            <div className={styles.statItem}>
                <Checkmark24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span className={styles.statNumber}>{totalTasks}</span>
                <span className={styles.statLabel}>Total Tasks</span>
            </div>
            <div className={styles.statItem}>
                <HourglassHalf24Regular style={{ color: '#288BE6' }} />
                <span className={styles.statNumber}>{pending}</span>
                <span className={styles.statLabel}>Pendings</span>
            </div>
            <div className={styles.statItem}>
                <Timer24Regular style={{ color: '#E87C1E' }} />
                <span className={styles.statNumber}>{ongoing}</span>
                <span className={styles.statLabel}>Ongoing</span>
            </div>
            <div className={styles.statItem}>
                <TextboxCheckmark24Regular style={{ color: '#1A8F3A' }} />
                <span className={styles.statNumber}>{completed}</span>
                <span className={styles.statLabel}>Completed</span>
            </div>
        </div>
    );
}
