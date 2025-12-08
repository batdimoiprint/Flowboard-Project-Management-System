import HomeHero from '../../components/home/HomeHero';
import FeaturesSection from '../../components/home/FeaturesSection';
import TeamSection from '../../components/home/TeamSection';
import CtaSection from '../../components/home/CtaSection';
import Footer from '../../components/home/Footer';

export default function Landing() {
    return (
        <div style={{ 
            overflowY: 'auto', 
            overflowX: 'hidden',
            height: '100vh',
            width: '100%'
        }}>
            <HomeHero />
            <div id="features">
                <FeaturesSection />
            </div>
            <div id="team">
                <TeamSection />
            </div>
            <CtaSection />
            <Footer />
        </div>
    );
}