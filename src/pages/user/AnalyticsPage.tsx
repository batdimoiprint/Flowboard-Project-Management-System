import { useState, useEffect } from 'react';
import { Card, Text, mergeClasses, tokens } from '@fluentui/react-components';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { analyticsApi, type AnalyticsSummary, type ProjectStats } from '../../components/apis/analytics';
import StatCard, { StatCardSkeleton } from '../../components/analytics/StatCard';
import {
    FolderRegular,
    TaskListSquareLtrRegular,
    CheckmarkCircleRegular,
    ClockRegular,
    ErrorCircleRegular,
    PeopleRegular,
} from '@fluentui/react-icons';
import { DonutChart, VerticalBarChart } from '@fluentui/react-charting';
import type { TaskProgress } from '../../components/apis/analytics';
import { useParams } from 'react-router-dom';
import { projectsApi } from '../../components/apis/projects';

export default function AnalyticsPage() {
    const styles = mainLayoutStyles();
    const { projectName } = useParams<{ projectName: string }>();
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
    const [myProgress, setMyProgress] = useState<TaskProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isProjectView = !!projectName;

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                if (isProjectView && projectName) {
                    // Project-specific analytics
                    const decodedName = decodeURIComponent(projectName).replace(/-/g, ' ');
                    const projects = await projectsApi.getProjectsAsMember();
                    const project = projects.find(p => p.projectName.toLowerCase() === decodedName.toLowerCase());

                    if (!project) {
                        setError('Project not found');
                        setLoading(false);
                        return;
                    }

                    const stats = await analyticsApi.getProjectStats(project.id);
                    setProjectStats(stats);
                } else {
                    // Global analytics
                    const [summaryData, progressData] = await Promise.all([
                        analyticsApi.getSummary(),
                        analyticsApi.getMyProgress()
                    ]);
                    setSummary(summaryData);
                    setMyProgress(progressData);
                }
            } catch (err) {
                console.error('Failed to load analytics:', err);
                setError(err instanceof Error ? err.message : 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [projectName, isProjectView]);

    return (
        <div className={mergeClasses(styles.flexColFill, styles.hFull, styles.wFull)} style={{ minHeight: '70vh', overflow: 'auto' }}>
            <Card
                className={mergeClasses(styles.artifCard, styles.flexColFill, styles.hFull, styles.wFull, styles.componentBorder)}
                style={{ height: '100%', maxHeight: '100%', padding: tokens.spacingVerticalXL, overflow: 'auto' }}
            >
                <div className={mergeClasses(styles.flexColFit, styles.gap)} style={{ overflow: 'auto' }}>
                    <div className={mergeClasses(styles.flexRowFit, styles.spaceBetween)}>
                        <Text
                            style={{
                                fontSize: tokens.fontSizeBase500,
                                fontWeight: tokens.fontWeightSemibold,
                            }}
                        >
                            {isProjectView ? `${projectStats?.projectName || 'Project'} - Project Analytics` : 'Analytics Dashboard'}
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
                    ) : isProjectView && projectStats ? (
                        <>
                            {/* Project-specific analytics */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: tokens.spacingHorizontalL,
                                }}
                            >
                                <StatCard
                                    title="Team Members"
                                    value={projectStats.memberCount}
                                    icon={<PeopleRegular />}
                                    color="brand"
                                />
                                <StatCard
                                    title="Main Tasks"
                                    value={projectStats.mainTaskCount}
                                    icon={<TaskListSquareLtrRegular />}
                                    color="neutral"
                                />
                                <StatCard
                                    title="Total Tasks"
                                    value={projectStats.subTaskCount}
                                    icon={<TaskListSquareLtrRegular />}
                                    color="neutral"
                                />
                                <StatCard
                                    title="Completion Rate"
                                    value={`${Math.round(projectStats.completionRate * 100)}%`}
                                    icon={<CheckmarkCircleRegular />}
                                    color="success"
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
                                    title="Completed Tasks"
                                    value={projectStats.completedSubTasks}
                                    icon={<CheckmarkCircleRegular />}
                                    color="success"
                                />
                                <StatCard
                                    title="Remaining Tasks"
                                    value={projectStats.subTaskCount - projectStats.completedSubTasks}
                                    icon={<ClockRegular />}
                                    color="warning"
                                />
                                <StatCard
                                    title="Overdue Tasks"
                                    value={projectStats.overdueSubTasks}
                                    icon={<ErrorCircleRegular />}
                                    color="danger"
                                />
                            </div>

                            {/* Task Status & Completion Combined Card */}
                            <div style={{ marginTop: tokens.spacingVerticalXXL }}>
                                <Card
                                    className={styles.artifCard}
                                    style={{
                                        padding: tokens.spacingVerticalXL,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: tokens.fontSizeBase400,
                                            fontWeight: tokens.fontWeightSemibold,
                                            marginBottom: tokens.spacingVerticalL,
                                        }}
                                    >
                                        Task Overview
                                    </Text>
                                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXXL, flexWrap: 'wrap' }}>
                                        {/* Completion Rate Donut */}
                                        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                                            <Text
                                                style={{
                                                    fontSize: tokens.fontSizeBase300,
                                                    fontWeight: tokens.fontWeightSemibold,
                                                    marginBottom: tokens.spacingVerticalM,
                                                    display: 'block',
                                                }}
                                            >
                                                Completion Rate
                                            </Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalL }}>
                                                <DonutChart
                                                    data={{
                                                        chartTitle: 'Completion',
                                                        chartData: [
                                                            {
                                                                legend: 'Completed',
                                                                data: projectStats.completedSubTasks,
                                                                color: tokens.colorPaletteGreenBackground3,
                                                            },
                                                            {
                                                                legend: 'Remaining',
                                                                data: projectStats.subTaskCount - projectStats.completedSubTasks,
                                                                color: tokens.colorNeutralBackground5,
                                                            },
                                                        ],
                                                    }}
                                                    innerRadius={60}
                                                    valueInsideDonut={`${Math.round(projectStats.completionRate * 100)}%`}
                                                    hideLabels={true}
                                                    styles={{
                                                        root: { maxWidth: '250px' },
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ marginBottom: tokens.spacingVerticalM }}>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            Total Tasks
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: 'block' }}>
                                                            {projectStats.subTaskCount}
                                                        </Text>
                                                    </div>
                                                    <div style={{ marginBottom: tokens.spacingVerticalM }}>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            Completed
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteGreenForeground1, display: 'block' }}>
                                                            {projectStats.completedSubTasks}
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            Overdue
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteRedForeground1, display: 'block' }}>
                                                            {projectStats.overdueSubTasks}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Distribution Donut */}
                                        {Object.keys(projectStats.tasksByStatus).length > 0 && (
                                            <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                                                <Text
                                                    style={{
                                                        fontSize: tokens.fontSizeBase300,
                                                        fontWeight: tokens.fontWeightSemibold,
                                                        marginBottom: tokens.spacingVerticalM,
                                                        display: 'block',
                                                    }}
                                                >
                                                    Tasks by Status
                                                </Text>
                                                <DonutChart
                                                    data={{
                                                        chartTitle: 'Status',
                                                        chartData: Object.entries(projectStats.tasksByStatus).map(([status, count]) => ({
                                                            legend: status,
                                                            data: count,
                                                            color: status.toLowerCase() === 'done' || status.toLowerCase() === 'completed'
                                                                ? tokens.colorPaletteGreenBackground3
                                                                : status.toLowerCase() === 'in progress'
                                                                    ? tokens.colorPaletteBlueBorderActive
                                                                    : status.toLowerCase() === 'blocked'
                                                                        ? tokens.colorPaletteRedBackground3
                                                                        : tokens.colorNeutralBackground5,
                                                        })),
                                                    }}
                                                    innerRadius={60}
                                                    valueInsideDonut={`${projectStats.subTaskCount}`}
                                                    hideLabels={false}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Priority Distribution */}
                            {Object.keys(projectStats.tasksByPriority).length > 0 && (
                                <div style={{ marginTop: tokens.spacingVerticalXXL }}>
                                    <Card
                                        className={styles.artifCard}
                                        style={{
                                            padding: tokens.spacingVerticalXL,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: tokens.fontSizeBase400,
                                                fontWeight: tokens.fontWeightSemibold,
                                                marginBottom: tokens.spacingVerticalL,
                                            }}
                                        >
                                            Tasks by Priority
                                        </Text>
                                        <VerticalBarChart
                                            data={Object.entries(projectStats.tasksByPriority).map(([priority, count]) => ({
                                                x: priority.charAt(0).toUpperCase() + priority.slice(1),
                                                y: count,
                                                color: priority.toLowerCase() === 'high'
                                                    ? tokens.colorPaletteRedBackground3
                                                    : priority.toLowerCase() === 'medium'
                                                        ? tokens.colorPaletteYellowBackground3
                                                        : tokens.colorPaletteGreenBackground3,
                                            }))}
                                            height={250}
                                        />
                                    </Card>
                                </div>
                            )}

                            {/* Category Distribution */}
                            {projectStats.tasksByCategory.length > 0 && (
                                <div style={{ marginTop: tokens.spacingVerticalXXL }}>
                                    <Card
                                        className={styles.artifCard}
                                        style={{
                                            padding: tokens.spacingVerticalXL,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: tokens.fontSizeBase400,
                                                fontWeight: tokens.fontWeightSemibold,
                                                marginBottom: tokens.spacingVerticalL,
                                            }}
                                        >
                                            Tasks by Category
                                        </Text>
                                        <VerticalBarChart
                                            data={projectStats.tasksByCategory.map((cat) => ({
                                                x: cat.categoryName,
                                                y: cat.totalTasks,
                                                color: tokens.colorBrandBackground,
                                            }))}
                                            height={250}
                                        />
                                    </Card>
                                </div>
                            )}
                        </>
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

                            {/* Task Status & Completion Combined Card */}
                            <div style={{ marginTop: tokens.spacingVerticalXXL }}>
                                <Card
                                    className={styles.artifCard}
                                    style={{
                                        padding: tokens.spacingVerticalXL,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: tokens.fontSizeBase400,
                                            fontWeight: tokens.fontWeightSemibold,
                                            marginBottom: tokens.spacingVerticalL,
                                        }}
                                    >
                                        Task Status & Completion Overview
                                    </Text>
                                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXXL, flexWrap: 'wrap' }}>
                                        {/* Overall Completion Donut */}
                                        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                                            <Text
                                                style={{
                                                    fontSize: tokens.fontSizeBase300,
                                                    fontWeight: tokens.fontWeightSemibold,
                                                    marginBottom: tokens.spacingVerticalM,
                                                    display: 'block',
                                                }}
                                            >
                                                Overall Completion Rate
                                            </Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalL }}>
                                                <DonutChart
                                                    data={{
                                                        chartTitle: 'Completion',
                                                        chartData: [
                                                            {
                                                                legend: 'Completed',
                                                                data: summary.tasksCompleted,
                                                                color: tokens.colorPaletteGreenBackground3,
                                                            },
                                                            {
                                                                legend: 'Remaining',
                                                                data: summary.tasksPending,
                                                                color: tokens.colorNeutralBackground5,
                                                            },
                                                        ],
                                                    }}
                                                    innerRadius={60}
                                                    valueInsideDonut={
                                                        summary.totalSubTasks > 0
                                                            ? `${Math.round((summary.tasksCompleted / summary.totalSubTasks) * 100)}%`
                                                            : '0%'
                                                    }
                                                    hideLabels={true}
                                                    styles={{
                                                        root: { maxWidth: '250px' },
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ marginBottom: tokens.spacingVerticalM }}>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            Total Tasks
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: 'block' }}>
                                                            {summary.totalSubTasks}
                                                        </Text>
                                                    </div>
                                                    <div style={{ marginBottom: tokens.spacingVerticalM }}>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            Completed
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteGreenForeground1, display: 'block' }}>
                                                            {summary.tasksCompleted}
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            Remaining
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: 'block' }}>
                                                            {summary.tasksPending}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Breakdown Donut */}
                                        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                                            <Text
                                                style={{
                                                    fontSize: tokens.fontSizeBase300,
                                                    fontWeight: tokens.fontWeightSemibold,
                                                    marginBottom: tokens.spacingVerticalM,
                                                    display: 'block',
                                                }}
                                            >
                                                Task Status Distribution
                                            </Text>
                                            <DonutChart
                                                data={{
                                                    chartTitle: 'Status',
                                                    chartData: [
                                                        {
                                                            legend: 'Completed',
                                                            data: summary.tasksCompleted,
                                                            color: tokens.colorPaletteGreenBackground3,
                                                        },
                                                        {
                                                            legend: 'In Progress',
                                                            data: summary.tasksInProgress,
                                                            color: tokens.colorPaletteBlueBorderActive,
                                                        },
                                                        {
                                                            legend: 'To Do',
                                                            data: summary.tasksToDo,
                                                            color: tokens.colorNeutralBackground5,
                                                        },
                                                        {
                                                            legend: 'Blocked',
                                                            data: summary.tasksBlocked,
                                                            color: tokens.colorPaletteRedBackground3,
                                                        },
                                                        {
                                                            legend: 'Overdue',
                                                            data: summary.tasksOverdue,
                                                            color: tokens.colorPaletteRedForeground1,
                                                        },
                                                    ].filter(item => item.data > 0),
                                                }}
                                                innerRadius={60}
                                                valueInsideDonut={`${summary.totalSubTasks}`}
                                                hideLabels={false}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* My Task Progress Section */}
                            {myProgress && myProgress.totalTasks > 0 && (
                                <>
                                    <div style={{ marginTop: tokens.spacingVerticalXXL }}>
                                        <Text
                                            style={{
                                                fontSize: tokens.fontSizeBase500,
                                                fontWeight: tokens.fontWeightSemibold,
                                                marginBottom: tokens.spacingVerticalM,
                                                display: 'block',
                                            }}
                                        >
                                            My Task Progress
                                        </Text>
                                    </div>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                                            gap: tokens.spacingHorizontalL,
                                        }}
                                    >
                                        {/* My Progress Overview */}
                                        <Card
                                            className={styles.artifCard}
                                            style={{
                                                padding: tokens.spacingVerticalXL,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: tokens.spacingVerticalL,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: tokens.fontSizeBase400,
                                                    fontWeight: tokens.fontWeightSemibold,
                                                }}
                                            >
                                                My Task Completion
                                            </Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXL }}>
                                                <DonutChart
                                                    data={{
                                                        chartTitle: 'My Tasks',
                                                        chartData: [
                                                            {
                                                                legend: 'Completed',
                                                                data: myProgress.completedTasks,
                                                                color: tokens.colorPaletteGreenBackground3,
                                                            },
                                                            {
                                                                legend: 'Remaining',
                                                                data: myProgress.remainingTasks,
                                                                color: tokens.colorNeutralBackground5,
                                                            },
                                                        ],
                                                    }}
                                                    innerRadius={60}
                                                    valueInsideDonut={`${Math.round(myProgress.completionPercentage)}%`}
                                                    hideLabels={true}
                                                    styles={{ root: { maxWidth: '250px' } }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                                                        <div>
                                                            <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                                Total Assigned
                                                            </Text>
                                                            <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: 'block' }}>
                                                                {myProgress.totalTasks}
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                                Completed
                                                            </Text>
                                                            <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteGreenForeground1, display: 'block' }}>
                                                                {myProgress.completedTasks}
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                                Remaining
                                                            </Text>
                                                            <Text style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: 'block' }}>
                                                                {myProgress.remainingTasks}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Status Breakdown */}
                                        <Card
                                            className={styles.artifCard}
                                            style={{
                                                padding: tokens.spacingVerticalXL,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: tokens.spacingVerticalL,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: tokens.fontSizeBase400,
                                                    fontWeight: tokens.fontWeightSemibold,
                                                }}
                                            >
                                                My Tasks by Status
                                            </Text>
                                            <VerticalBarChart
                                                data={Object.entries(myProgress.statusBreakdown).map(([status, count]) => ({
                                                    x: status,
                                                    y: count,
                                                    color: status.toLowerCase() === 'done' || status.toLowerCase() === 'completed'
                                                        ? tokens.colorPaletteGreenBackground3
                                                        : status.toLowerCase() === 'in progress'
                                                            ? tokens.colorPaletteBlueBorderActive
                                                            : status.toLowerCase() === 'blocked'
                                                                ? tokens.colorPaletteRedBackground3
                                                                : tokens.colorNeutralBackground5,
                                                }))}
                                                height={200}
                                            />
                                        </Card>

                                        {/* Quick Stats Grid */}
                                        <Card
                                            className={styles.artifCard}
                                            style={{
                                                padding: tokens.spacingVerticalXL,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: tokens.spacingVerticalM,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: tokens.fontSizeBase400,
                                                    fontWeight: tokens.fontWeightSemibold,
                                                    marginBottom: tokens.spacingVerticalS,
                                                }}
                                            >
                                                Task Status Summary
                                            </Text>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingVerticalL }}>
                                                <div>
                                                    <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                        In Progress
                                                    </Text>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacingHorizontalXS }}>
                                                        <Text style={{ fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteBlueForeground2 }}>
                                                            {myProgress.inProgressTasks}
                                                        </Text>
                                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                            ({Math.round(myProgress.inProgressPercentage)}%)
                                                        </Text>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                        To Do
                                                    </Text>
                                                    <Text style={{ fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightSemibold, display: 'block' }}>
                                                        {myProgress.toDoTasks}
                                                    </Text>
                                                </div>
                                                <div>
                                                    <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                        Blocked
                                                    </Text>
                                                    <Text style={{ fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteRedForeground1, display: 'block' }}>
                                                        {myProgress.blockedTasks}
                                                    </Text>
                                                </div>
                                                <div>
                                                    <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                                        Overdue
                                                    </Text>
                                                    <Text style={{ fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteRedForeground1, display: 'block' }}>
                                                        {myProgress.overdueTasks}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </>
                    ) : null}
                </div>
            </Card>
        </div>
    );
}
