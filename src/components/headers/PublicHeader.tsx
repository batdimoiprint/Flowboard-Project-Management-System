import { Button, Card, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { Sparkle24Regular, People24Regular, Mail24Regular } from '@fluentui/react-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ThemeToggle from '../styles/ThemeToggle';
import BrandHeader from './BrandHeader';
import { makeStyles, tokens } from '@fluentui/react-components';

// Custom styles for the navigation
const useNavStyles = makeStyles({
    navButton: {
        position: 'relative',
        background: 'transparent',
        border: 'none',
        color: tokens.colorNeutralForeground2,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightRegular,
        transition: 'all 0.2s ease',
        animationName: {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
        },
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
        '&:hover': {
            color: tokens.colorBrandForeground1,
            '&::after': {
                width: '100%',
                backgroundColor: tokens.colorBrandForeground1,
            }
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '0',
            height: '3px',
            backgroundColor: 'transparent',
            transition: 'all 0.3s ease',
        }
    },
    navButtonActive: {
        color: tokens.colorBrandForeground1,
        fontWeight: tokens.fontWeightSemibold,
        '&::after': {
            width: '100%',
            backgroundColor: tokens.colorBrandForeground1,
        }
    },
    navContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: tokens.spacingHorizontalXL,
        alignItems: 'center',
    }
});

export default function PublicHeader() {
    const s = mainLayoutStyles();
    const navStyles = useNavStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('features');

    // Function to handle scroll to section
    const scrollToSection = (sectionId: string) => {
        // If we're not on the landing page, navigate to it first
        if (location.pathname !== '/') {
            navigate('/');
            // Wait for navigation to complete then scroll
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                setActiveSection(sectionId);
            }, 100);
        } else {
            // We're already on landing page, just scroll
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setActiveSection(sectionId);
        }
    };

    // Handle logo click to scroll to home section
    const handleLogoClick = () => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById('home');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                setActiveSection('home');
            }, 100);
        } else {
            const element = document.getElementById('home');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setActiveSection('home');
        }
    };

    // Detect active section on scroll
    useEffect(() => {
        if (location.pathname !== '/') {
            setActiveSection('');
            return;
        }

        const handleScroll = () => {
            const sections = ['home', 'features', 'team', 'contact'];
            const scrollPosition = window.scrollY + 200; // Offset for header

            // Find which section is currently in view
            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(sectionId);
                        return;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Call once on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    return (
        <Card className={s.componentBorder}>
            <header className={mergeClasses(s.header)} role="banner">
                <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <BrandHeader navigateTo="/" />
                </div>

                <nav className={navStyles.navContainer}>
                    <button 
                        className={mergeClasses(
                            navStyles.navButton, 
                            activeSection === 'features' && navStyles.navButtonActive
                        )}
                        onClick={() => scrollToSection('features')}
                    >
                        <Sparkle24Regular />
                        Features
                    </button>
                    <button 
                        className={mergeClasses(
                            navStyles.navButton, 
                            activeSection === 'team' && navStyles.navButtonActive
                        )}
                        onClick={() => scrollToSection('team')}
                    >
                        <People24Regular />
                        Our Team
                    </button>
                    <button 
                        className={mergeClasses(
                            navStyles.navButton, 
                            activeSection === 'contact' && navStyles.navButtonActive
                        )}
                        onClick={() => scrollToSection('contact')}
                    >
                        <Mail24Regular />
                        Contact Us
                    </button>
                </nav>

                <div className={mergeClasses(s.flexRowFit, s.alignCenter, s.gap)}>
                    <ThemeToggle />
                    <Button appearance="primary" onClick={() => navigate("/login")}>Log In</Button>
                </div>
            </header>
        </Card>
    );
}