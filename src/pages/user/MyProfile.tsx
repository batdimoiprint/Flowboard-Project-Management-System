import { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Label, Text, Avatar, tokens, Dropdown, Option, Spinner } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { Camera24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useForm, Controller } from 'react-hook-form';
import { useUser } from '../../hooks/useUser';
import { usersApi } from '../../components/apis/users';
import type { UserUpdateRequest } from '../../components/apis/users';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';
import {
  philippineAddressApi,
  type Region,
  type Province,
  type CityMunicipality,
  type Barangay,
  type AddressData,
} from '../../components/apis/philippineAddress';

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
  province: string;
  cityMunicipality: string;
  barangay: string;
  streetAddress: string;
  zipCode: string;
  // Secondary Address fields
  secondaryRegion: string;
  secondaryProvince: string;
  secondaryCityMunicipality: string;
  secondaryBarangay: string;
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

  // Primary Address state
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [addressLoading, setAddressLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false
  });
  const [isNCR, setIsNCR] = useState(false);

  // Secondary Address state
  const [secondaryProvinces, setSecondaryProvinces] = useState<Province[]>([]);
  const [secondaryCitiesMunicipalities, setSecondaryCitiesMunicipalities] = useState<CityMunicipality[]>([]);
  const [secondaryBarangays, setSecondaryBarangays] = useState<Barangay[]>([]);
  const [secondaryAddressLoading, setSecondaryAddressLoading] = useState({
    provinces: false,
    cities: false,
    barangays: false
  });
  const [isSecondaryNCR, setIsSecondaryNCR] = useState(false);

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
      province: userCtx?.user?.address?.province || '',
      cityMunicipality: userCtx?.user?.address?.cityMunicipality || '',
      barangay: userCtx?.user?.address?.barangay || '',
      streetAddress: userCtx?.user?.address?.streetAddress || '',
      zipCode: userCtx?.user?.address?.zipCode || '',
      secondaryRegion: userCtx?.user?.secondaryAddress?.region || '',
      secondaryProvince: userCtx?.user?.secondaryAddress?.province || '',
      secondaryCityMunicipality: userCtx?.user?.secondaryAddress?.cityMunicipality || '',
      secondaryBarangay: userCtx?.user?.secondaryAddress?.barangay || '',
      secondaryStreetAddress: userCtx?.user?.secondaryAddress?.streetAddress || '',
      secondaryZipCode: userCtx?.user?.secondaryAddress?.zipCode || '',
    },
    mode: 'onBlur',
  });

  const currentPasswordValue = watch('currentPassword');
  const newPasswordValue = watch('newPassword');
  const confirmPasswordValue = watch('confirmPassword');
  
  // Watch primary address fields for cascading dropdowns
  const selectedRegion = watch('region');
  const selectedProvince = watch('province');
  const selectedCity = watch('cityMunicipality');

  // Watch secondary address fields for cascading dropdowns
  const selectedSecondaryRegion = watch('secondaryRegion');
  const selectedSecondaryProvince = watch('secondaryProvince');
  const selectedSecondaryCity = watch('secondaryCityMunicipality');

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      setAddressLoading(prev => ({ ...prev, regions: true }));
      try {
        const data = await philippineAddressApi.getRegions();
        setRegions(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load regions:', error);
      } finally {
        setAddressLoading(prev => ({ ...prev, regions: false }));
      }
    };
    loadRegions();
  }, []);

  // Load provinces when region changes (only if editing or loading initial data)
  useEffect(() => {
    if (!selectedRegion) {
      setProvinces([]);
      setCitiesMunicipalities([]);
      setBarangays([]);
      return;
    }

    const regionData = regions.find(r => r.name === selectedRegion);
    if (!regionData) return;

    const loadProvinces = async () => {
      setAddressLoading(prev => ({ ...prev, provinces: true }));
      
      try {
        const ncrCheck = philippineAddressApi.isNCR(regionData.code);
        setIsNCR(ncrCheck);

        if (ncrCheck) {
          const cities = await philippineAddressApi.getCitiesMunicipalitiesByRegion(regionData.code);
          setCitiesMunicipalities(cities.sort((a, b) => a.name.localeCompare(b.name)));
          setProvinces([]);
        } else {
          const data = await philippineAddressApi.getProvincesByRegion(regionData.code);
          setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (error) {
        console.error('Failed to load provinces:', error);
      } finally {
        setAddressLoading(prev => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, [selectedRegion, regions]);

  // Load cities/municipalities when province changes
  useEffect(() => {
    if (!selectedProvince || isNCR) {
      if (!isNCR) {
        setCitiesMunicipalities([]);
        setBarangays([]);
      }
      return;
    }

    const provinceData = provinces.find(p => p.name === selectedProvince);
    if (!provinceData) return;

    const loadCities = async () => {
      setAddressLoading(prev => ({ ...prev, cities: true }));

      try {
        const data = await philippineAddressApi.getCitiesMunicipalitiesByProvince(provinceData.code);
        setCitiesMunicipalities(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load cities/municipalities:', error);
      } finally {
        setAddressLoading(prev => ({ ...prev, cities: false }));
      }
    };
    loadCities();
  }, [selectedProvince, provinces, isNCR]);

  // Load barangays when city/municipality changes
  useEffect(() => {
    if (!selectedCity) {
      setBarangays([]);
      return;
    }

    const cityData = citiesMunicipalities.find(c => c.name === selectedCity);
    if (!cityData) return;

    const loadBarangays = async () => {
      setAddressLoading(prev => ({ ...prev, barangays: true }));

      try {
        const data = await philippineAddressApi.getBarangaysByCityMunicipality(cityData.code);
        setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load barangays:', error);
      } finally {
        setAddressLoading(prev => ({ ...prev, barangays: false }));
      }
    };
    loadBarangays();
  }, [selectedCity, citiesMunicipalities]);

  // Secondary Address Effects
  // Load secondary provinces when secondary region changes
  useEffect(() => {
    if (!selectedSecondaryRegion) {
      setSecondaryProvinces([]);
      setSecondaryCitiesMunicipalities([]);
      setSecondaryBarangays([]);
      return;
    }

    const regionData = regions.find(r => r.name === selectedSecondaryRegion);
    if (!regionData) return;

    const loadSecondaryProvinces = async () => {
      setSecondaryAddressLoading(prev => ({ ...prev, provinces: true }));

      try {
        const ncrCheck = philippineAddressApi.isNCR(regionData.code);
        setIsSecondaryNCR(ncrCheck);

        if (ncrCheck) {
          const cities = await philippineAddressApi.getCitiesMunicipalitiesByRegion(regionData.code);
          setSecondaryCitiesMunicipalities(cities.sort((a, b) => a.name.localeCompare(b.name)));
          setSecondaryProvinces([]);
        } else {
          const data = await philippineAddressApi.getProvincesByRegion(regionData.code);
          setSecondaryProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (error) {
        console.error('Failed to load secondary provinces:', error);
      } finally {
        setSecondaryAddressLoading(prev => ({ ...prev, provinces: false }));
      }
    };
    loadSecondaryProvinces();
  }, [selectedSecondaryRegion, regions]);

  // Load secondary cities/municipalities when secondary province changes
  useEffect(() => {
    if (!selectedSecondaryProvince || isSecondaryNCR) {
      if (!isSecondaryNCR) {
        setSecondaryCitiesMunicipalities([]);
        setSecondaryBarangays([]);
      }
      return;
    }

    const provinceData = secondaryProvinces.find(p => p.name === selectedSecondaryProvince);
    if (!provinceData) return;

    const loadSecondaryCities = async () => {
      setSecondaryAddressLoading(prev => ({ ...prev, cities: true }));

      try {
        const data = await philippineAddressApi.getCitiesMunicipalitiesByProvince(provinceData.code);
        setSecondaryCitiesMunicipalities(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load secondary cities/municipalities:', error);
      } finally {
        setSecondaryAddressLoading(prev => ({ ...prev, cities: false }));
      }
    };
    loadSecondaryCities();
  }, [selectedSecondaryProvince, secondaryProvinces, isSecondaryNCR]);

  // Load secondary barangays when secondary city/municipality changes
  useEffect(() => {
    if (!selectedSecondaryCity) {
      setSecondaryBarangays([]);
      return;
    }

    const cityData = secondaryCitiesMunicipalities.find(c => c.name === selectedSecondaryCity);
    if (!cityData) return;

    const loadSecondaryBarangays = async () => {
      setSecondaryAddressLoading(prev => ({ ...prev, barangays: true }));

      try {
        const data = await philippineAddressApi.getBarangaysByCityMunicipality(cityData.code);
        setSecondaryBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load secondary barangays:', error);
      } finally {
        setSecondaryAddressLoading(prev => ({ ...prev, barangays: false }));
      }
    };
    loadSecondaryBarangays();
  }, [selectedSecondaryCity, secondaryCitiesMunicipalities]);

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
        province: userCtx.user.address?.province || '',
        cityMunicipality: userCtx.user.address?.cityMunicipality || '',
        barangay: userCtx.user.address?.barangay || '',
        streetAddress: userCtx.user.address?.streetAddress || '',
        zipCode: userCtx.user.address?.zipCode || '',
        secondaryRegion: userCtx.user.secondaryAddress?.region || '',
        secondaryProvince: userCtx.user.secondaryAddress?.province || '',
        secondaryCityMunicipality: userCtx.user.secondaryAddress?.cityMunicipality || '',
        secondaryBarangay: userCtx.user.secondaryAddress?.barangay || '',
        secondaryStreetAddress: userCtx.user.secondaryAddress?.streetAddress || '',
        secondaryZipCode: userCtx.user.secondaryAddress?.zipCode || '',
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

      const { 
        currentPassword, newPassword, confirmPassword, 
        region, province, cityMunicipality, barangay, streetAddress, zipCode,
        secondaryRegion, secondaryProvince, secondaryCityMunicipality, secondaryBarangay, secondaryStreetAddress, secondaryZipCode,
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
      const hasAddressData = region || province || cityMunicipality || barangay || streetAddress || zipCode;
      if (hasAddressData) {
        const regionData = regions.find(r => r.name === region);
        const provinceData = provinces.find(p => p.name === province);
        const cityData = citiesMunicipalities.find(c => c.name === cityMunicipality);
        const barangayData = barangays.find(b => b.name === barangay);

        const newAddress: AddressData = {
          region: region,
          regionCode: regionData?.code || '',
          province: province,
          provinceCode: provinceData?.code || '',
          cityMunicipality: cityMunicipality,
          cityMunicipalityCode: cityData?.code || '',
          barangay: barangay,
          barangayCode: barangayData?.code || '',
          streetAddress: streetAddress,
          zipCode: zipCode
        };

        // Check if address has changed
        const currentAddress = userCtx?.user?.address;
        const addressChanged = 
          newAddress.region !== (currentAddress?.region || '') ||
          newAddress.province !== (currentAddress?.province || '') ||
          newAddress.cityMunicipality !== (currentAddress?.cityMunicipality || '') ||
          newAddress.barangay !== (currentAddress?.barangay || '') ||
          newAddress.streetAddress !== (currentAddress?.streetAddress || '') ||
          newAddress.zipCode !== (currentAddress?.zipCode || '');

        if (addressChanged) {
          payload.address = newAddress;
        }
      }

      // Handle secondary address fields (optional)
      const hasSecondaryAddressData = secondaryRegion || secondaryProvince || secondaryCityMunicipality || secondaryBarangay || secondaryStreetAddress || secondaryZipCode;
      if (hasSecondaryAddressData) {
        const regionData = regions.find(r => r.name === secondaryRegion);
        const provinceData = secondaryProvinces.find(p => p.name === secondaryProvince);
        const cityData = secondaryCitiesMunicipalities.find(c => c.name === secondaryCityMunicipality);
        const barangayData = secondaryBarangays.find(b => b.name === secondaryBarangay);

        const newSecondaryAddress: AddressData = {
          region: secondaryRegion || '',
          regionCode: regionData?.code || '',
          province: secondaryProvince || '',
          provinceCode: provinceData?.code || '',
          cityMunicipality: secondaryCityMunicipality || '',
          cityMunicipalityCode: cityData?.code || '',
          barangay: secondaryBarangay || '',
          barangayCode: barangayData?.code || '',
          streetAddress: secondaryStreetAddress || '',
          zipCode: secondaryZipCode || ''
        };

        // Check if secondary address has changed
        const currentSecondaryAddress = userCtx?.user?.secondaryAddress;
        const secondaryAddressChanged = 
          newSecondaryAddress.region !== (currentSecondaryAddress?.region || '') ||
          newSecondaryAddress.province !== (currentSecondaryAddress?.province || '') ||
          newSecondaryAddress.cityMunicipality !== (currentSecondaryAddress?.cityMunicipality || '') ||
          newSecondaryAddress.barangay !== (currentSecondaryAddress?.barangay || '') ||
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
        province: updatedUser.address?.province || '',
        cityMunicipality: updatedUser.address?.cityMunicipality || '',
        barangay: updatedUser.address?.barangay || '',
        streetAddress: updatedUser.address?.streetAddress || '',
        zipCode: updatedUser.address?.zipCode || '',
        secondaryRegion: updatedUser.secondaryAddress?.region || '',
        secondaryProvince: updatedUser.secondaryAddress?.province || '',
        secondaryCityMunicipality: updatedUser.secondaryAddress?.cityMunicipality || '',
        secondaryBarangay: updatedUser.secondaryAddress?.barangay || '',
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
            <Label htmlFor="contactNumber">Contact Number *</Label>
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
            <Label htmlFor="secondaryContactNumber">Secondary Contact Number (Optional)</Label>
            <Controller
              control={control}
              name="secondaryContactNumber"
              rules={{
                pattern: {
                  value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                  message: 'Please enter a valid phone number'
                }
              }}
              render={({ field }) => (
                <Input id="secondaryContactNumber" type="tel" disabled={!isEditing} {...field} />
              )}
            />
            {errors.secondaryContactNumber && (
              <Text className={mergeClasses(s.errorText)}>{errors.secondaryContactNumber.message}</Text>
            )}
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
                  placeholder="Select your birth date"
                  value={field.value ? new Date(field.value) : null}
                  onSelectDate={(date) => {
                    field.onChange(date ? date.toISOString().split('T')[0] : '');
                  }}
                  disabled={!isEditing}
                  maxDate={new Date()}
                  style={{ width: '100%' }}
                />
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

        {/* Address Information */}
        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>Address Information</Text>
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="region">Region</Label>
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <Dropdown
                  id="region"
                  placeholder={addressLoading.regions ? "Loading regions..." : "Select Region"}
                  disabled={!isEditing || addressLoading.regions}
                  selectedOptions={field.value ? [field.value] : []}
                  onOptionSelect={(_, data) => {
                    field.onChange(data.optionValue || '');
                    // Clear dependent fields when region changes
                    setValue('province', '');
                    setValue('cityMunicipality', '');
                    setValue('barangay', '');
                  }}
                >
                  {regions.map((region) => (
                    <Option key={region.code} value={region.name}>
                      {region.name}
                    </Option>
                  ))}
                </Dropdown>
              )}
            />
            {addressLoading.regions && <Spinner size="tiny" />}
          </div>
          {!isNCR && (
            <div className={mergeClasses(s.formField)}>
              <Label htmlFor="province">Province</Label>
              <Controller
                control={control}
                name="province"
                render={({ field }) => (
                  <Dropdown
                    id="province"
                    placeholder={
                      !selectedRegion
                        ? "Select region first"
                        : addressLoading.provinces
                          ? "Loading provinces..."
                          : "Select Province"
                    }
                    disabled={!isEditing || !selectedRegion || addressLoading.provinces}
                    selectedOptions={field.value ? [field.value] : []}
                    onOptionSelect={(_, data) => {
                      field.onChange(data.optionValue || '');
                      // Clear dependent fields when province changes
                      setValue('cityMunicipality', '');
                      setValue('barangay', '');
                    }}
                  >
                    {provinces.map((province) => (
                      <Option key={province.code} value={province.name}>
                        {province.name}
                      </Option>
                    ))}
                  </Dropdown>
                )}
              />
              {addressLoading.provinces && <Spinner size="tiny" />}
            </div>
          )}
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="cityMunicipality">City / Municipality</Label>
            <Controller
              control={control}
              name="cityMunicipality"
              render={({ field }) => (
                <Dropdown
                  id="cityMunicipality"
                  placeholder={
                    isNCR
                      ? (!selectedRegion ? "Select region first" : addressLoading.cities ? "Loading..." : "Select City")
                      : (!selectedProvince ? "Select province first" : addressLoading.cities ? "Loading..." : "Select City/Municipality")
                  }
                  disabled={!isEditing || (isNCR ? !selectedRegion : !selectedProvince) || addressLoading.cities}
                  selectedOptions={field.value ? [field.value] : []}
                  onOptionSelect={(_, data) => {
                    field.onChange(data.optionValue || '');
                    // Clear dependent field when city changes
                    setValue('barangay', '');
                  }}
                >
                  {citiesMunicipalities.map((city) => (
                    <Option key={city.code} value={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Dropdown>
              )}
            />
            {addressLoading.cities && <Spinner size="tiny" />}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="barangay">Barangay</Label>
            <Controller
              control={control}
              name="barangay"
              render={({ field }) => (
                <Dropdown
                  id="barangay"
                  placeholder={
                    !selectedCity
                      ? "Select city first"
                      : addressLoading.barangays
                        ? "Loading barangays..."
                        : "Select Barangay"
                  }
                  disabled={!isEditing || !selectedCity || addressLoading.barangays}
                  selectedOptions={field.value ? [field.value] : []}
                  onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
                >
                  {barangays.map((barangay) => (
                    <Option key={barangay.code} value={barangay.name}>
                      {barangay.name}
                    </Option>
                  ))}
                </Dropdown>
              )}
            />
            {addressLoading.barangays && <Spinner size="tiny" />}
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="streetAddress">Street Address</Label>
            <Controller
              control={control}
              name="streetAddress"
              render={({ field }) => (
                <Input
                  id="streetAddress"
                  type="text"
                  placeholder="123 Main Street"
                  disabled={!isEditing}
                  {...field}
                />
              )}
            />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Controller
              control={control}
              name="zipCode"
              rules={{
                pattern: {
                  value: /^[0-9]{4}$/,
                  message: 'Zip code must be 4 digits'
                }
              }}
              render={({ field }) => (
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="1234"
                  disabled={!isEditing}
                  {...field}
                />
              )}
            />
            {errors.zipCode && (
              <Text className={mergeClasses(s.errorText)}>{errors.zipCode.message}</Text>
            )}
          </div>
        </div>

        {/* Secondary Address Information (Optional) */}
        <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>Secondary Address (Optional)</Text>
        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryRegion">Region</Label>
            <Controller
              control={control}
              name="secondaryRegion"
              render={({ field }) => (
                <Dropdown
                  id="secondaryRegion"
                  placeholder={addressLoading.regions ? "Loading regions..." : "Select Region"}
                  disabled={!isEditing || addressLoading.regions}
                  selectedOptions={field.value ? [field.value] : []}
                  onOptionSelect={(_, data) => {
                    field.onChange(data.optionValue || '');
                    // Clear dependent fields when region changes
                    setValue('secondaryProvince', '');
                    setValue('secondaryCityMunicipality', '');
                    setValue('secondaryBarangay', '');
                  }}
                >
                  {regions.map((region) => (
                    <Option key={region.code} value={region.name}>
                      {region.name}
                    </Option>
                  ))}
                </Dropdown>
              )}
            />
            {addressLoading.regions && <Spinner size="tiny" />}
          </div>
          {!isSecondaryNCR && (
            <div className={mergeClasses(s.formField)}>
              <Label htmlFor="secondaryProvince">Province</Label>
              <Controller
                control={control}
                name="secondaryProvince"
                render={({ field }) => (
                  <Dropdown
                    id="secondaryProvince"
                    placeholder={
                      !selectedSecondaryRegion
                        ? "Select region first"
                        : secondaryAddressLoading.provinces
                          ? "Loading provinces..."
                          : "Select Province"
                    }
                    disabled={!isEditing || !selectedSecondaryRegion || secondaryAddressLoading.provinces}
                    selectedOptions={field.value ? [field.value] : []}
                    onOptionSelect={(_, data) => {
                      field.onChange(data.optionValue || '');
                      // Clear dependent fields when province changes
                      setValue('secondaryCityMunicipality', '');
                      setValue('secondaryBarangay', '');
                    }}
                  >
                    {secondaryProvinces.map((province) => (
                      <Option key={province.code} value={province.name}>
                        {province.name}
                      </Option>
                    ))}
                  </Dropdown>
                )}
              />
              {secondaryAddressLoading.provinces && <Spinner size="tiny" />}
            </div>
          )}
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryCityMunicipality">City / Municipality</Label>
            <Controller
              control={control}
              name="secondaryCityMunicipality"
              render={({ field }) => (
                <Dropdown
                  id="secondaryCityMunicipality"
                  placeholder={
                    isSecondaryNCR
                      ? (!selectedSecondaryRegion ? "Select region first" : secondaryAddressLoading.cities ? "Loading..." : "Select City")
                      : (!selectedSecondaryProvince ? "Select province first" : secondaryAddressLoading.cities ? "Loading..." : "Select City/Municipality")
                  }
                  disabled={!isEditing || (isSecondaryNCR ? !selectedSecondaryRegion : !selectedSecondaryProvince) || secondaryAddressLoading.cities}
                  selectedOptions={field.value ? [field.value] : []}
                  onOptionSelect={(_, data) => {
                    field.onChange(data.optionValue || '');
                    // Clear dependent field when city changes
                    setValue('secondaryBarangay', '');
                  }}
                >
                  {secondaryCitiesMunicipalities.map((city) => (
                    <Option key={city.code} value={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Dropdown>
              )}
            />
            {secondaryAddressLoading.cities && <Spinner size="tiny" />}
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryBarangay">Barangay</Label>
            <Controller
              control={control}
              name="secondaryBarangay"
              render={({ field }) => (
                <Dropdown
                  id="secondaryBarangay"
                  placeholder={
                    !selectedSecondaryCity
                      ? "Select city first"
                      : secondaryAddressLoading.barangays
                        ? "Loading barangays..."
                        : "Select Barangay"
                  }
                  disabled={!isEditing || !selectedSecondaryCity || secondaryAddressLoading.barangays}
                  selectedOptions={field.value ? [field.value] : []}
                  onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
                >
                  {secondaryBarangays.map((barangay) => (
                    <Option key={barangay.code} value={barangay.name}>
                      {barangay.name}
                    </Option>
                  ))}
                </Dropdown>
              )}
            />
            {secondaryAddressLoading.barangays && <Spinner size="tiny" />}
          </div>
        </div>

        <div className={mergeClasses(s.formRow)}>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryStreetAddress">Street Address</Label>
            <Controller
              control={control}
              name="secondaryStreetAddress"
              render={({ field }) => (
                <Input
                  id="secondaryStreetAddress"
                  type="text"
                  placeholder="123 Main Street"
                  disabled={!isEditing}
                  {...field}
                />
              )}
            />
          </div>
          <div className={mergeClasses(s.formField)}>
            <Label htmlFor="secondaryZipCode">Zip Code</Label>
            <Controller
              control={control}
              name="secondaryZipCode"
              rules={{
                pattern: {
                  value: /^[0-9]{4}$/,
                  message: 'Zip code must be 4 digits'
                }
              }}
              render={({ field }) => (
                <Input
                  id="secondaryZipCode"
                  type="text"
                  placeholder="1234"
                  disabled={!isEditing}
                  {...field}
                />
              )}
            />
            {errors.secondaryZipCode && (
              <Text className={mergeClasses(s.errorText)}>{errors.secondaryZipCode.message}</Text>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
