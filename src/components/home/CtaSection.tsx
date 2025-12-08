import { Button, Text, Card, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import kanban from '../../assets/kanban.webp';
import { useNavigate } from 'react-router-dom';

export default function CtaSection() {
    const styles = mainLayoutStyles();
    const navigate = useNavigate();

    return (
        <Card className={mergeClasses(styles.componentBorder, styles.ctaSection)}>
            <img src={kanban} alt="Kanban preview" className={styles.ctaBgImage} />
            <div className={mergeClasses(styles.ctaContent, styles.alignCenter)}>
                <Text className={styles.ctaEyebrow}>Why guess project tasks if you can see</Text>
                <h1 className={styles.ctaTitle}>Flow of the Board</h1>
                <div className={mergeClasses(styles.ctaActions, styles.flexRowFit, styles.alignCenter)}>
                    <Button appearance="primary" onClick={() => navigate('/register')}>Sign Up</Button>
                </div>
            </div>
        </Card>
    );
}