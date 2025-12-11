import { Card, mergeClasses, Text } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';

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
                    <img src="/images/smallf.jpg" alt="Feature preview" className={styles.topImage} />
                </div>
            </Card>

            {/* Two boxes below the top rectangle */}
            <div className={mergeClasses(styles.flexRowFill, styles.boxContainer)}>
                {/* Left box */}
                <Card className={styles.leftBox}>
                    <img src="/images/kanban1.jpg" alt="Kanban preview" className={styles.leftBoxImage} />
                    <button className={styles.leftBoxButton}>Get Started</button>
                </Card>

                {/* Right box */}
                <Card className={styles.rightBox}>
                    <img src="/images/bigfeature.jpg" alt="Feature preview" className={styles.rightBoxImage} />
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
                    <img src="/images/smallfeature1.jpg" alt="Feature preview" className={styles.topImage} />
                </div>
            </Card>

            {/* Four containers below bottom rectangle */}
            <div className={styles.fourContainerRow}>
                {/* Easily Manage your Teams */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[0])}>
                    <Text className={styles.smallCardTitle}>Easily Manage your Teams</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src="/images/manage.jpg" alt="Easily Manage your Teams" className={styles.smallCardImage} />
                    </div>
                </Card>

                {/* Sidebar for Projects */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[1])}>
                    <Text className={styles.smallCardTitle}>Sidebar for Projects</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src="/images/sideproj.jpg" alt="Sidebar for Projects" className={styles.smallCardImage} />
                    </div>
                </Card>

                {/* Your Job Title says it all */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[2])}>
                    <Text className={styles.smallCardTitle}>Your Job Title says it all</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src="/images/job.jpg" alt="Your Job Title says it all" className={styles.smallCardImage} />
                    </div>
                </Card>

                {/* Performance Tasks */}
                <Card className={mergeClasses(styles.smallCard, smallCardDelays[3])}>
                    <Text className={styles.smallCardTitle}>Performance Tasks</Text>
                    <div className={styles.smallCardImageContainer}>
                        <img src="/images/performative1.jpg" alt="Performance Tasks" className={styles.smallCardImage} />
                    </div>
                </Card>
            </div>
        </section>
    );
}