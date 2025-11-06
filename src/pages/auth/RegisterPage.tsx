import { Card } from '@fluentui/react-components'
import Register from '../../components/auth/Register'
import useAuthStyles from '../../components/styles/AuthStyles'

export default function RegisterPage() {
    const styles = useAuthStyles();

    return (
        <div className={styles.root}>
            <div className={styles.left}>
                <Register />
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
