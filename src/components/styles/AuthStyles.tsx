import { makeStyles, tokens } from '@fluentui/react-components';

const useAuthStyles = makeStyles({
    root: {
        display: 'flex',
        gap: '8px',
        height: '91vh',
        width: '100vw',

        backgroundColor: tokens.colorBrandBackground2

    },
    left: {
        flex: '0 0 30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',

        boxSizing: 'border-box',
    },
    right: {
        flex: '0 0 70%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        boxSizing: 'border-box',
    },
    card: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',

    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
    },
});

export default useAuthStyles;