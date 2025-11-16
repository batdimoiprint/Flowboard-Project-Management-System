
import PublicHeader from '../components/headers/PublicHeader';
import { Outlet } from 'react-router';
import { mainLayoutStyles } from '../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';

export default function PublicLayout() {
    const s = mainLayoutStyles();
    return (
        <main className={mergeClasses(s.publicLayout, s.layoutPadding, s.mainBackground, s.gap
        )}>

            <PublicHeader />


            <Outlet />

        </main >
    );
}
