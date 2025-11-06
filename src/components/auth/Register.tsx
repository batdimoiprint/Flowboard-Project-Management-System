
import { Button, Input, Label, tokens, Card, Text } from '@fluentui/react-components';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {useRegisterFormStyles } from '../styles/Styles'


export default function Register() {

    const styles = useRegisterFormStyles();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [birthDate, setBirthDate] = useState(''); // ISO string YYYY-MM-DD
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!userName || !lastName || !firstName || !middleName || !contactNumber || !birthDate || !email || !password) {
            setError('Please fill in all required fields.');
            return;
        }
        // TODO: Implement registration logic
        navigate("/home");
    };

    return (
        <Card className={styles.root}>
            <h2 className={styles.title}>Create an Account</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Personal Information</div>
                    <div className={styles.field}>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(_, data) => setLastName(data.value)}
                            required
                            placeholder="Last Name"
                            autoComplete="family-name"
                        />
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(_, data) => setFirstName(data.value)}
                            required
                            placeholder="First Name"
                            autoComplete="given-name"
                        />
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                            id="middleName"
                            type="text"
                            value={middleName}
                            onChange={(_, data) => setMiddleName(data.value)}
                            required
                            placeholder="Middle Name"
                            autoComplete="additional-name"
                        />
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                            id="contactNumber"
                            type="tel"
                            value={contactNumber}
                            onChange={(_, data) => setContactNumber(data.value)}
                            required
                            placeholder="e.g. 09123456789"
                            autoComplete="tel"
                        />
                        <Label htmlFor="birthDate">Birthdate</Label>
                        <Input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(_, data) => setBirthDate(data.value)}
                            required
                            placeholder="YYYY-MM-DD"
                        />
                    </div>
                </div>
                {/* Account Information Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Account Information</div>
                    <div className={styles.field}>
                        <Label htmlFor="userName">User Name</Label>
                        <Input
                            id="userName"
                            type="text"
                            value={userName}
                            onChange={(_, data) => setUserName(data.value)}
                            required
                            placeholder="User Name"
                            autoComplete="username"
                        />
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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(_, data) => setPassword(data.value)}
                            required
                            placeholder="Password"
                            autoComplete="new-password"
                        />
                    </div>
                </div>
                {/* Error and Actions Section */}
                {error && (
                    <Text as="span" style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalXS }}>{error}</Text>
                )}
                <div className={styles.actions}>
                    <Button appearance="primary" type="submit" size="large">Create Account</Button>
                    <Button appearance="outline" size="large" onClick={() => { navigate("/login") }} >Back to Login</Button>
                </div>
            </form>
        </Card>
    );
}
