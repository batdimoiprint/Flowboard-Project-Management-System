import { Card, mergeClasses, Text } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import smallfeature from '../../assets/images/smallfeature.jpg';
import kanban from '../../assets/images/kanban.jpg';
import feature from '../../assets/images/feature.jpg';
import easymanage from '../../assets/images/easymanage.jpg';
import sidebarproj from '../../assets/images/sidebarproj.jpg';
import yourjob from '../../assets/images/yourjob.jpg';
import performative from '../../assets/images/performative.jpg';

export default function FeaturesSection() {
    const styles = mainLayoutStyles();

    const smallCardDelays = [styles.delay500, styles.delay600, styles.delay100, styles.delay200];

    return (
        <section className={styles.featuresSection}>
            {/* Top rectangle */}
            <Card className={mergeClasses(styles.fullWidth, styles.topRectangle)}>
                <div className={styles.topTextContainer}>
                    <Text className={styles.featureTitle}>
                        Why choose FlowBoard? <span className={styles.featureHighlight}>You're in control</span>
                    </Text>
                </div>
                <div className={styles.topImageContainer}>
                    <img src={smallfeature} alt="Feature preview" className={styles.topImage} />
                </div>
            </Card>

            {/* Two boxes below the top rectangle */}
            <div className={mergeClasses(styles.flexRowFill, styles.boxContainer)}>
                {/* Left box */}
                <Card className={styles.leftBox}>
                    <img src={kanban} alt="Kanban preview" className={styles.leftBoxImage} />
                    <button className={styles.leftBoxButton}>Get Started</button>
                </Card>

                {/* Right box */}
                <Card className={styles.rightBox}>
                    <img src={feature} alt="Feature preview" className={styles.rightBoxImage} />
                </Card>
            </div>

            {/* Bottom rectangle */}
            <Card className={mergeClasses(styles.fullWidth, styles.bottomRectangle)}>
                <div className={styles.topTextContainer}>
                    <Text className={styles.featureTitle}>
                        Try out our <span className={styles.featureHighlight}>Feature Rich System</span>
                    </Text>
                </div>
                <div className={styles.topImageContainer}>
                    <img src={smallfeature} alt="Feature preview" className={styles.topImage} />
                </div>
            </Card>

            {/* Four containers below bottom rectangle */}
            <div className={styles.fourContainerRow}>
                {/* Easily Manage your Teams */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[0])}>
                    <Text className={styles.smallCardTitle}>Easily Manage your Teams</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src={easymanage} alt="Easily Manage your Teams" className={styles.smallCardImage} />
                    </div>
                </Card>

                {/* Sidebar for Projects */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[1])}>
                    <Text className={styles.smallCardTitle}>Sidebar for Projects</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src={sidebarproj} alt="Sidebar for Projects" className={styles.smallCardImage} />
                    </div>
                </Card>

                {/* Your Job Title says it all */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[2])}>
                    <Text className={styles.smallCardTitle}>Your Job Title says it all</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src={yourjob} alt="Your Job Title says it all" className={styles.smallCardImage} />
                    </div>
                </Card>

                {/* Performance Tasks */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[3])}>
                    <Text className={styles.smallCardTitle}>Performance Tasks</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src={performative} alt="Performance Tasks" className={styles.smallCardImage} />
                    </div>
                </Card>
            </div>
        </section>
    );
}