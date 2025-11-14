import { Outlet } from "react-router";

import NavigationHeader from "../components/headers/NavigationHeader";
import Sidebar from "../components/sidebar/Sidebar";
import StatsHeader from "../components/headers/StatsHeader";
import HomeHeader from "../components/headers/HomeHeader";
import { userLayoutStyles } from "../components/styles/Styles";
import { useLocation } from "react-router-dom";
import { Card } from "@fluentui/react-components";
// import { Card } from "@fluentui/react-components";


export default function UserLayout() {
    const styles = userLayoutStyles();
    const location = useLocation();
    const normalizedPath = location.pathname.replace(/\/+$/, "");
    const isHome = normalizedPath === "/home";
    const isProfile = normalizedPath === "/home/profile";
    const isProjectRoot = normalizedPath === "/home/project";
    const isProjectWithName = /^\/home\/project\/[^/]+(\/.*)?$/.test(normalizedPath);

    return (
        <div className={styles.layoutContainer}>
            {/* Left column: Sidebar */}
            <Sidebar />

            {/* Right column: header(s) and content */}
            <main className={styles.mainContent}>
                {/* Do not mount the header container at all on the project list root */}
                {!isProfile && !isProjectRoot && (
                    <div className={styles.header}>
                        {isHome ? (
                            <HomeHeader />
                        ) : isProjectWithName ? (
                            <Card className={styles.header} >
                                <NavigationHeader />
                                <StatsHeader />
                            </Card>
                        ) : (
                            <>
                                <NavigationHeader />
                                <StatsHeader />
                            </>
                        )}
                    </div>
                )}
                <section className={styles.sectionContent}>
                    <Outlet />
                </section>
            </main >
        </div >
    );
}
