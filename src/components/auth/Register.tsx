import React, { useState } from 'react';
import { Button, Input, Label, Card, Text } from '@fluentui/react-components';
import { useNavigate } from 'react-router';
import useRegisterStyles from '../../components/styles/RegisterStyles';
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
    userIMG?: string | null;
};

export default function Register() {
    const styles = useRegisterStyles();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<RegisterFormInputs>({
        userName: '',
        firstName: '',
        lastName: '',
        middleName: '',
        contactNumber: '',
        birthDate: '',
        email: '',
        password: '',
        userIMG: null,
    });
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormInputs, string>>>({});

    const validate = (): boolean => {
        const errs: Partial<Record<keyof RegisterFormInputs, string>> = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.middleName.trim()) errs.middleName = 'Middle name is required';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required';
        if (!form.contactNumber.trim()) errs.contactNumber = 'Contact number is required';
        if (!form.birthDate) errs.birthDate = 'Birthdate is required';
        if (!form.userName.trim()) errs.userName = 'Username is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        if (!form.password.trim()) errs.password = 'Password is required';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setFieldErrors(errs => ({ ...errs, [name]: undefined }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!validate()) return;

        const payload: RegisterRequest = {
            userName: form.userName,
            firstName: form.firstName,
            lastName: form.lastName,
            middleName: form.middleName,
            contactNumber: form.contactNumber,
            birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : '',
            userIMG: null,
            email: form.email,
            password: form.password,
        };

        setLoading(true);
        try {
            await authApi.register(payload);
            // Registration successful, navigate to login
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

            <form onSubmit={onSubmit}>
                {/* Personal Information Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Personal Information</div>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="Jane"
                                autoComplete="given-name"
                                value={form.firstName}
                                onChange={handleChange}
                            />
                            {fieldErrors.firstName && (
                                <Text className={styles.errorText}>{fieldErrors.firstName}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input
                                id="middleName"
                                name="middleName"
                                type="text"
                                placeholder="A"
                                autoComplete="additional-name"
                                value={form.middleName}
                                onChange={handleChange}
                            />
                            {fieldErrors.middleName && (
                                <Text className={styles.errorText}>{fieldErrors.middleName}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Doe"
                                autoComplete="family-name"
                                value={form.lastName}
                                onChange={handleChange}
                            />
                            {fieldErrors.lastName && (
                                <Text className={styles.errorText}>{fieldErrors.lastName}</Text>
                            )}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input
                                id="contactNumber"
                                name="contactNumber"
                                type="tel"
                                placeholder="+1234567890"
                                autoComplete="tel"
                                value={form.contactNumber}
                                onChange={handleChange}
                            />
                            {fieldErrors.contactNumber && (
                                <Text className={styles.errorText}>{fieldErrors.contactNumber}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                autoComplete="bday"
                                value={form.birthDate}
                                onChange={handleChange}
                            />
                            {fieldErrors.birthDate && (
                                <Text className={styles.errorText}>{fieldErrors.birthDate}</Text>
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
                                name="userName"
                                type="text"
                                placeholder="jdoe"
                                autoComplete="username"
                                value={form.userName}
                                onChange={handleChange}
                            />
                            {fieldErrors.userName && (
                                <Text className={styles.errorText}>{fieldErrors.userName}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane.doe@example.com"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {fieldErrors.email && (
                                <Text className={styles.errorText}>{fieldErrors.email}</Text>
                            )}
                        </div>
                        <div className={styles.field}>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="P@ssw0rd!"
                                autoComplete="new-password"
                                value={form.password}
                                onChange={handleChange}
                            />
                            {fieldErrors.password && (
                                <Text className={styles.errorText}>{fieldErrors.password}</Text>
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
