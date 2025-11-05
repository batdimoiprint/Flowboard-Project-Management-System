
import { Button, Input, Label, makeStyles, tokens, Card, Text } from '@fluentui/react-components';
import { typographyStyles } from '@fluentui/react-components';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const useStyles = makeStyles({
    root: {
        height: '100vh',
        maxWidth: '360px',
        maxHeight: '857px',
        display: 'flex',
        flexDirection: 'column',
        padding: tokens.spacingHorizontalXXL,


    },
    title: {
        ...typographyStyles.title2,
        textAlign: 'left',
        marginBottom: tokens.spacingVerticalL,
    },

    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXXXL,
    },
    actions: {
        marginTop: tokens.spacingVerticalL,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
});

export default function Login() {
    const styles = useStyles();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // TODO: Implement authentication logic
    };

    return (
        <Card className={styles.root}>
            <h2 className={styles.title}>Sign in</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(_, data) => setEmail(data.value)}
                        required
                        placeholder="you@email.com"
                        autoComplete="email"
                    />
                </div>
                <div className={styles.field}>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(_, data) => setPassword(data.value)}
                        required
                        placeholder="Password"
                        autoComplete="current-password"
                    />
                </div>
                {error && (
                    <Text as="span" style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalXS }}>{error}</Text>
                )}
                <div className={styles.actions}>
                    <Button appearance="primary" type="submit" size="large">Sign In</Button>
                    <Button appearance="outline" size="large" onClick={() => { navigate("/register") }} >Create Account</Button>
                </div>
            </form>
        </Card>
    );
}
