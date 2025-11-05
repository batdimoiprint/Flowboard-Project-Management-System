import { Button, makeStyles, tokens, Text, Card } from '@fluentui/react-components';
import { typographyStyles } from '@fluentui/react-components';
import kanban from '../assets/kanban.png';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: tokens.spacingVerticalXXXL, // fallback for hero height
        paddingTop: tokens.spacingVerticalXXXL,
        paddingBottom: tokens.spacingVerticalXXXL,
        paddingLeft: tokens.spacingHorizontalXXL,
        paddingRight: tokens.spacingHorizontalXXL,
        overflow: 'hidden',
    },
    bgImage: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
        opacity: 0.30,
        pointerEvents: 'none',
    },
    content: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '700px',
        width: '100%',
        height: '50vh',
        maxHeight: '680px',
        margin: '0 auto',
        borderRadius: tokens.borderRadiusLarge,
        paddingTop: tokens.spacingVerticalXXXL,
        paddingBottom: tokens.spacingVerticalXXXL,
        paddingLeft: tokens.spacingHorizontalXXL,
        paddingRight: tokens.spacingHorizontalXXL,
    },
    eyebrow: {
        ...typographyStyles.title3,

    },
    title: {
        ...typographyStyles.display,
        color: tokens.colorBrandBackground,
        margin: 0,
        textAlign: 'center',
    },
    actions: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalL,
        justifyContent: 'center',
    },
});

export default function HomeHero() {
    const styles = useStyles();

    return (
        <Card className={styles.root}>
            <img src={kanban} alt="Kanban preview" className={styles.bgImage} />
            <div className={styles.content}>
                <Text className={styles.eyebrow}>Why guess project tasks if you can see</Text>
                <h1 className={styles.title}>Flow of the Board</h1>

                <div className={styles.actions}>
                    <Button appearance="primary">Sign Up</Button>
                </div>
            </div>
        </Card>
    );
}
