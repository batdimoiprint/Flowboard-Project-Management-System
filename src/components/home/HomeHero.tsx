import { Button, Text, Card } from '@fluentui/react-components';
import { useHomeHeroStyles } from '../styles/Styles';
import kanban from '../../assets/kanban.webp';
import { useNavigate } from 'react-router';




export default function HomeHero() {
    const styles = useHomeHeroStyles();
    const navigate = useNavigate();

    return (
        <Card className={styles.root}>
            <img src={kanban} alt="Kanban preview" className={styles.bgImage} />
            <div className={styles.content}>
                <Text className={styles.eyebrow}>Why guess project tasks if you can see</Text>
                <h1 className={styles.title}>Flow of the Board</h1>

                <div className={styles.actions}>
                    <Button appearance="primary" onClick={() => navigate('/register')}>Sign Up</Button>
                </div>
            </div>
        </Card >
    );
}
