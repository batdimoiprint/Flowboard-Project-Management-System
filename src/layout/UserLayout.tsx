import { Outlet } from "react-router";
import { useState } from 'react';

import NavigationHeader from "../components/headers/NavigationHeader";
import Sidebar from "../components/sidebar/Sidebar";
// import StatsHeader from "../components/headers/StatsHeader";
import HomeHeader from "../components/headers/HomeHeader";
import { mainLayoutStyles } from "../components/styles/Styles";
import { useLocation } from "react-router-dom";
import { Card, mergeClasses } from "@fluentui/react-components";
// import { Card } from "@fluentui/react-components";


export default function UserLayout() {
    const s = mainLayoutStyles();
    const [projectsRefreshCounter, setProjectsRefreshCounter] = useState<number>(0);
    const location = useLocation();
    const normalizedPath = location.pathname.replace(/\/+$/, "");
    const isHome = normalizedPath === "/home";
    const isProfile = normalizedPath === "/home/profile";
    const isProjectRoot = normalizedPath === "/home/project";
    const isProjectWithName = /^\/home\/project\/[^/]+(\/.*)?$/.test(normalizedPath);

    return (
        <main className={mergeClasses(s.userLayout,
            s.layoutPadding,
            s.mainBackground, s.gap)}>

            <Sidebar refreshSignal={projectsRefreshCounter} />


            <section className={mergeClasses(s.contentsLayout)}>

                {!isProfile && !isProjectRoot && (
                    <div className={s.largeGap}>
                        {isHome ? (
                            <HomeHeader />
                        ) : isProjectWithName ? (
                            <Card  >
                                <NavigationHeader />
                                {/* <StatsHeader /> */}
                            </Card>
                        ) : (
                            <>
                                <NavigationHeader />
                                {/* <StatsHeader /> */}
                            </>
                        )}

                    </div>
                )}
                <Outlet context={{ bumpProjects: () => setProjectsRefreshCounter((c: number) => c + 1), projectsRefreshCounter }} />
            </section >
        </main >
    );
}
