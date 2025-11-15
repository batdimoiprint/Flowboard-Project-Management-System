import { Card, Label, mergeClasses } from "@fluentui/react-components";
// import {
//     WeatherMoon20Filled,
//     WeatherMoon48Filled,
//     WeatherMoon48Regular,
//     WeatherSunny20Filled,
// } from "@fluentui/react-icons";
import { useState, useEffect } from "react";
import { mainLayoutStyles } from "../styles/Styles";
import StatsHeader from "./StatsHeader";
import { useUser } from "../../hooks/useUser";

interface HomeHeaderProps {
    firstName: string;
    totalTasks: number;
    pending: number;
    ongoing: number;
    completed: number;
    today: string;
    time: string;
    todayCompleted: number;
    todayTotal: number;
}

export default function HomeHeader({ totalTasks = 0, pending = 0, ongoing = 0, completed = 0, }: Partial<HomeHeaderProps> = {}) {
    const s = mainLayoutStyles();
    const userCtx = useUser();
    const firstName = userCtx?.user?.firstName || "";

    // Real-time date and time state
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);


    // const today = now.toLocaleDateString(undefined, {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long",
    //     year: undefined,
    // });
    // const time = now.toLocaleTimeString(undefined, {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     second: "2-digit",
    // });

    // Determine dark mode (night: 18:00-6:00)
    const hour = now.getHours();
    const timeHour = hour >= 18 || hour < 6;

    return (


        <Card className={mergeClasses(s.flexRowFill, s.spaceBetween)}>
            {/* Greeting */}
            <div className={mergeClasses(s.flexColFit)}>
                <Label className={s.brand}>
                    {timeHour ? "Good Evening!" : "Good Morning!"}
                </Label>
                <Label size="large" >{firstName}</Label>

            </div>
            {/* Stats Row */}
            <StatsHeader
                totalTasks={totalTasks}
                pending={pending}
                ongoing={ongoing}
                completed={completed}
                className={mergeClasses(s.flexRowFit, s.largeGap)}
            />
            {/* 
            <div className={mergeClasses(s.flexRowFit)}>

                {timeHour ? (
                    <WeatherMoon48Regular />
                ) : (
                    <WeatherSunny20Filled />
                )}
                <Label size="large" >{today + ' ' + time}</Label>
            </div> */}

        </Card>

    );
}
