import { useState, useEffect } from 'react';
import { Card, Button, Input, Label, Text, Avatar } from '@fluentui/react-components';
import { Person24Regular } from '@fluentui/react-icons';
import { useForm } from 'react-hook-form';
import { useUser } from '../../hooks/useUser';
import { useProfileStyles } from '../../components/styles/Styles';

type ProfileFormInputs = {
  userName: string;
  firstName: string;
  lastName: string;
  middleName: string;
  contactNumber: string;
  birthDate: string;
  email: string;
  userIMG?: string | null;
};



export default function MyProfile() {
  const styles = useProfileStyles();
  const userCtx = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormInputs>({
    defaultValues: {
      userName: userCtx?.user?.userName || '',
      firstName: userCtx?.user?.firstName || '',
      lastName: userCtx?.user?.lastName || '',
      middleName: userCtx?.user?.middleName || '',
      contactNumber: userCtx?.user?.contactNumber || '',
      birthDate: userCtx?.user?.birthDate ? new Date(userCtx.user.birthDate).toISOString().split('T')[0] : '',
      email: userCtx?.user?.email || '',
      userIMG: userCtx?.user?.userIMG || null,
    },
    mode: 'onBlur',
  });

  // Update form when user data loads
  useEffect(() => {
    if (userCtx?.user) {
      reset({
        userName: userCtx.user.userName || '',
        firstName: userCtx.user.firstName || '',
        lastName: userCtx.user.lastName || '',
        middleName: userCtx.user.middleName || '',
        contactNumber: userCtx.user.contactNumber || '',
        birthDate: userCtx.user.birthDate ? new Date(userCtx.user.birthDate).toISOString().split('T')[0] : '',
        email: userCtx.user.email || '',
        userIMG: userCtx.user.userIMG || null,
      });
    }
  }, [userCtx?.user, reset]);

  const onSubmit = async (data: ProfileFormInputs) => {
    setLoading(true);
    try {
      // TODO: Call API to update user profile
      console.log('Profile update:', data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${userCtx?.user?.firstName || ''} ${userCtx?.user?.lastName || ''}`.trim();
  const username = userCtx?.user?.userName || 'User';

  return (
    <Card className={styles.card}>
      {/* Title Row */}
      <div className={styles.titleRow}>
        <Person24Regular />
        <h1 className={styles.title}>My Profile</h1>
      </div>

      {/* User Info Row */}
      <div className={styles.userRow}>
        <div className={styles.userInfo}>
          <Avatar
            name={fullName}
            size={72}
            image={userCtx?.user?.userIMG ? { src: userCtx.user.userIMG } : undefined}
          />
          <div className={styles.userText}>
            <div className={styles.userName}>{fullName}</div>
            <div className={styles.userSecondary}>@{username}</div>
          </div>
        </div>
        {!isEditing ? (
          <Button appearance="primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <Button appearance="primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formSection}>
        {/* Personal Information */}
        <div className={styles.row}>
          <div className={styles.field}>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              disabled={!isEditing}
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
              disabled={!isEditing}
              {...register('middleName', {
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
              disabled={!isEditing}
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
              disabled={!isEditing}
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
              disabled={!isEditing}
              {...register('birthDate', {
                required: 'Birthdate is required',
              })}
            />
            {errors.birthDate && (
              <Text className={styles.errorText}>{errors.birthDate.message}</Text>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className={styles.row}>
          <div className={styles.field}>
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              type="text"
              disabled={!isEditing}
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
              disabled={!isEditing}
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
        </div>
      </form>
    </Card>
  );
}
