import { Outlet } from 'react-router'
import NavigationHeader from '../components/headers/NavigationHeader'
import Sidebar from '../components/sidebar/Sidebar'
import StatsHeader from '../components/headers/StatsHeader'

export default function UserLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Left column: Sidebar */}
            <aside style={{ flex: '0 0 320px' }}>
                <Sidebar />
            </aside>

            {/* Right column: header(s) and content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header>
                    <NavigationHeader />
                    <StatsHeader />
                </header>
                <section style={{ flex: 1, padding: '24px' }}>
                    <Outlet />
                </section>
            </main>
        </div>
    )
}
