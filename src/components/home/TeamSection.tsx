import { Card, Text, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';

export default function TeamSection() {
    const styles = mainLayoutStyles();

    // Team member data
    const teamMembers = [
        { name: "Sean Andrei Tagle", role: "Project Manager", image: "/public/images/sean.png" },
        { name: "Kenny Reyes", role: "Full Stack Developer", image: "/public/images/kenny.jfif" },
        { name: "Julianna Laurencio", role: "Backend Developer", image: "/public/images/laurencio.jfif" },
        { name: "Samie Jumuad", role: "Backend Developer", image: "/public/images/samie.jfif" },
        { name: "Marcel Angelo B. Boborol", role: "Backend Developer", image: "/public/images/marcel.jfif" },
        { name: "Jhan Anthony Alejo", role: "Documentation Specialist", image: "/public/images/alejo.jfif" },
        { name: "Erica Balili", role: "Documentation Specialist", image: "/public/images/balili.jfif" },
        { name: "Aaron Cañada", role: "Documentation Specialist", image: "/public/images/aaron.jfif" },
        { name: "Wiljhon Suico", role: "Database Designer", image: "/public/images/wiljohn.jfif" },
    ];

    // Animation delay classes
    const delayClasses = [
        styles.delay100,
        styles.delay200,
        styles.delay300,
        styles.delay400,
        styles.delay500,
        styles.delay600,
        styles.delay100,
        styles.delay200,
        styles.delay300,
    ];

    return (
        <section id="team" className={styles.teamSection}>
            {/* Full width label container */}
            <div className={styles.teamLabelContainer}>
                <div className={styles.teamHeaderContainer}>
                    <Text className={styles.teamTitle}>Meet the</Text>
                    <Text className={styles.teamSubtitle}>Developer Team</Text>
                </div>
            </div>

            {/* Transparent container for team cards */}
            <div className={styles.teamCardsContainer}>
                <div className={styles.teamGrid}>
                    {teamMembers.map((member, index) => (
                        <Card 
                            key={index} 
                            className={mergeClasses(
                                styles.teamCard,
                                delayClasses[index]
                            )}
                        >
                            <div className={styles.teamImageContainer}>
                                <img 
                                    src={member.image} 
                                    alt={member.name} 
                                    className={styles.teamImage} 
                                />
                            </div>
                            <div className={styles.teamInfo}>
                                <Text className={styles.teamMemberName}>{member.name}</Text>
                                <Text className={styles.teamMemberRole}>{member.role}</Text>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}