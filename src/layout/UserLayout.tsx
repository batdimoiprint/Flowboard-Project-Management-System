import { Outlet } from "react-router";

import NavigationHeader from "../components/headers/NavigationHeader";
import Sidebar from "../components/sidebar/Sidebar";
import StatsHeader from "../components/headers/StatsHeader";
import HomeHeader from "../components/headers/HomeHeader";
import { userLayoutStyles } from "../components/styles/Styles";
import { useLocation } from "react-router-dom";


export default function UserLayout() {
    const styles = userLayoutStyles();
    const location = useLocation();
    const isHome =
        location.pathname === "/home" || location.pathname === "/home/";
    const isProfile =
        location.pathname === "/home/profile" ||
        location.pathname === "/home/profile/";

    return (
        <div className={styles.layoutContainer}>
            {/* Left column: Sidebar */}
            <Sidebar />

            {/* Right column: header(s) and content */}
            <main className={styles.mainContent}>
                {!isProfile && (
                    <div className={styles.header}>
                        {isHome ? (
                            <HomeHeader />
                        ) : (<>

                            <NavigationHeader />


                            <StatsHeader />

                        </>
                        )}
                    </div>
                )
                }
                <section className={styles.sectionContent}>
                    <Outlet />
                </section>
            </main >
        </div >
    );
}
