import { Card, Text } from '@fluentui/react-components'
import Register from '../../components/auth/Register'
import { useRegisterPageStyle } from '../../components/styles/Styles'
import registerImg from '../../assets/register.png';

export default function RegisterPage() {
    const styles = useRegisterPageStyle();

    return (
        <div className={styles.layoutContainer}>

            <Register />

            <div className={styles.right}>
                <Card className={styles.card}>
                    <div className={styles.cardTitleContainer}>
                        <Text className={styles.eyebrow}>Why guess project tasks if you can see</Text>
                        <h1 className={styles.title}>Flow of the Board</h1>
                    </div>
                    <img
                        src={registerImg}
                        alt="Flowboard Logo"
                        className={styles.image}
                    />
                </Card>
            </div>
        </div>
    )
}
