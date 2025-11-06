import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const useRegisterStyles = makeStyles({
    root: {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        ...shorthands.gap('24px'),
        maxWidth: '800px',
        ...shorthands.margin('0', 'auto'),
        ...shorthands.padding('32px'),
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap('12px'),
        marginBottom: '8px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        margin: '0',
        color: tokens.colorNeutralForeground1,
    },
    icon: {
        fontSize: '32px',
        color: tokens.colorBrandForeground1,
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('16px'),
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: tokens.colorNeutralForeground1,
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        ...shorthands.gap('16px'),
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('4px'),
    },
    errorText: {
        color: tokens.colorPaletteRedForeground1,
        fontSize: '12px',
    },
    actions: {
        display: 'flex',
        ...shorthands.gap('12px'),
        marginTop: '8px',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
        },
    },
    primaryButton: {
        flex: '1',
    },
    secondaryButton: {
        flex: '1',
    },
});

export default useRegisterStyles;