import { useState } from 'react';
import { Button, Input, Label, tokens, Card, Text } from '@fluentui/react-components';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useLoginForm } from '../styles/Styles';
import { authApi } from '../apis/auth';
import { useUser } from '../../hooks/useUser';
import type { LoginRequest } from '../apis/auth';

export default function Login() {
    const styles = useLoginForm();
    const navigate = useNavigate();
    const { refreshUser } = useUser();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const onSubmit = async (values: LoginRequest) => {
        setFormError('');
        setLoading(true);
        
        try {
            await authApi.login(values);
            // Refresh user context with the logged-in user data
            refreshUser();
            // Redirect to home after successful login
            navigate('/home');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError('An error occurred during login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={styles.root}>
            <h2 className={styles.title}>Sign in</h2>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.field}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        autoComplete="email"
                        {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && (
                        <Text as="span" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.email.message}</Text>
                    )}
                </div>
                <div className={styles.field}>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        {...register('password', { required: 'Password is required' })}
                    />
                    {errors.password && (
                        <Text as="span" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.password.message}</Text>
                    )}
                </div>
                {formError && (
                    <Text as="span" style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalXS }}>
                        {formError}
                    </Text>
                )}
                <div className={styles.actions}>
                    <Button appearance="primary" type="submit" size="large" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <Button appearance="outline" size="large" onClick={() => { navigate("/register") }} type="button">
                        Create Account
                    </Button>
                </div>
            </form>
        </Card>
    );
}
