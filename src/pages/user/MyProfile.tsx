import { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Label, Text, Avatar, tokens } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { Camera24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useForm, Controller } from 'react-hook-form';
import { useUser } from '../../hooks/useUser';
import { usersApi } from '../../components/apis/users';
import type { UserUpdateRequest } from '../../components/apis/users';
import type { AddressData } from '../../components/apis/philippineAddress';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';
import imageCompression from 'browser-image-compression';

type ProfileFormInputs = {
  userName: string;
  firstName: string;
  lastName: string;
  middleName: string;
  contactNumber: string;
  secondaryContactNumber: string;
  birthDate: string;
  email: string;
  userIMG?: string | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  // Primary Address fields
  region: string;
  regionCode: string;
  province: string;
  provinceCode: string;
  cityMunicipality: string;
  cityMunicipalityCode: string;
  barangay: string;
  barangayCode: string;
  streetAddress: string;
  zipCode: string;
  // Secondary Address fields
  secondaryRegion: string;
  secondaryRegionCode: string;
  secondaryProvince: string;
  secondaryProvinceCode: string;
  secondaryCityMunicipality: string;
  secondaryCityMunicipalityCode: string;
  secondaryBarangay: string;
  secondaryBarangayCode: string;
  secondaryStreetAddress: string;
  secondaryZipCode: string;
};

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
      secondaryContactNumber: userCtx?.user?.secondaryContactNumber || '',
      birthDate: userCtx?.user?.birthDate ? new Date(userCtx.user.birthDate).toISOString().split('T')[0] : '',
      email: userCtx?.user?.email || '',
      userIMG: userCtx?.user?.userIMG || null,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      region: userCtx?.user?.address?.region || '',
      regionCode: userCtx?.user?.address?.regionCode || '',
      province: userCtx?.user?.address?.province || '',
      provinceCode: userCtx?.user?.address?.provinceCode || '',
      cityMunicipality: userCtx?.user?.address?.cityMunicipality || '',
      cityMunicipalityCode: userCtx?.user?.address?.cityMunicipalityCode || '',
      barangay: userCtx?.user?.address?.barangay || '',
      barangayCode: userCtx?.user?.address?.barangayCode || '',
      streetAddress: userCtx?.user?.address?.streetAddress || '',
      zipCode: userCtx?.user?.address?.zipCode || '',
      secondaryRegion: userCtx?.user?.secondaryAddress?.region || '',
      secondaryRegionCode: userCtx?.user?.secondaryAddress?.regionCode || '',
      secondaryProvince: userCtx?.user?.secondaryAddress?.province || '',
      secondaryProvinceCode: userCtx?.user?.secondaryAddress?.provinceCode || '',
      secondaryCityMunicipality: userCtx?.user?.secondaryAddress?.cityMunicipality || '',
      secondaryCityMunicipalityCode: userCtx?.user?.secondaryAddress?.cityMunicipalityCode || '',
      secondaryBarangay: userCtx?.user?.secondaryAddress?.barangay || '',
      secondaryBarangayCode: userCtx?.user?.secondaryAddress?.barangayCode || '',
      secondaryStreetAddress: userCtx?.user?.secondaryAddress?.streetAddress || '',
      secondaryZipCode: userCtx?.user?.secondaryAddress?.zipCode || '',
    },
    mode: 'onBlur',
  });

  const currentPasswordValue = watch('currentPassword');
  const newPasswordValue = watch('newPassword');
  const confirmPasswordValue = watch('confirmPassword');

  // Validation for password fields
  useEffect(() => {
    const needsValidation = !!currentPasswordValue || !!newPasswordValue || !!confirmPasswordValue;
    if (needsValidation) {
      if (!currentPasswordValue) {
        setError('currentPassword', { type: 'manual', message: 'Current password required' });
      }
      if (newPasswordValue && newPasswordValue.length < 8) {
        setError('newPassword', { type: 'manual', message: 'Password must be at least 8 characters' });
      }
      if (newPasswordValue && confirmPasswordValue && newPasswordValue !== confirmPasswordValue) {
        setError('confirmPassword', { type: 'manual', message: 'Passwords do not match' });
      }
    }
  }, [currentPasswordValue, newPasswordValue, confirmPasswordValue, setError]);

  // Update form when user data loads
  useEffect(() => {
    if (userCtx?.user) {
      reset({
        userName: userCtx.user.userName || '',
        firstName: userCtx.user.firstName || '',
        lastName: userCtx.user.lastName || '',
        middleName: userCtx.user.middleName || '',
        contactNumber: userCtx.user.contactNumber || '',
        secondaryContactNumber: userCtx.user.secondaryContactNumber || '',
        birthDate: userCtx.user.birthDate ? new Date(userCtx.user.birthDate).toISOString().split('T')[0] : '',
        email: userCtx.user.email || '',
        userIMG: userCtx.user.userIMG || null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        region: userCtx.user.address?.region || '',
        regionCode: userCtx.user.address?.regionCode || '',
        province: userCtx.user.address?.province || '',
        provinceCode: userCtx.user.address?.provinceCode || '',
        cityMunicipality: userCtx.user.address?.cityMunicipality || '',
        cityMunicipalityCode: userCtx.user.address?.cityMunicipalityCode || '',
        barangay: userCtx.user.address?.barangay || '',
        barangayCode: userCtx.user.address?.barangayCode || '',
        streetAddress: userCtx.user.address?.streetAddress || '',
        zipCode: userCtx.user.address?.zipCode || '',
        secondaryRegion: userCtx.user.secondaryAddress?.region || '',
        secondaryRegionCode: userCtx.user.secondaryAddress?.regionCode || '',
        secondaryProvince: userCtx.user.secondaryAddress?.province || '',
        secondaryProvinceCode: userCtx.user.secondaryAddress?.provinceCode || '',
        secondaryCityMunicipality: userCtx.user.secondaryAddress?.cityMunicipality || '',
        secondaryCityMunicipalityCode: userCtx.user.secondaryAddress?.cityMunicipalityCode || '',
        secondaryBarangay: userCtx.user.secondaryAddress?.barangay || '',
        secondaryBarangayCode: userCtx.user.secondaryAddress?.barangayCode || '',
        secondaryStreetAddress: userCtx.user.secondaryAddress?.streetAddress || '',
        secondaryZipCode: userCtx.user.secondaryAddress?.zipCode || '',
      });
      setImagePreview(userCtx.user.userIMG || null);
    }
  }, [userCtx?.user, reset]);

  // Handle image file selection with compression
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max before compression)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    try {
      // Compress image to 72x72px with high quality
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 256,
        useWebWorker: true,
        fileType: 'image/webp',
      };

      const compressedFile = await imageCompression(file, options);

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
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image compression failed:', error);
      setImageError('Failed to process image');
    }
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

      const {
        currentPassword, newPassword, confirmPassword,
        region, regionCode, province, provinceCode, cityMunicipality, cityMunicipalityCode,
        barangay, barangayCode, streetAddress, zipCode,
        secondaryRegion, secondaryRegionCode, secondaryProvince, secondaryProvinceCode,
        secondaryCityMunicipality, secondaryCityMunicipalityCode, secondaryBarangay,
        secondaryBarangayCode, secondaryStreetAddress, secondaryZipCode,
        ...profileFields
      } = data;
      const payload: UserUpdateRequest = {};

      const currentUserSnapshot = {
        userName: userCtx?.user?.userName ?? '',
        firstName: userCtx?.user?.firstName ?? '',
        lastName: userCtx?.user?.lastName ?? '',
        middleName: userCtx?.user?.middleName ?? '',
        contactNumber: userCtx?.user?.contactNumber ?? '',
        secondaryContactNumber: userCtx?.user?.secondaryContactNumber ?? '',
        birthDate: userCtx?.user?.birthDate ?? '',
        email: userCtx?.user?.email ?? '',
        userIMG: userCtx?.user?.userIMG ?? null,
      };

      const editableKeys: Array<keyof typeof currentUserSnapshot> = [
        'userName',
        'firstName',
        'lastName',
        'middleName',
        'contactNumber',
        'secondaryContactNumber',
        'birthDate',
        'email',
        'userIMG',
      ];

      editableKeys.forEach((key) => {
        const val = profileFields[key as keyof typeof profileFields];
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

        if (key === 'secondaryContactNumber') {
          const strVal = val as string;
          if (strVal !== currentVal) {
            payload.secondaryContactNumber = strVal || null;
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

      // Handle address fields
      const hasAddressData = region || regionCode || province || provinceCode || cityMunicipality ||
        cityMunicipalityCode || barangay || barangayCode || streetAddress || zipCode;
      if (hasAddressData) {
        const newAddress: AddressData = {
          region: region || '',
          regionCode: regionCode || '',
          province: province || '',
          provinceCode: provinceCode || '',
          cityMunicipality: cityMunicipality || '',
          cityMunicipalityCode: cityMunicipalityCode || '',
          barangay: barangay || '',
          barangayCode: barangayCode || '',
          streetAddress: streetAddress || '',
          zipCode: zipCode || ''
        };

        // Check if address has changed
        const currentAddress = userCtx?.user?.address;
        const addressChanged =
          newAddress.region !== (currentAddress?.region || '') ||
          newAddress.regionCode !== (currentAddress?.regionCode || '') ||
          newAddress.province !== (currentAddress?.province || '') ||
          newAddress.provinceCode !== (currentAddress?.provinceCode || '') ||
          newAddress.cityMunicipality !== (currentAddress?.cityMunicipality || '') ||
          newAddress.cityMunicipalityCode !== (currentAddress?.cityMunicipalityCode || '') ||
          newAddress.barangay !== (currentAddress?.barangay || '') ||
          newAddress.barangayCode !== (currentAddress?.barangayCode || '') ||
          newAddress.streetAddress !== (currentAddress?.streetAddress || '') ||
          newAddress.zipCode !== (currentAddress?.zipCode || '');

        if (addressChanged) {
          payload.address = newAddress;
        }
      }

      // Handle secondary address fields (optional)
      const hasSecondaryAddressData = secondaryRegion || secondaryRegionCode || secondaryProvince ||
        secondaryProvinceCode || secondaryCityMunicipality ||
        secondaryCityMunicipalityCode || secondaryBarangay ||
        secondaryBarangayCode || secondaryStreetAddress || secondaryZipCode;
      if (hasSecondaryAddressData) {
        const newSecondaryAddress: AddressData = {
          region: secondaryRegion || '',
          regionCode: secondaryRegionCode || '',
          province: secondaryProvince || '',
          provinceCode: secondaryProvinceCode || '',
          cityMunicipality: secondaryCityMunicipality || '',
          cityMunicipalityCode: secondaryCityMunicipalityCode || '',
          barangay: secondaryBarangay || '',
          barangayCode: secondaryBarangayCode || '',
          streetAddress: secondaryStreetAddress || '',
          zipCode: secondaryZipCode || ''
        };

        // Check if secondary address has changed
        const currentSecondaryAddress = userCtx?.user?.secondaryAddress;
        const secondaryAddressChanged =
          newSecondaryAddress.region !== (currentSecondaryAddress?.region || '') ||
          newSecondaryAddress.regionCode !== (currentSecondaryAddress?.regionCode || '') ||
          newSecondaryAddress.province !== (currentSecondaryAddress?.province || '') ||
          newSecondaryAddress.provinceCode !== (currentSecondaryAddress?.provinceCode || '') ||
          newSecondaryAddress.cityMunicipality !== (currentSecondaryAddress?.cityMunicipality || '') ||
          newSecondaryAddress.cityMunicipalityCode !== (currentSecondaryAddress?.cityMunicipalityCode || '') ||
          newSecondaryAddress.barangay !== (currentSecondaryAddress?.barangay || '') ||
          newSecondaryAddress.barangayCode !== (currentSecondaryAddress?.barangayCode || '') ||
          newSecondaryAddress.streetAddress !== (currentSecondaryAddress?.streetAddress || '') ||
          newSecondaryAddress.zipCode !== (currentSecondaryAddress?.zipCode || '');

        if (secondaryAddressChanged) {
          payload.secondaryAddress = newSecondaryAddress;
        }
      } else {
        // If secondary address fields are cleared, set to null
        if (userCtx?.user?.secondaryAddress) {
          payload.secondaryAddress = null;
        }
      }

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
        secondaryContactNumber: updatedUser.secondaryContactNumber || '',
        birthDate: updatedUser.birthDate ? new Date(updatedUser.birthDate).toISOString().split('T')[0] : '',
        email: updatedUser.email || '',
        userIMG: updatedUser.userIMG ?? null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        region: updatedUser.address?.region || '',
        regionCode: updatedUser.address?.regionCode || '',
        province: updatedUser.address?.province || '',
        provinceCode: updatedUser.address?.provinceCode || '',
        cityMunicipality: updatedUser.address?.cityMunicipality || '',
        cityMunicipalityCode: updatedUser.address?.cityMunicipalityCode || '',
        barangay: updatedUser.address?.barangay || '',
        barangayCode: updatedUser.address?.barangayCode || '',
        streetAddress: updatedUser.address?.streetAddress || '',
        zipCode: updatedUser.address?.zipCode || '',
        secondaryRegion: updatedUser.secondaryAddress?.region || '',
        secondaryRegionCode: updatedUser.secondaryAddress?.regionCode || '',
        secondaryProvince: updatedUser.secondaryAddress?.province || '',
        secondaryProvinceCode: updatedUser.secondaryAddress?.provinceCode || '',
        secondaryCityMunicipality: updatedUser.secondaryAddress?.cityMunicipality || '',
        secondaryCityMunicipalityCode: updatedUser.secondaryAddress?.cityMunicipalityCode || '',
        secondaryBarangay: updatedUser.secondaryAddress?.barangay || '',
        secondaryBarangayCode: updatedUser.secondaryAddress?.barangayCode || '',
        secondaryStreetAddress: updatedUser.secondaryAddress?.streetAddress || '',
        secondaryZipCode: updatedUser.secondaryAddress?.zipCode || '',
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
    <Card className={mergeClasses(s.flexColFill, s.layoutPadding, s.gap, s.componentBorder)}>
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
        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalM }}>Personal Information</Text>
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="firstName">First Name</Label>
            <Controller
              control={control}
              name="firstName"
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <Input id="firstName" type="text" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.firstName && <Text className={mergeClasses(s.errorText)}>{errors.firstName.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="middleName">Middle Name</Label>
            <Controller
              control={control}
              name="middleName"
              render={({ field }) => (
                <Input id="middleName" type="text" disabled={!isEditing} size="small" {...field} />
              )}
            />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="lastName">Last Name</Label>
            <Controller
              control={control}
              name="lastName"
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <Input id="lastName" type="text" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.lastName && <Text className={mergeClasses(s.errorText)}>{errors.lastName.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="birthDate">Birth Date</Label>
            <Controller
              control={control}
              name="birthDate"
              rules={{ required: 'Birthdate is required' }}
              render={({ field }) => (
                <DatePicker
                  id="birthDate"
                  placeholder="mm/dd/yyyy"
                  value={field.value ? new Date(field.value) : null}
                  onSelectDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                  disabled={!isEditing}
                  maxDate={new Date()}
                  size="small"
                  style={{ width: '100%' }}
                />
              )}
            />
            {errors.birthDate && <Text className={mergeClasses(s.errorText)}>{errors.birthDate.message}</Text>}
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="userName">Username</Label>
            <Controller
              control={control}
              name="userName"
              rules={{ required: 'Username is required' }}
              render={({ field }) => (
                <Input id="userName" type="text" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.userName && <Text className={mergeClasses(s.errorText)}>{errors.userName.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="email">Email</Label>
            <Controller
              control={control}
              name="email"
              rules={{ required: 'Email is required' }}
              render={({ field }) => (
                <Input id="email" type="email" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.email && <Text className={mergeClasses(s.errorText)}>{errors.email.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Controller
              control={control}
              name="contactNumber"
              rules={{ required: 'Contact number is required' }}
              render={({ field }) => (
                <Input id="contactNumber" type="tel" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.contactNumber && <Text className={mergeClasses(s.errorText)}>{errors.contactNumber.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryContactNumber">Secondary Contact</Label>
            <Controller
              control={control}
              name="secondaryContactNumber"
              render={({ field }) => (
                <Input id="secondaryContactNumber" type="tel" disabled={!isEditing} size="small" {...field} />
              )}
            />
          </div>
        </div>

        {/* Password Update */}
        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>Change Password</Text>
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field }) => (
                <Input id="currentPassword" type="password" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.currentPassword && <Text className={mergeClasses(s.errorText)}>{errors.currentPassword.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="newPassword">New Password</Label>
            <Controller
              control={control}
              name="newPassword"
              render={({ field }) => (
                <Input id="newPassword" type="password" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.newPassword && <Text className={mergeClasses(s.errorText)}>{errors.newPassword.message}</Text>}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <Input id="confirmPassword" type="password" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.confirmPassword && <Text className={mergeClasses(s.errorText)}>{errors.confirmPassword.message}</Text>}
          </div>
        </div>

        {/* Address Information */}
        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>Primary Address</Text>
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="region">Region</Label>
            <Controller control={control} name="region" render={({ field }) => (
              <Input id="region" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="regionCode">Code</Label>
            <Controller control={control} name="regionCode" render={({ field }) => (
              <Input id="regionCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="province">Province</Label>
            <Controller control={control} name="province" render={({ field }) => (
              <Input id="province" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="provinceCode">Code</Label>
            <Controller control={control} name="provinceCode" render={({ field }) => (
              <Input id="provinceCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="cityMunicipality">City/Municipality</Label>
            <Controller control={control} name="cityMunicipality" render={({ field }) => (
              <Input id="cityMunicipality" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="cityMunicipalityCode">Code</Label>
            <Controller control={control} name="cityMunicipalityCode" render={({ field }) => (
              <Input id="cityMunicipalityCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="barangay">Barangay</Label>
            <Controller control={control} name="barangay" render={({ field }) => (
              <Input id="barangay" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="barangayCode">Code</Label>
            <Controller control={control} name="barangayCode" render={({ field }) => (
              <Input id="barangayCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="streetAddress">Street Address</Label>
            <Controller control={control} name="streetAddress" render={({ field }) => (
              <Input id="streetAddress" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Controller
              control={control}
              name="zipCode"
              rules={{ pattern: { value: /^[0-9]{4}$/, message: 'Zip code must be 4 digits' } }}
              render={({ field }) => (
                <Input id="zipCode" type="text" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.zipCode && <Text className={mergeClasses(s.errorText)}>{errors.zipCode.message}</Text>}
          </div>
        </div>

        {/* Secondary Address Information (Optional) */}
        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>Secondary Address (Optional)</Text>
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryRegion">Region</Label>
            <Controller control={control} name="secondaryRegion" render={({ field }) => (
              <Input id="secondaryRegion" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryRegionCode">Code</Label>
            <Controller control={control} name="secondaryRegionCode" render={({ field }) => (
              <Input id="secondaryRegionCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryProvince">Province</Label>
            <Controller control={control} name="secondaryProvince" render={({ field }) => (
              <Input id="secondaryProvince" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryProvinceCode">Code</Label>
            <Controller control={control} name="secondaryProvinceCode" render={({ field }) => (
              <Input id="secondaryProvinceCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryCityMunicipality">City/Municipality</Label>
            <Controller control={control} name="secondaryCityMunicipality" render={({ field }) => (
              <Input id="secondaryCityMunicipality" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryCityMunicipalityCode">Code</Label>
            <Controller control={control} name="secondaryCityMunicipalityCode" render={({ field }) => (
              <Input id="secondaryCityMunicipalityCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryBarangay">Barangay</Label>
            <Controller control={control} name="secondaryBarangay" render={({ field }) => (
              <Input id="secondaryBarangay" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryBarangayCode">Code</Label>
            <Controller control={control} name="secondaryBarangayCode" render={({ field }) => (
              <Input id="secondaryBarangayCode" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryStreetAddress">Street Address</Label>
            <Controller control={control} name="secondaryStreetAddress" render={({ field }) => (
              <Input id="secondaryStreetAddress" type="text" disabled={!isEditing} size="small" {...field} />
            )} />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryZipCode">Zip Code</Label>
            <Controller
              control={control}
              name="secondaryZipCode"
              rules={{ pattern: { value: /^[0-9]{4}$/, message: 'Zip code must be 4 digits' } }}
              render={({ field }) => (
                <Input id="secondaryZipCode" type="text" disabled={!isEditing} size="small" {...field} />
              )}
            />
            {errors.secondaryZipCode && <Text className={mergeClasses(s.errorText)}>{errors.secondaryZipCode.message}</Text>}
          </div>
        </div>
      </form>
    </Card>
  );
}
