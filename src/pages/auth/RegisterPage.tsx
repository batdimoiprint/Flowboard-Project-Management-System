import { Card, Label, mergeClasses } from '@fluentui/react-components'
import Register from '../../components/auth/Register'
import { mainLayoutStyles } from '../../components/styles/Styles'
import registerImg from '../../assets/register.png';

export default function RegisterPage() {
    const styles = mainLayoutStyles();

    return (
        <div className={mergeClasses(styles.flexRowFill, styles.gap)}>

            <Register />


            <Card className={mergeClasses(styles.spaceBetween)}>
                <div className={mergeClasses(styles.flexColFit, styles.layoutPadding)}>
                    <Label size='large'>Why guess project tasks if you can see</Label>
                    <Label className={styles.brandTitle}>Flow of the Board</Label>
                </div>

                <img
                    className={styles.flexColFill}
                    src={registerImg}
                    alt="Flowboard Logo"
                />
            </Card>

        </div >
    )
}
