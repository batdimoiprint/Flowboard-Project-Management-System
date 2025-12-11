import { useState, useEffect } from 'react';
import { Card, Text, Avatar, tokens, Spinner, Button } from '@fluentui/react-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';

export default function MemberProfile() {
    const s = mainLayoutStyles();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get('userId');

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError('No user ID provided');
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedUser = await usersApi.getUserById(userId);
                setUser(fetchedUser);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setError((err as Error)?.message || 'Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown User';
    const username = user?.userName || 'user';



    const formatAddress = (address?: User['address']) => {
        if (!address) return 'Not specified';
        const parts = [
            address.streetAddress,
            address.barangay,
            address.cityMunicipality,
            address.province,
            address.region,
            address.zipCode
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Not specified';
    };

    if (loading) {
        return (
            <Card className={mergeClasses(s.flexColFill, s.layoutPadding, s.gap, s.componentBorder)} style={{ overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                    <Spinner label="Loading member profile..." />
                </div>
            </Card>
        );
    }

    if (error || !user) {
        return (
            <Card className={mergeClasses(s.flexColFill, s.layoutPadding, s.gap, s.componentBorder)} style={{ overflow: 'auto' }}>
                <Button
                    appearance="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate(-1)}
                    style={{ alignSelf: 'flex-start', marginBottom: tokens.spacingVerticalM }}
                >
                    Back
                </Button>
                <div style={{ color: tokens.colorPaletteRedForeground1 }}>
                    {error || 'User not found'}
                </div>
            </Card>
        );
    }

    return (
        <Card className={mergeClasses(s.flexColFill, s.layoutPadding, s.gap, s.componentBorder)} style={{ overflow: 'auto' }}>
            {/* Back Button */}
            <Button
                appearance="subtle"
                icon={<ArrowLeft24Regular />}
                onClick={() => navigate(-1)}
                style={{ alignSelf: 'flex-start' }}
            >
                Back
            </Button>

            {/* Title Row */}
            <h1 className={mergeClasses(s.brand)}>Member Profile</h1>

            {/* User Info Row */}
            <div className={mergeClasses(s.flexRowFit, s.alignCenter, s.gap)}>
                <Avatar
                    name={fullName}
                    size={72}
                    image={user.userIMG ? { src: user.userIMG } : undefined}
                />
                <div className={mergeClasses(s.flexColFill)}>
                    <Text weight="bold" size={500}>{fullName}</Text>
                    <Text style={{ color: tokens.colorNeutralForeground3 }}>@{username}</Text>
                </div>
            </div>

            {/* Profile Information - View Only */}
            <div className={mergeClasses(s.formSection)}>
                {/* Contact Information */}
                <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL, marginBottom: tokens.spacingVerticalS }}>
                    Contact Information
                </Text>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: tokens.spacingHorizontalL,
                    padding: tokens.spacingVerticalM,
                    backgroundColor: tokens.colorNeutralBackground2,
                    borderRadius: tokens.borderRadiusMedium
                }}>
                    <div>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>Username</Text>
                        <Text>@{user.userName || 'Not specified'}</Text>
                    </div>
                    <div>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>Email</Text>
                        <Text>{user.email || 'Not specified'}</Text>
                    </div>
                    <div>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>Contact Number</Text>
                        <Text>{user.contactNumber || 'Not specified'}</Text>
                    </div>
                    <div>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>Secondary Contact</Text>
                        <Text>{user.secondaryContactNumber || 'Not specified'}</Text>
                    </div>
                </div>

                {/* Address Information */}
                <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL, marginBottom: tokens.spacingVerticalS }}>
                    Primary Address
                </Text>
                <div style={{
                    padding: tokens.spacingVerticalM,
                    backgroundColor: tokens.colorNeutralBackground2,
                    borderRadius: tokens.borderRadiusMedium
                }}>
                    <Text>{formatAddress(user.address)}</Text>
                </div>

                {user.secondaryAddress && (
                    <>
                        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL, marginBottom: tokens.spacingVerticalS }}>
                            Secondary Address
                        </Text>
                        <div style={{
                            padding: tokens.spacingVerticalM,
                            backgroundColor: tokens.colorNeutralBackground2,
                            borderRadius: tokens.borderRadiusMedium
                        }}>
                            <Text>{formatAddress(user.secondaryAddress)}</Text>
                        </div>
                    </>
                )}

                {/* Account Information */}
                {/* Removed Account Information section */}
            </div>
        </Card>
    );
}
