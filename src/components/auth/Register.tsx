import { useState } from 'react';
import { Button, Input, Label, Card, Text } from '@fluentui/react-components';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useRegisterForm } from '../../components/styles/Styles';
import { authApi } from '../apis/auth';
import type { RegisterRequest } from '../apis/auth';

type RegisterFormInputs = {
    userName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    contactNumber: string;
    birthDate: string;
    email: string;
    password: string;
    verifyPassword: string;
    userIMG?: string | null;
};

export default function Register() {
    const styles = useRegisterForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>({
        mode: 'onBlur',
        reValidateMode: 'onBlur'
    });

    const onSubmit = async (data: RegisterFormInputs) => {
        setFormError('');
        setLoading(true);

        const payload: RegisterRequest = {
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : '',
            userIMG: null,
        };

        try {
            await authApi.register(payload);
            navigate('/login');
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={styles.root}>
            <div className={styles.header}>

                <h1 className={styles.title}>Create an account</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Personal Information Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Personal Information</div>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Jane"
                                autoComplete="given-name"
                                {...register('firstName', {
                                    required: 'First name is required',
                                    minLength: { value: 2, message: 'First name must be at least 2 characters' },
                                    maxLength: { value: 50, message: 'First name must not exceed 50 characters' },
                                    pattern: {
                                        value: /^[a-zA-Z\s'-]+$/,
                                        message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
                                    }
                                })}
                            />
                            {errors.firstName && (
                                <Text className={styles.errorText}>{errors.firstName.message}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input
                                id="middleName"
                                type="text"
                                placeholder="A"
                                autoComplete="additional-name"
                                {...register('middleName', {
                                    required: 'Middle name is required',
                                    minLength: { value: 1, message: 'Middle name must be at least 1 character' },
                                    maxLength: { value: 50, message: 'Middle name must not exceed 50 characters' },
                                    pattern: {
                                        value: /^[a-zA-Z\s'-]+$/,
                                        message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes'
                                    }
                                })}
                            />
                            {errors.middleName && (
                                <Text className={styles.errorText}>{errors.middleName.message}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Doe"
                                autoComplete="family-name"
                                {...register('lastName', {
                                    required: 'Last name is required',
                                    minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                                    maxLength: { value: 50, message: 'Last name must not exceed 50 characters' },
                                    pattern: {
                                        value: /^[a-zA-Z\s'-]+$/,
                                        message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
                                    }
                                })}
                            />
                            {errors.lastName && (
                                <Text className={styles.errorText}>{errors.lastName.message}</Text>
                            )}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input
                                id="contactNumber"
                                type="tel"
                                placeholder="+1234567890"
                                autoComplete="tel"
                                {...register('contactNumber', {
                                    required: 'Contact number is required',
                                    pattern: {
                                        value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                        message: 'Please enter a valid phone number'
                                    }
                                })}
                            />
                            {errors.contactNumber && (
                                <Text className={styles.errorText}>{errors.contactNumber.message}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                autoComplete="bday"
                                {...register('birthDate', {
                                    required: 'Birthdate is required',
                                    validate: (value) => {
                                        const birthDate = new Date(value);
                                        const today = new Date();
                                        const age = today.getFullYear() - birthDate.getFullYear();
                                        const monthDiff = today.getMonth() - birthDate.getMonth();
                                        const dayDiff = today.getDate() - birthDate.getDate();
                                        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
                                        return actualAge >= 13 || 'You must be at least 13 years old to register';
                                    }
                                })}
                            />
                            {errors.birthDate && (
                                <Text className={styles.errorText}>{errors.birthDate.message}</Text>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Information Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Account Information</div>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <Label htmlFor="userName">Username</Label>
                            <Input
                                id="userName"
                                type="text"
                                placeholder="jdoe"
                                autoComplete="username"
                                {...register('userName', {
                                    required: 'Username is required',
                                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                    maxLength: { value: 20, message: 'Username must not exceed 20 characters' },
                                    pattern: {
                                        value: /^[a-zA-Z0-9_]+$/,
                                        message: 'Username can only contain letters, numbers, and underscores'
                                    }
                                })}
                            />
                            {errors.userName && (
                                <Text className={styles.errorText}>{errors.userName.message}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jane.doe@example.com"
                                autoComplete="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {errors.email && (
                                <Text className={styles.errorText}>{errors.email.message}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="P@ssw0rd!"
                                autoComplete="new-password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                                        message: 'Password must contain uppercase, lowercase, number, and special character'
                                    }
                                })}
                            />
                            {errors.password && (
                                <Text className={styles.errorText}>{errors.password.message}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="verifyPassword">Verify Password</Label>
                            <Input
                                id="verifyPassword"
                                type="password"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                {...register('verifyPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === watch('password') || 'Passwords do not match'
                                })}
                            />
                            {errors.verifyPassword && (
                                <Text className={styles.errorText}>{errors.verifyPassword.message}</Text>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {formError && (
                    <Text className={styles.errorText} style={{ marginTop: '8px' }}>
                        {formError}
                    </Text>
                )}

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <Button
                        appearance="secondary"
                        size="large"
                        onClick={() => navigate('/login')}
                        type="button"
                        className={styles.secondaryButton}
                    >
                        Back to Login
                    </Button>
                    <Button
                        appearance="primary"
                        type="submit"
                        size="large"
                        disabled={loading}
                        className={styles.primaryButton}
                    >
                        {loading ? 'Creating Account...' : 'Create an Account'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
