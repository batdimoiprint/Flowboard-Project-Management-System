import { useState } from 'react';

import { Button, Input, Label, tokens, Card, Text } from '@fluentui/react-components';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useAxios } from '../../hooks/useAxios';
import { useLoginForm } from '../styles/Styles';
import { useUser } from '../../context/userContext';
import type { User } from '../../context/userContext';


type LoginFormInputs = {
    email: string;
    password: string;
};

interface LoginResponse {
    message: string;
    token?: string;
    user: User;
}

export default function Login() {
    const styles = useLoginForm();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
    const { error, loading, fetchData } = useAxios<LoginResponse>();
    const [formError, setFormError] = useState('');

    const onSubmit = async (values: LoginFormInputs) => {
        setFormError('');
        const result = await fetchData('/api/auth/login', {
            method: 'POST',
            data: values,
        });
        if (result && !error) {
            // Store token in localStorage
            if (result.token) {
                localStorage.setItem('token', result.token);
            }
            // Store user data in context (which also stores in localStorage)
            setUser(result.user);
            // Redirect to home
            navigate('/home');
        } else if (error) {
            setFormError(error);
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
                {(formError || error) && (
                    <Text as="span" style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalXS }}>
                        {formError || error}
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
