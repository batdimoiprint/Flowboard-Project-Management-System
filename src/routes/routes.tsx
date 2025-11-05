import { Route, Routes } from "react-router";
import PublicLayout from "../layout/PublicLayout";
import Home from "../pages/home/Home";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import NotFound from "../components/home/NotFound";
import UserLayout from "../layout/UserLayout";
import MyTasks from "../components/tables/MyTasks";


const Features = () => <div>Features Page</div>;
const Team = () => <div>Team Page</div>;
const Contact = () => <div>Contact Page</div>;

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>

                {/* Landing */}
                <Route index element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="team" element={<Team />} />
                <Route path="contact" element={<Contact />} />

                {/* Auths */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />




                <Route path="*" element={<NotFound />} />
            </Route>

            {/* User routes */}
            <Route path="/home" element={<UserLayout />}>

                {/* My Tasks*/}
                <Route index element={<MyTasks />} />




                <Route path="*" element={<NotFound />} />
            </Route>


        </Routes>
    )
}
