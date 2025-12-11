import { Card, Text } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import sean from '../../assets/images/sean.png';
import reyes from '../../assets/images/reyes.jpg';
import boborol from '../../assets/images/boborol.jpg';
import jumuad from '../../assets/images/jumuad.jpg';
import laurencio from '../../assets/images/laurencio.jpg';
import alejo from '../../assets/images/alejo.jpg';
import ako from '../../assets/images/ako.jpg';
import balili from '../../assets/images/balili.jpg';
import suico from '../../assets/images/suico.jpg';

export default function TeamSection() {
    const styles = mainLayoutStyles();

    // Team member data
    const teamMembers = [
        { name: "Sean Andrei Tagle", role: "Project Manager", image: sean },
        { name: "Kenny Reyes", role: "Full Stack Developer", image: reyes },
        { name: "Marcel Angelo B. Boborol", role: "Backend Developer", image: boborol },
        { name: "Samie Jumuad", role: "Backend Developer", image: jumuad },
        { name: "Julianna Laurencio", role: "Backend Developer", image: laurencio },
        { name: "Jhan Anthony Alejo", role: "Documentation Specialist", image: alejo },
        { name: "Aaron Cañada", role: "Documentation Specialist", image: ako },
        { name: "Erica Balili", role: "Documentation Specialist", image: balili },
        { name: "Wiljhon Suico", role: "Database Designer", image: suico },
    ];

    // Infinite scroll animation keyframes
    const bannerStyle: React.CSSProperties = {
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        alignItems: 'center',
        background: 'transparent',
        padding: "10px"
    };
    const scrollStyle: React.CSSProperties = {
        display: 'flex',
        animation: 'scrollBanner 30s linear infinite',
    };
    // Add keyframes in a style tag

    return (
        <section id="team" className={styles.teamSection}>
            {/* Full width label container */}
            <div className={styles.teamLabelContainer}>
                <div className={styles.teamHeaderContainer}>
                    <Text className={styles.teamTitle}>Meet the</Text>
                    <Text className={styles.teamSubtitle}>Developer Team</Text>
                </div>
            </div>
            {/* Infinite horizontal scrolling banner */}
            <style>{`
                @keyframes scrollBanner {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
            <div style={bannerStyle}>
                <div style={scrollStyle}>
                    {[...teamMembers, ...teamMembers].map((member, index) => (
                        <Card key={index} className={styles.teamCard} style={{ minWidth: 220, margin: '0 16px' }}>
                            <div className={styles.teamImageContainer}>
                                <img src={member.image} alt={member.name} className={styles.teamImage} />
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