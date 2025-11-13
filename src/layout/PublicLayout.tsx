
import PublicHeader from '../components/headers/PublicHeader';
import { Outlet } from 'react-router';
import { publicLayoutStyles } from '../components/styles/LayoutStyles';

export default function PublicLayout() {
    const styles = publicLayoutStyles();
    return (
        <div className={styles.layoutContainer}>
            <div className={styles.header}>
                <PublicHeader />
            </div>
            <div className={styles.mainContent}>
                <Outlet />
            </div>
        </div>
    );
}
