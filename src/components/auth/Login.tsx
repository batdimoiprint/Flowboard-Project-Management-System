import { useState } from 'react';
import { Button, Input, Label, tokens, Card, Text } from '@fluentui/react-components';
import { PersonRegular, LockClosedRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { mainLayoutStyles } from '../styles/Styles';
import { authApi } from '../apis/auth';
import { useUser } from '../../hooks/useUser';
import type { LoginRequest } from '../apis/auth';

export default function Login() {
    const styles = mainLayoutStyles();
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
        <Card style={{ 
            width: '100%',
            maxWidth: '520px', 
            margin: '0 auto', 
            padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXXL}` 
        }}>
            {/* Header - Visual Hierarchy (HCI Principle) */}
            <div style={{ marginBottom: tokens.spacingVerticalXXL, textAlign: 'center' }}>
                <Text size={800} weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM }}>
                    Welcome back
                </Text>
                <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
                    Sign in to continue to Flowboard
                </Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Adequate spacing for readability and reduced cognitive load */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }}>
                    <div className={styles.formField}>
                        <Label htmlFor="userNameOrEmail" required size="medium" style={{ marginBottom: tokens.spacingVerticalXS }}>
                            Username or Email
                        </Label>
                        <Input
                            id="userNameOrEmail"
                            type="text"
                            placeholder="Enter your username or email"
                            autoComplete="username"
                            size="large"
                            contentBefore={<PersonRegular />}
                            style={{ width: '100%' }}
                            {...register('userNameOrEmail', { required: 'Username or Email is required' })}
                        />
                        {errors.userNameOrEmail && (
                            <Text className={styles.errorText} style={{ marginTop: tokens.spacingVerticalXS }}>
                                {errors.userNameOrEmail.message}
                            </Text>
                        )}
                    </div>

                    <div className={styles.formField}>
                        <Label htmlFor="password" required size="medium" style={{ marginBottom: tokens.spacingVerticalXS }}>
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            size="large"
                            contentBefore={<LockClosedRegular />}
                            style={{ width: '100%' }}
                            {...register('password', { required: 'Password is required' })}
                        />
                        {errors.password && (
                            <Text className={styles.errorText} style={{ marginTop: tokens.spacingVerticalXS }}>
                                {errors.password.message}
                            </Text>
                        )}
                    </div>

                    {formError && (
                        <Text className={styles.errorText} style={{ display: 'block', textAlign: 'center' }}>
                            {formError}
                        </Text>
                    )}

                    {/* Fitts's Law - Large clickable target for primary action */}
                    <Button 
                        appearance="primary" 
                        type="submit" 
                        size="large" 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            marginTop: tokens.spacingVerticalM,
                            padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </div>
            </form>

            {/* Footer - Clear visual separation and secondary action */}
            <div style={{ 
                marginTop: tokens.spacingVerticalXXL,
                paddingTop: tokens.spacingVerticalL,
                borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacingHorizontalXS
            }}>
                <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
                    Don't have an account?
                </Text>
                <Button 
                    appearance="transparent" 
                    size="medium"
                    onClick={() => navigate('/register')}
                    type="button"
                    style={{ padding: `0 ${tokens.spacingHorizontalXS}`, minWidth: 'auto', fontWeight: 600 }}
                >
                    Create one
                </Button>
            </div>
        </Card>
    );
}
