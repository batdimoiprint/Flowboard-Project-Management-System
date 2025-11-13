
import { Card } from '@fluentui/react-components';
import Login from '../../components/auth/Login';
import useAuthStyles from '../../components/styles/AuthStyles';
import loginImg from '../../assets/login.png';

export default function LoginPage() {
    const styles = useAuthStyles();

    return (
        <div className={styles.root}>
            <div className={styles.left}>
                <Login />
            </div>
            <div className={styles.right}>
                <Card className={styles.card}>
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
