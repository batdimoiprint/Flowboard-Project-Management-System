import PublicHeader from '../components/headers/PublicHeader'
import { Outlet } from 'react-router'

export default function PublicLayout() {

    return (
        <>
            <PublicHeader />
            <Outlet />

        </>
    )
}
