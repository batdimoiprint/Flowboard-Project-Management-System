import { Card, Text, Spinner, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { tokens } from '@fluentui/react-components';

interface StatCardProps {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    color?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
}

export default function StatCard({ title, value, icon, color = 'neutral' }: StatCardProps) {
    const styles = mainLayoutStyles();

    const colorMap = {
        brand: tokens.colorBrandForeground1,
        success: tokens.colorPaletteGreenForeground1,
        warning: tokens.colorPaletteYellowForeground1,
        danger: tokens.colorPaletteRedForeground1,
        neutral: tokens.colorNeutralForeground1,
    };

    const bgColorMap = {
        brand: tokens.colorBrandBackground2,
        success: tokens.colorPaletteGreenBackground2,
        warning: tokens.colorPaletteYellowBackground2,
        danger: tokens.colorPaletteRedBackground2,
        neutral: tokens.colorNeutralBackground2,
    };

    return (
        <Card
            className={mergeClasses(styles.artifCard)}
            style={{
                padding: tokens.spacingVerticalL,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacingVerticalM,
                minWidth: '200px',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3 }}>
                    {title}
                </Text>
                {icon && (
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: bgColorMap[color],
                            color: colorMap[color],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </div>
                )}
            </div>
            <Text
                style={{
                    fontSize: tokens.fontSizeBase600,
                    fontWeight: tokens.fontWeightBold,
                    color: colorMap[color],
                }}
            >
                {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
        </Card>
    );
}

export function StatCardSkeleton() {
    const styles = mainLayoutStyles();

    return (
        <Card
            className={mergeClasses(styles.artifCard)}
            style={{
                padding: tokens.spacingVerticalL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '200px',
                minHeight: '120px',
            }}
        >
            <Spinner size="small" />
        </Card>
    );
}
