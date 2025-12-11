import { Route, Routes } from "react-router";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { Navigate } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import CreateProjectPage from "../pages/project/CreateProjectPage";
import KanbanPage from "../pages/project/KanbanPage";
import ProjectListPage from "../pages/project/ProjectListPage";
import ProjectPage from "../pages/project/ProjectPage";
import TaskListPage from "../pages/project/TaskListPage";

import NotFound from "../components/home/NotFound";
import MyTasks from "../pages/user/MyTasks";
import UserLayout from "../layout/UserLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import Landing from "../pages/landing/Landing";
import MyProfile from "../pages/user/MyProfile";
import MemberProfile from "../pages/user/MemberProfile";
import AnalyticsPage from "../pages/user/AnalyticsPage";


const Features = () => <div>Features Page</div>;
const Team = () => <div>Team Page</div>;
const Contact = () => <div>Contact Page</div>;

import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
    const userCtx = useContext(UserContext);
    if (!userCtx?.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

export default function AppRoutes() {
    const userCtx = useContext(UserContext);
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={
                userCtx?.isAuthenticated ? <Navigate to="/home" replace /> : <PublicLayout />
            }>
                {/* Landing */}
                <Route index element={<Landing />} />
                <Route path="features" element={<Features />} />
                <Route path="team" element={<Team />} />
                <Route path="contact" element={<Contact />} />

                {/* Auths */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Protected User routes */}
            <Route path="/home" element={
                <ProtectedRoute>
                    <UserLayout />
                </ProtectedRoute>
            }>
                {/* My Tasks*/}
                <Route index element={<MyTasks />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="member" element={<MemberProfile />} />
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* Create Project Page - outside project routes */}
                <Route path="create" element={<CreateProjectPage />} />

                {/* Project routes */}
                <Route path="project">
                    {/* Index: Project List Page */}
                    <Route index element={<ProjectListPage />} />

                    {/* Dynamic project views */}
                    <Route path=":projectName">
                        {/* Default sub-view for a project: team page */}
                        <Route index element={<ProjectPage />} />

                        <Route path="kanban" element={<KanbanPage />} />
                        <Route path="tasks" element={<TaskListPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}
