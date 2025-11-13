import { Route, Routes } from "react-router";
import PublicLayout from "../layout/PublicLayout";
import CreateProjectPage from "../pages/project/CreateProjectPage";
import KanbanPage from "../pages/project/KanbanPage";
import ProjectPage from "../pages/project/ProjectPage";
import TaskListPage from "../pages/project/TaskListPage";

import NotFound from "../components/home/NotFound";
import MyTasks from "../components/tables/MyTasks";
import UserLayout from "../layout/UserLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import Landing from "../pages/landing/Landing";
import MyProfile from "../pages/user/MyProfile";


const Features = () => <div>Features Page</div>;
const Team = () => <div>Team Page</div>;
const Contact = () => <div>Contact Page</div>;

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>

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

            {/* User routes */}
            <Route path="/home" element={<UserLayout />}>
                {/* My Tasks*/}
                <Route index element={<MyTasks />} />
                <Route path="profile" element={<MyProfile />} />

                {/* Project routes - TODO: Replace 'project' with actual project name/ID in future */}
                <Route path="project">
                    {/* Index: Project View Page */}
                    <Route index element={<ProjectPage />} />
                    {/* Create Project Page */}
                    <Route path="create" element={<CreateProjectPage />} />
                    {/* Kanban Page */}
                    <Route path="kanban" element={<KanbanPage />} />
                    {/* Task List Page */}
                    <Route path="tasks" element={<TaskListPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}
