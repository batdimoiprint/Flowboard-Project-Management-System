import { Route, Routes } from "react-router";
import PublicLayout from "../layout/PublicLayout";
import Home from "../pages/home/Home";

const Features = () => <div>Features Page</div>;
const Team = () => <div>Team Page</div>;
const Contact = () => <div>Contact Page</div>;

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="team" element={<Team />} />
                <Route path="contact" element={<Contact />} />
            </Route>
        </Routes>
    )
}
