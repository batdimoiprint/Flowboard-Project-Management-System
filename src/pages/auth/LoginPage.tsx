
import { Card, Label, mergeClasses } from '@fluentui/react-components';
import Login from '../../components/auth/Login';
import { mainLayoutStyles } from '../../components/styles/Styles';
import loginImg from '../../assets/login.png';

export default function LoginPage() {
    const styles = mainLayoutStyles();

    return (
        <div className={mergeClasses(styles.flexRowFill, styles.gap)}>

            <Login />


            <Card className={mergeClasses(styles.spaceBetween, styles.componentBorder)}>
                <div className={mergeClasses(
                    styles.flexColFit,
                    styles.layoutPadding)}>
                    <Label  >Why guess project tasks if you can see</Label>
                    <Label className={styles.brandTitle}>Flow of the Board</Label>
                </div>
                <img
                    src={loginImg}
                    alt="Flowboard Home"
                />
            </Card>

        </div >
    );
}
