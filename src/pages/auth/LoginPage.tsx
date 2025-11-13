
import { Card, Text } from '@fluentui/react-components';
import Login from '../../components/auth/Login';
import { useLoginPageStyle } from '../../components/styles/Styles';
import loginImg from '../../assets/login.png';

export default function LoginPage() {
    const styles = useLoginPageStyle();

    return (
        <div className={styles.layoutContainer}>

            <Login />

            <div className={styles.right}>
                <Card>
                    <div className={styles.cardTitleContainer}>
                        <Text className={styles.eyebrow}>Why guess project tasks if you can see</Text>
                        <h1 className={styles.title}>Flow of the Board</h1>
                    </div>
                    <img
                        src={loginImg}
                        alt="Flowboard Home"
                        className={styles.image}
                    />
                </Card>
            </div>
        </div>
    );
}
