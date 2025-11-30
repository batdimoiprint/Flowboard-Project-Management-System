import { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Label, Text, Avatar, tokens } from '@fluentui/react-components';
import { Camera24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useForm, Controller } from 'react-hook-form';
import { useUser } from '../../hooks/useUser';
import { usersApi } from '../../components/apis/users';
import type { UserUpdateRequest } from '../../components/apis/users';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';

type ProfileFormInputs = {
  userName: string;
  firstName: string;
  lastName: string;
  middleName: string;
  contactNumber: string;
  birthDate: string;
  email: string;
  userIMG?: string | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordFieldKeys = 'currentPassword' | 'newPassword' | 'confirmPassword';
type EditableProfileFields = Omit<ProfileFormInputs, PasswordFieldKeys>;



export default function MyProfile() {
  const s = mainLayoutStyles();
  const userCtx = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset, formState: { errors }, watch, setError, clearErrors, setValue } = useForm<ProfileFormInputs>({
    defaultValues: {
      userName: userCtx?.user?.userName || '',
      firstName: userCtx?.user?.firstName || '',
      lastName: userCtx?.user?.lastName || '',
      middleName: userCtx?.user?.middleName || '',
      contactNumber: userCtx?.user?.contactNumber || '',
      birthDate: userCtx?.user?.birthDate ? new Date(userCtx.user.birthDate).toISOString().split('T')[0] : '',
      email: userCtx?.user?.email || '',
      userIMG: userCtx?.user?.userIMG || null,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const currentPasswordValue = watch('currentPassword');
  const newPasswordValue = watch('newPassword');
  const confirmPasswordValue = watch('confirmPassword');

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
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setImagePreview(userCtx.user.userIMG || null);
    }
  }, [userCtx?.user, reset]);

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setValue('userIMG', base64);
    };
    reader.onerror = () => {
      setImageError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Handle image removal
  const handleImageRemove = () => {
    setImagePreview(null);
    setValue('userIMG', null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (data: ProfileFormInputs) => {
    setLoading(true);
    try {
      // Prepare minimal payload with only changed/valid fields
      const userId = userCtx?.user?.id;
      if (!userId) throw new Error('No user is logged in.');

      const { currentPassword, newPassword, confirmPassword, ...profileFields } = data;
      const editableFields = profileFields as EditableProfileFields;
      const payload: UserUpdateRequest = {};

      const currentUserSnapshot: Record<keyof EditableProfileFields, string | null | undefined> = {
        userName: userCtx?.user?.userName ?? '',
        firstName: userCtx?.user?.firstName ?? '',
        lastName: userCtx?.user?.lastName ?? '',
        middleName: userCtx?.user?.middleName ?? '',
        contactNumber: userCtx?.user?.contactNumber ?? '',
        birthDate: userCtx?.user?.birthDate ?? '',
        email: userCtx?.user?.email ?? '',
        userIMG: userCtx?.user?.userIMG ?? null,
      };

      const editableKeys: Array<keyof EditableProfileFields> = [
        'userName',
        'firstName',
        'lastName',
        'middleName',
        'contactNumber',
        'birthDate',
        'email',
        'userIMG',
      ];

      editableKeys.forEach((key) => {
        const val = editableFields[key];
        const currentVal = currentUserSnapshot[key];

        if (val === undefined) return;

        if (key === 'userIMG') {
          if (val === null && currentVal !== null) {
            payload.userIMG = null;
          } else if (typeof val === 'string' && val.trim() !== '' && val !== currentVal) {
            payload.userIMG = val;
          }
          return;
        }

        if (key === 'birthDate') {
          if (val) {
            const isoDate = new Date(val).toISOString();
            const currentDatePart = currentVal ? new Date(currentVal).toISOString().split('T')[0] : '';
            if (isoDate.split('T')[0] !== currentDatePart) {
              payload.birthDate = isoDate;
            }
          }
          return;
        }

        if (typeof val === 'string' && val.trim() === '') return;
        if (val !== currentVal) {
          (payload as Record<string, string | null | undefined>)[key as string] = val;
        }
      });

      clearErrors(['currentPassword', 'newPassword', 'confirmPassword']);
      const wantsPasswordChange = currentPassword || newPassword || confirmPassword;
      if (wantsPasswordChange) {
        let passwordValidationFailed = false;
        if (!currentPassword) {
          setError('currentPassword', { type: 'manual', message: 'Current password is required to change your password.' });
          passwordValidationFailed = true;
        }
        if (!newPassword) {
          setError('newPassword', { type: 'manual', message: 'Please provide a new password.' });
          passwordValidationFailed = true;
        } else if (newPassword.length < 8) {
          setError('newPassword', { type: 'manual', message: 'New password must be at least 8 characters.' });
          passwordValidationFailed = true;
        }
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
          setError('confirmPassword', { type: 'manual', message: 'Passwords do not match.' });
          passwordValidationFailed = true;
        }

        if (passwordValidationFailed) {
          setLoading(false);
          return;
        }

        payload.password = newPassword;
      }

      // Call update API only if payload contains something
      if (Object.keys(payload).length === 0) {

        setIsEditing(false);
        return;
      }

      const updatedUser = await usersApi.updateUser(userId, payload as UserUpdateRequest);

      // Update context and local storage
      userCtx?.setUser(updatedUser);
      // Update image preview
      setImagePreview(updatedUser.userIMG ?? null);
      // Refresh form values to updated user's values
      reset({
        userName: updatedUser.userName || '',
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        middleName: updatedUser.middleName || '',
        contactNumber: updatedUser.contactNumber || '',
        birthDate: updatedUser.birthDate ? new Date(updatedUser.birthDate).toISOString().split('T')[0] : '',
        email: updatedUser.email || '',
        userIMG: updatedUser.userIMG ?? null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
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
    <Card className={mergeClasses(s.flexColFill, s.layoutPadding, s.gap)}>
      {/* Title Row */}

      <h1 className={mergeClasses(s.brand)}>My Profile</h1>


      {/* User Info Row */}
      <div className={mergeClasses(s.flexRowFit, s.spaceBetween)}>
        <div className={mergeClasses(s.flexRowFit, s.alignCenter, s.gap)}>
          {/* Profile Picture with Upload */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              name={fullName}
              size={72}
              image={imagePreview ? { src: imagePreview } : undefined}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
              onClick={handleImageClick}
            />
            {isEditing && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                display: 'flex',
                gap: '2px',
              }}>
                <Button
                  appearance="primary"
                  size="small"
                  icon={<Camera24Regular />}
                  onClick={handleImageClick}
                  style={{
                    minWidth: 'auto',
                    padding: '4px',
                    borderRadius: '50%',
                  }}
                  title="Upload photo"
                />
                {imagePreview && (
                  <Button
                    appearance="secondary"
                    size="small"
                    icon={<Delete24Regular />}
                    onClick={handleImageRemove}
                    style={{
                      minWidth: 'auto',
                      padding: '4px',
                      borderRadius: '50%',
                    }}
                    title="Remove photo"
                  />
                )}
              </div>
            )}
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>
          <div className={mergeClasses(s.flexColFill, s.alignCenter)}>
            <Text weight='bold' >{fullName}</Text>
            <Text >@{username}</Text>
            {imageError && (
              <Text style={{ color: tokens.colorPaletteRedForeground1, fontSize: tokens.fontSizeBase200 }}>
                {imageError}
              </Text>
            )}
          </div>
        </div>
        <div className={mergeClasses(s.flexColFit, s.alignCenter)}>
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
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={mergeClasses(s.formSection)}>
        {/* Personal Information */}
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="firstName">First Name</Label>
            <Controller
              control={control}
              name="firstName"
              rules={{
                required: 'First name is required',
                minLength: { value: 2, message: 'First name must be at least 2 characters' },
                maxLength: { value: 50, message: 'First name must not exceed 50 characters' },
                pattern: {
                  value: /^[a-zA-Z\s'-]+$/,
                  message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
                }
              }}
              render={({ field }) => (
                <Input id="firstName" type="text" disabled={!isEditing} {...field} />
              )}
            />
            {errors.firstName && (
              <Text className={mergeClasses(s.errorText)}>{errors.firstName.message}</Text>
            )}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="middleName">Middle Name</Label>
            <Controller
              control={control}
              name="middleName"
              rules={{
                minLength: { value: 1, message: 'Middle name must be at least 1 character' },
                maxLength: { value: 50, message: 'Middle name must not exceed 50 characters' },
                pattern: {
                  value: /^[a-zA-Z\s'-]+$/,
                  message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes'
                }
              }}
              render={({ field }) => (
                <Input id="middleName" type="text" disabled={!isEditing} {...field} />
              )}
            />
            {errors.middleName && (
              <Text className={mergeClasses(s.errorText)}>{errors.middleName.message}</Text>
            )}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="lastName">Last Name</Label>
            <Controller
              control={control}
              name="lastName"
              rules={{
                required: 'Last name is required',
                minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Last name must not exceed 50 characters' },
                pattern: {
                  value: /^[a-zA-Z\s'-]+$/,
                  message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
                }
              }}
              render={({ field }) => (
                <Input id="lastName" type="text" disabled={!isEditing} {...field} />
              )}
            />
            {errors.lastName && (
              <Text className={mergeClasses(s.errorText)}>{errors.lastName.message}</Text>
            )}
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Controller
              control={control}
              name="contactNumber"
              rules={{
                required: 'Contact number is required',
                pattern: {
                  value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                  message: 'Please enter a valid phone number'
                }
              }}
              render={({ field }) => (
                <Input id="contactNumber" type="tel" disabled={!isEditing} {...field} />
              )}
            />
            {errors.contactNumber && (
              <Text className={mergeClasses(s.errorText)}>{errors.contactNumber.message}</Text>
            )}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="birthDate">Birth Date</Label>
            <Controller
              control={control}
              name="birthDate"
              rules={{ required: 'Birthdate is required' }}
              render={({ field }) => (
                <Input id="birthDate" type="date" disabled={!isEditing} {...field} />
              )}
            />
            {errors.birthDate && (
              <Text className={mergeClasses(s.errorText)}>{errors.birthDate.message}</Text>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="userName">Username</Label>
            <Controller
              control={control}
              name="userName"
              rules={{
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                maxLength: { value: 20, message: 'Username must not exceed 20 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              }}
              render={({ field }) => (
                <Input id="userName" type="text" disabled={!isEditing} {...field} />
              )}
            />
            {errors.userName && (
              <Text className={mergeClasses(s.errorText)}>{errors.userName.message}</Text>
            )}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="email">Email</Label>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <Input id="email" type="email" disabled={!isEditing} {...field} />
              )}
            />
            {errors.email && (
              <Text className={mergeClasses(s.errorText)}>{errors.email.message}</Text>
            )}
          </div>
        </div>

        {/* Password Update */}
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Controller
              control={control}
              name="currentPassword"
              rules={{
                validate: (value) => {
                  const needsValidation = !!newPasswordValue || !!confirmPasswordValue;
                  if (needsValidation && !value) {
                    return 'Current password is required to change your password';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <Input id="currentPassword" type="password" disabled={!isEditing} {...field} />
              )}
            />
            {errors.currentPassword && (
              <Text className={mergeClasses(s.errorText)}>{errors.currentPassword.message}</Text>
            )}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="newPassword">New Password</Label>
            <Controller
              control={control}
              name="newPassword"
              rules={{
                validate: (value) => {
                  const needsValidation = !!currentPasswordValue || !!confirmPasswordValue;
                  if (needsValidation && !value) {
                    return 'New password is required';
                  }
                  if (value && value.length < 8) {
                    return 'Password must be at least 8 characters';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <Input id="newPassword" type="password" disabled={!isEditing} {...field} />
              )}
            />
            {errors.newPassword && (
              <Text className={mergeClasses(s.errorText)}>{errors.newPassword.message}</Text>
            )}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                validate: (value) => {
                  const needsValidation = !!currentPasswordValue || !!newPasswordValue;
                  if (needsValidation && !value) {
                    return 'Please confirm your new password';
                  }
                  if (value && value !== newPasswordValue) {
                    return 'Passwords do not match';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <Input id="confirmPassword" type="password" disabled={!isEditing} {...field} />
              )}
            />
            {errors.confirmPassword && (
              <Text className={mergeClasses(s.errorText)}>{errors.confirmPassword.message}</Text>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
