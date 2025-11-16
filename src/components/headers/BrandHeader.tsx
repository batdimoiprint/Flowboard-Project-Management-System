import { mergeClasses } from '@fluentui/react-components'
import logo from '../../assets/logo.webp';
import { mainLayoutStyles } from '../styles/Styles';
import { useNavigate } from 'react-router';

export default function BrandHeader({ navigateTo }: { navigateTo: string }) {
    const s = mainLayoutStyles();
    const navigate = useNavigate();
    return (

        <a className={mergeClasses(s.flexRowFit, s.alignCenter, s.gap, s.pointer)} onClick={() => navigate(`${navigateTo}`)}>

            <img src={logo} className={s.logoIcon} alt="FlowBoard" />

            <span className={s.brand}>FlowBoard</span>
        </a>
    )
}
