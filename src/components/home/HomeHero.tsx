import { Button, Text, Card, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import kanban from '../../assets/kanban.webp';
import { useNavigate } from 'react-router';

export default function HomeHero() {
    const styles = mainLayoutStyles();
    const navigate = useNavigate();

    return (
        <section id="home">
            <Card className={mergeClasses(styles.alignCenter, styles.flexRowFill, styles.componentBorder)}>
                <img src={kanban} alt="Kanban preview" className={styles.homeBgImage} />
                <div className={mergeClasses(styles.homeContent, styles.flexColFit, styles.alignCenter)}>
                    <Text className={styles.homeEyebrow}>Why guess project tasks if you can see</Text>
                    <h1 className={styles.homeTitle}>Flow of the Board</h1>

                    <div className={mergeClasses(styles.homeActions, styles.flexRowFit, styles.alignCenter)}>
                        <Button appearance="primary" onClick={() => navigate('/register')}>Sign Up</Button>
                    </div>
                </div>
            </Card>
        </section>
    );
}