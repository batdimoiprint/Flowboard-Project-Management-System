import { useState, useEffect } from 'react';
import { Card, Text, mergeClasses, tokens } from '@fluentui/react-components';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { analyticsApi, type AnalyticsSummary } from '../../components/apis/analytics';
import StatCard, { StatCardSkeleton } from '../../components/analytics/StatCard';
import {
    PersonRegular,
    FolderRegular,
    TaskListSquareLtrRegular,
    CheckmarkCircleRegular,
    ClockRegular,
    ErrorCircleRegular,
} from '@fluentui/react-icons';

export default function AnalyticsPage() {
    const styles = mainLayoutStyles();
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSummary();
    }, []);

    async function loadSummary() {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsApi.getSummary();
            setSummary(data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={mergeClasses(styles.flexColFill, styles.hFull, styles.wFull)} style={{ minHeight: '70vh' }}>
            <Card
                className={mergeClasses(styles.artifCard, styles.flexColFill, styles.hFull, styles.wFull)}
                style={{ height: '100%', maxHeight: '100%', padding: tokens.spacingVerticalXL }}
            >
                <div className={mergeClasses(styles.flexColFit, styles.gap)}>
                    <div className={mergeClasses(styles.flexRowFit, styles.spaceBetween)}>
                        <Text
                            style={{
                                fontSize: tokens.fontSizeBase500,
                                fontWeight: tokens.fontWeightSemibold,
                            }}
                        >
                            Analytics Dashboard
                        </Text>
                    </div>

                    {error && (
                        <div style={{ color: tokens.colorPaletteRedForeground1, padding: tokens.spacingVerticalM }}>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: tokens.spacingHorizontalL,
                            }}
                        >
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                    ) : summary ? (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: tokens.spacingHorizontalL,
                                }}
                            >
                                <StatCard
                                    title="Total Users"
                                    value={summary.totalUsers}
                                    icon={<PersonRegular />}
                                    color="brand"
                                />
                                <StatCard
                                    title="Total Projects"
                                    value={summary.totalProjects}
                                    icon={<FolderRegular />}
                                    color="brand"
                                />
                                <StatCard
                                    title="Active Projects"
                                    value={summary.activeProjects}
                                    icon={<FolderRegular />}
                                    color="success"
                                />
                                <StatCard
                                    title="Main Tasks"
                                    value={summary.totalMainTasks}
                                    icon={<TaskListSquareLtrRegular />}
                                    color="neutral"
                                />
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: tokens.spacingHorizontalL,
                                    marginTop: tokens.spacingVerticalL,
                                }}
                            >
                                <StatCard
                                    title="Total Tasks"
                                    value={summary.totalSubTasks}
                                    icon={<TaskListSquareLtrRegular />}
                                    color="neutral"
                                />
                                <StatCard
                                    title="Completed"
                                    value={summary.tasksCompleted}
                                    icon={<CheckmarkCircleRegular />}
                                    color="success"
                                />
                                <StatCard
                                    title="Pending"
                                    value={summary.tasksPending}
                                    icon={<ClockRegular />}
                                    color="warning"
                                />
                                <StatCard
                                    title="Overdue"
                                    value={summary.tasksOverdue}
                                    icon={<ErrorCircleRegular />}
                                    color="danger"
                                />
                            </div>

                            {/* Placeholder for future charts/graphs */}
                            <div style={{ marginTop: tokens.spacingVerticalXXL }}>
                                <Card
                                    className={styles.artifCard}
                                    style={{
                                        padding: tokens.spacingVerticalXL,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '200px',
                                    }}
                                >
                                    <Text style={{ color: tokens.colorNeutralForeground3 }}>
                                        Additional analytics visualizations coming soon...
                                    </Text>
                                </Card>
                            </div>
                        </>
                    ) : null}
                </div>
            </Card>
        </div>
    );
}
