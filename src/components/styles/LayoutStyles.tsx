import { makeStyles, tokens } from '@fluentui/react-components';

export const userLayoutStyles = makeStyles({
    layoutContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        minHeight: "100dvh", // full dynamic viewport height
        margin: tokens.spacingHorizontalNone, // 0
        padding: tokens.spacingHorizontalNone, // 0
        overflow: "hidden", // prevents inner scroll bleed
        backgroundColor: tokens.colorNeutralBackground2,
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100%',
        overflow: 'auto',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        height: "auto",
        margin: tokens.spacingVerticalL,
        gap: "32px"

    },
    sectionContent: {
        flex: 1,
        display: 'flex',
        width: '1',
        flexDirection: 'column',
        margin: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground2,
        minHeight: 0, // for flex children to grow
    },
});

export const publicLayoutStyles = makeStyles({
    layoutContainer: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100dvh",
        margin: tokens.spacingHorizontalNone,
        padding: tokens.spacingHorizontalNone,
        overflow: "hidden",
        backgroundColor: tokens.colorNeutralBackground2,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 'auto',
        margin: tokens.spacingVerticalL,
        gap: "auto"
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        width: "100%",
        flex: 1,
        minHeight: '100%',
        overflow: 'auto',
    },
    sectionContent: {
        flex: 1,
        display: 'flex',
        width: '1',
        flexDirection: 'column',
        margin: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground2,
        minHeight: 0,
    },
});

