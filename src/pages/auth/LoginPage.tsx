import { Card } from '@fluentui/react-components'
import Login from '../../components/auth/Login'
import useAuthStyles from '../../components/styles/AuthStyles'

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
                        src="/flowboard.svg"
                        alt="Flowboard Logo"
                        className={styles.image}
                    />
                </Card>
            </div>
        </div>
    )
}
