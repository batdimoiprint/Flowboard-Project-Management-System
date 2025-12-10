import { Text, mergeClasses } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { useTheme } from '../../context/themeContext'; // Adjust the path to your theme context

export default function Footer() {
    const styles = mainLayoutStyles();
    const { darkMode } = useTheme(); // Get current theme mode

    return (
        <footer className={mergeClasses(styles.footer, styles.teamLabelContainer)}>
            <div className={styles.footerLinks}>
                {/* Terms and Conditions */}
                <a href="#" className={styles.footerLink}>
                    <img 
                        src="/public/images/homeicon.png" 
                        alt="Icon" 
                        className={mergeClasses(styles.footerIcon, darkMode && styles.footerIconDark)}
                    />
                    <Text className={styles.footerLinkText}>Terms and Conditions</Text>
                </a>

                {/* Privacy Policy */}
                <a href="#" className={styles.footerLink}>
                    <img 
                        src="/public/images/privacy.png" 
                        alt="Icon" 
                        className={mergeClasses(styles.footerIcon, darkMode && styles.footerIconDark)}
                    />
                    <Text className={styles.footerLinkText}>Privacy Policy</Text>
                </a>

                {/* Cookie Policy */}
                <a href="#" className={styles.footerLink}>
                    <img 
                        src="/public/images/cookie.png" 
                        alt="Icon" 
                        className={mergeClasses(styles.footerIcon, darkMode && styles.footerIconDark)}
                    />
                    <Text className={styles.footerLinkText}>Cookie Policy</Text>
                </a>

                {/* About */}
                <a href="#" className={styles.footerLink}>
                    <img 
                        src="/public/images/about.png" 
                        alt="Icon" 
                        className={mergeClasses(styles.footerIcon, darkMode && styles.footerIconDark)}
                    />
                    <Text className={styles.footerLinkText}>About</Text>
                </a>

                {/* FAQ */}
                <a href="#" className={styles.footerLink}>
                    <img 
                        src="/public/images/faqu.png" 
                        alt="Icon" 
                        className={mergeClasses(styles.footerIcon, darkMode && styles.footerIconDark)}
                    />
                    <Text className={styles.footerLinkText}>FAQ</Text>
                </a>
            </div>
        </footer>
    );
}