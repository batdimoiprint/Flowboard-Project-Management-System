import { Card, Text, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';

export default function TeamSection() {
    const styles = mainLayoutStyles();

    // Team member data
    const teamMembers = [
        { name: "Sean Andrei Tagle", role: "Project Manager", image: "/public/images/sean.png" },
        { name: "Kenny Reyes", role: "Full Stack Developer", image: "/public/images/reyes.jpg" },
        { name: "Marcel Angelo B. Boborol", role: "Backend Developer", image: "/public/images/boborol.jpg" },
        { name: "Samie Jumuad", role: "Backend Developer", image: "/public/images/jumuad.jpg" },
        { name: "Julianna Laurencio", role: "Backend Developer", image: "/public/images/laurencio.jpg" },
        { name: "Jhan Anthony Alejo", role: "Documentation Specialist", image: "/public/images/alejo.jpg" },
        { name: "Aaron Cañada", role: "Documentation Specialist", image: "/public/images/ako.jpg" },
        { name: "Erica Balili", role: "Documentation Specialist", image: "/public/images/balili.jpg" },
        { name: "Wiljhon Suico", role: "Database Designer", image: "/public/images/suico.jpg" },
    ];

    // Animation delay classes for 3x3 grid
    const delayClasses = [
        styles.delay100,
        styles.delay200,
        styles.delay300,
        styles.delay100,
        styles.delay200,
        styles.delay300,
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

            {/* Team cards grid */}
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