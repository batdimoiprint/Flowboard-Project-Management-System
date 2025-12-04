import { useState, useEffect } from 'react';
import { Button, Input, Label, Card, Text, Dropdown, Option, Spinner, ProgressBar, tokens } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { ArrowLeftRegular, ArrowRightRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { authApi } from '../apis/auth';
import type { RegisterRequest } from '../apis/auth';
import { 
    philippineAddressApi, 
    type Region, 
    type Province, 
    type CityMunicipality, 
    type Barangay,
    type AddressData 
} from '../apis/philippineAddress';

type RegisterFormInputs = {
    userName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    contactNumber: string;
    secondaryContactNumber: string;
    birthDate: string;
    email: string;
    password: string;
    verifyPassword: string;
    userIMG?: string | null;
    // Primary Address fields (required)
    region: string;
    province: string;
    cityMunicipality: string;
    barangay: string;
    streetAddress: string;
    zipCode: string;
    // Secondary Address fields (optional)
    secondaryRegion: string;
    secondaryProvince: string;
    secondaryCityMunicipality: string;
    secondaryBarangay: string;
    secondaryStreetAddress: string;
    secondaryZipCode: string;
};

const TOTAL_STEPS = 4;

const stepInfo = [
    { title: 'Account Setup', description: 'Create your login credentials' },
    { title: 'Personal Details', description: 'Tell us about yourself' },
    { title: 'Primary Address', description: 'Where can we reach you?' },
    { title: 'Secondary Address', description: 'Optional alternative address' },
];

export default function Register() {
    const styles = mainLayoutStyles();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    
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

    const { register, handleSubmit, watch, control, setValue, trigger, formState: { errors } } = useForm<RegisterFormInputs>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: {
            userName: '',
            email: '',
            password: '',
            verifyPassword: '',
            firstName: '',
            lastName: '',
            middleName: '',
            contactNumber: '',
            secondaryContactNumber: '',
            birthDate: '',
            region: '',
            province: '',
            cityMunicipality: '',
            barangay: '',
            streetAddress: '',
            zipCode: '',
            secondaryRegion: '',
            secondaryProvince: '',
            secondaryCityMunicipality: '',
            secondaryBarangay: '',
            secondaryStreetAddress: '',
            secondaryZipCode: ''
        }
    });

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

    // Load provinces when primary region changes
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
            setValue('province', '');
            setValue('cityMunicipality', '');
            setValue('barangay', '');
            setCitiesMunicipalities([]);
            setBarangays([]);

            try {
                // Check if NCR (has districts instead of provinces)
                const ncrCheck = philippineAddressApi.isNCR(regionData.code);
                setIsNCR(ncrCheck);

                if (ncrCheck) {
                    // For NCR, load cities directly
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
    }, [selectedRegion, regions, setValue]);

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
            setValue('cityMunicipality', '');
            setValue('barangay', '');
            setBarangays([]);

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
    }, [selectedProvince, provinces, isNCR, setValue]);

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
            setValue('barangay', '');

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
    }, [selectedCity, citiesMunicipalities, setValue]);

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
            setValue('secondaryProvince', '');
            setValue('secondaryCityMunicipality', '');
            setValue('secondaryBarangay', '');
            setSecondaryCitiesMunicipalities([]);
            setSecondaryBarangays([]);

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
    }, [selectedSecondaryRegion, regions, setValue]);

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
            setValue('secondaryCityMunicipality', '');
            setValue('secondaryBarangay', '');
            setSecondaryBarangays([]);

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
    }, [selectedSecondaryProvince, secondaryProvinces, isSecondaryNCR, setValue]);

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
            setValue('secondaryBarangay', '');

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
    }, [selectedSecondaryCity, secondaryCitiesMunicipalities, setValue]);

    // Field groups for step validation
    const stepFields: Record<number, (keyof RegisterFormInputs)[]> = {
        1: ['userName', 'email', 'password', 'verifyPassword'],
        2: ['firstName', 'lastName', 'middleName', 'contactNumber', 'birthDate'],
        3: ['region', 'province', 'cityMunicipality', 'barangay'],
        4: [] // Optional step, no required fields
    };

    const handleNext = async () => {
        const fieldsToValidate = stepFields[currentStep];
        
        // For step 3, handle NCR case where province isn't required
        const adjustedFields = currentStep === 3 && isNCR 
            ? fieldsToValidate.filter(f => f !== 'province')
            : fieldsToValidate;
        
        const isValid = await trigger(adjustedFields);
        
        if (isValid && currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const progressValue = currentStep / TOTAL_STEPS;

    const onSubmit = async (data: RegisterFormInputs) => {
        setFormError('');
        setLoading(true);

        // Build primary address data
        const regionData = regions.find(r => r.name === data.region);
        const provinceData = provinces.find(p => p.name === data.province);
        const cityData = citiesMunicipalities.find(c => c.name === data.cityMunicipality);
        const barangayData = barangays.find(b => b.name === data.barangay);

        const address: AddressData = {
            region: data.region,
            regionCode: regionData?.code || '',
            province: data.province,
            provinceCode: provinceData?.code || '',
            cityMunicipality: data.cityMunicipality,
            cityMunicipalityCode: cityData?.code || '',
            barangay: data.barangay,
            barangayCode: barangayData?.code || '',
            streetAddress: data.streetAddress,
            zipCode: data.zipCode
        };

        // Build secondary address data
        const secondaryRegionData = regions.find(r => r.name === data.secondaryRegion);
        const secondaryProvinceData = secondaryProvinces.find(p => p.name === data.secondaryProvince);
        const secondaryCityData = secondaryCitiesMunicipalities.find(c => c.name === data.secondaryCityMunicipality);
        const secondaryBarangayData = secondaryBarangays.find(b => b.name === data.secondaryBarangay);

        const secondaryAddress: AddressData = {
            region: data.secondaryRegion,
            regionCode: secondaryRegionData?.code || '',
            province: data.secondaryProvince,
            provinceCode: secondaryProvinceData?.code || '',
            cityMunicipality: data.secondaryCityMunicipality,
            cityMunicipalityCode: secondaryCityData?.code || '',
            barangay: data.secondaryBarangay,
            barangayCode: secondaryBarangayData?.code || '',
            streetAddress: data.secondaryStreetAddress,
            zipCode: data.secondaryZipCode
        };

        const payload: RegisterRequest = {
            userName: data.userName,
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            contactNumber: data.contactNumber,
            secondaryContactNumber: data.secondaryContactNumber || null,
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : '',
            email: data.email,
            password: data.password,
            userIMG: null,
            address: address.region ? address : null,
            secondaryAddress: secondaryAddress.region ? secondaryAddress : null
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
        <Card style={{ maxWidth: '800px', margin: '0 auto', padding: tokens.spacingHorizontalXXL }}>
            {/* Header with Progress */}
            <div style={{ marginBottom: tokens.spacingVerticalXL }}>
                <Text size={600} weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                    Create your account
                </Text>
                <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                    Step {currentStep} of {TOTAL_STEPS}: {stepInfo[currentStep - 1].title}
                </Text>
                <ProgressBar 
                    value={progressValue} 
                    thickness="large"
                    style={{ marginTop: tokens.spacingVerticalM }}
                />
                <Text size={200} style={{ color: tokens.colorNeutralForeground4, marginTop: tokens.spacingVerticalXS, display: 'block' }}>
                    {stepInfo[currentStep - 1].description}
                </Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Account Setup */}
                {currentStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="userName" required>Username</Label>
                                <Input
                                    id="userName"
                                    type="text"
                                    placeholder="Choose a unique username"
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

                            <div className={styles.formField}>
                                <Label htmlFor="email" required>Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Please enter a valid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <Text className={styles.errorText}>{errors.email.message}</Text>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="password" required>Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters'
                                        },
                                        validate: {
                                            hasUppercase: (value) => /[A-Z]/.test(value) || 'Must include an uppercase letter',
                                            hasLowercase: (value) => /[a-z]/.test(value) || 'Must include a lowercase letter',
                                            hasNumber: (value) => /\d/.test(value) || 'Must include a number',
                                            hasSpecial: (value) => /[^A-Za-z0-9]/.test(value) || 'Must include a special character'
                                        }
                                    })}
                                />
                                {errors.password && (
                                    <Text className={styles.errorText}>{errors.password.message}</Text>
                                )}
                                <Text size={200} style={{ color: tokens.colorNeutralForeground4 }}>
                                    Min 8 chars with uppercase, lowercase, number & special char
                                </Text>
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="verifyPassword" required>Confirm Password</Label>
                                <Input
                                    id="verifyPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
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
                )}

                {/* Step 2: Personal Details */}
                {currentStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="firstName" required>First Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="Juan"
                                    autoComplete="given-name"
                                    {...register('firstName', {
                                        required: 'First name is required',
                                        minLength: { value: 2, message: 'At least 2 characters' },
                                        maxLength: { value: 50, message: 'Max 50 characters' },
                                        pattern: {
                                            value: /^[a-zA-Z\s'-]+$/,
                                            message: 'Letters only'
                                        }
                                    })}
                                />
                                {errors.firstName && (
                                    <Text className={styles.errorText}>{errors.firstName.message}</Text>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="middleName" required>Middle Name</Label>
                                <Input
                                    id="middleName"
                                    type="text"
                                    placeholder="Santos"
                                    autoComplete="additional-name"
                                    {...register('middleName', {
                                        required: 'Middle name is required',
                                        minLength: { value: 1, message: 'At least 1 character' },
                                        maxLength: { value: 50, message: 'Max 50 characters' },
                                        pattern: {
                                            value: /^[a-zA-Z\s'-]+$/,
                                            message: 'Letters only'
                                        }
                                    })}
                                />
                                {errors.middleName && (
                                    <Text className={styles.errorText}>{errors.middleName.message}</Text>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="lastName" required>Last Name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Dela Cruz"
                                    autoComplete="family-name"
                                    {...register('lastName', {
                                        required: 'Last name is required',
                                        minLength: { value: 2, message: 'At least 2 characters' },
                                        maxLength: { value: 50, message: 'Max 50 characters' },
                                        pattern: {
                                            value: /^[a-zA-Z\s'-]+$/,
                                            message: 'Letters only'
                                        }
                                    })}
                                />
                                {errors.lastName && (
                                    <Text className={styles.errorText}>{errors.lastName.message}</Text>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="contactNumber" required>Contact Number</Label>
                                <Input
                                    id="contactNumber"
                                    type="tel"
                                    placeholder="+63 912 345 6789"
                                    autoComplete="tel"
                                    {...register('contactNumber', {
                                        required: 'Contact number is required',
                                        pattern: {
                                            value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                            message: 'Enter a valid phone number'
                                        }
                                    })}
                                />
                                {errors.contactNumber && (
                                    <Text className={styles.errorText}>{errors.contactNumber.message}</Text>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="secondaryContactNumber">Alternative Number</Label>
                                <Input
                                    id="secondaryContactNumber"
                                    type="tel"
                                    placeholder="Optional"
                                    autoComplete="tel"
                                    {...register('secondaryContactNumber', {
                                        pattern: {
                                            value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                            message: 'Enter a valid phone number'
                                        }
                                    })}
                                />
                                {errors.secondaryContactNumber && (
                                    <Text className={styles.errorText}>{errors.secondaryContactNumber.message}</Text>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="birthDate" required>Date of Birth</Label>
                                <Controller
                                    name="birthDate"
                                    control={control}
                                    rules={{
                                        required: 'Date of birth is required',
                                        validate: (value) => {
                                            if (!value) return 'Date of birth is required';
                                            const birthDate = new Date(value);
                                            const today = new Date();
                                            const age = today.getFullYear() - birthDate.getFullYear();
                                            const monthDiff = today.getMonth() - birthDate.getMonth();
                                            const dayDiff = today.getDate() - birthDate.getDate();
                                            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
                                            return actualAge >= 13 || 'You must be at least 13 years old';
                                        }
                                    }}
                                    render={({ field }) => (
                                        <DatePicker
                                            id="birthDate"
                                            placeholder="Select your birth date"
                                            value={field.value ? new Date(field.value) : null}
                                            onSelectDate={(date) => {
                                                field.onChange(date ? date.toISOString().split('T')[0] : '');
                                            }}
                                            maxDate={new Date()}
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                />
                                {errors.birthDate && (
                                    <Text className={styles.errorText}>{errors.birthDate.message}</Text>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Primary Address */}
                {currentStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isNCR ? '1fr' : '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="region" required>Region</Label>
                                <Controller
                                    name="region"
                                    control={control}
                                    rules={{ required: 'Region is required' }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id="region"
                                            placeholder={addressLoading.regions ? "Loading..." : "Select your region"}
                                            disabled={addressLoading.regions}
                                            selectedOptions={field.value ? [field.value] : []}
                                            onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
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
                                {errors.region && (
                                    <Text className={styles.errorText}>{errors.region.message}</Text>
                                )}
                            </div>

                            {!isNCR && (
                                <div className={styles.formField}>
                                    <Label htmlFor="province" required>Province</Label>
                                    <Controller
                                        name="province"
                                        control={control}
                                        rules={{ required: !isNCR ? 'Province is required' : false }}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="province"
                                                placeholder={
                                                    !selectedRegion 
                                                        ? "Select region first" 
                                                        : addressLoading.provinces 
                                                            ? "Loading..." 
                                                            : "Select your province"
                                                }
                                                disabled={!selectedRegion || addressLoading.provinces}
                                                selectedOptions={field.value ? [field.value] : []}
                                                onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
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
                                    {errors.province && (
                                        <Text className={styles.errorText}>{errors.province.message}</Text>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="cityMunicipality" required>City / Municipality</Label>
                                <Controller
                                    name="cityMunicipality"
                                    control={control}
                                    rules={{ required: 'City/Municipality is required' }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id="cityMunicipality"
                                            placeholder={
                                                isNCR
                                                    ? (!selectedRegion ? "Select region first" : addressLoading.cities ? "Loading..." : "Select city")
                                                    : (!selectedProvince ? "Select province first" : addressLoading.cities ? "Loading..." : "Select city")
                                            }
                                            disabled={isNCR ? !selectedRegion : !selectedProvince || addressLoading.cities}
                                            selectedOptions={field.value ? [field.value] : []}
                                            onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
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
                                {errors.cityMunicipality && (
                                    <Text className={styles.errorText}>{errors.cityMunicipality.message}</Text>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="barangay" required>Barangay</Label>
                                <Controller
                                    name="barangay"
                                    control={control}
                                    rules={{ required: 'Barangay is required' }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id="barangay"
                                            placeholder={
                                                !selectedCity 
                                                    ? "Select city first" 
                                                    : addressLoading.barangays 
                                                        ? "Loading..." 
                                                        : "Select barangay"
                                            }
                                            disabled={!selectedCity || addressLoading.barangays}
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
                                {errors.barangay && (
                                    <Text className={styles.errorText}>{errors.barangay.message}</Text>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="streetAddress">Street Address</Label>
                                <Input
                                    id="streetAddress"
                                    type="text"
                                    placeholder="House/Unit No., Street Name"
                                    autoComplete="street-address"
                                    {...register('streetAddress')}
                                />
                            </div>

                            <div className={styles.formField}>
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input
                                    id="zipCode"
                                    type="text"
                                    placeholder="1234"
                                    autoComplete="postal-code"
                                    {...register('zipCode', {
                                        pattern: {
                                            value: /^[0-9]{4}$/,
                                            message: '4 digits required'
                                        }
                                    })}
                                />
                                {errors.zipCode && (
                                    <Text className={styles.errorText}>{errors.zipCode.message}</Text>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Secondary Address (Optional) */}
                {currentStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalS }}>
                            Add an alternative address if needed. You can skip this step.
                        </Text>

                        <div style={{ display: 'grid', gridTemplateColumns: isSecondaryNCR || !selectedSecondaryRegion ? '1fr' : '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                            <div className={styles.formField}>
                                <Label htmlFor="secondaryRegion">Region</Label>
                                <Controller
                                    name="secondaryRegion"
                                    control={control}
                                    render={({ field }) => (
                                        <Dropdown
                                            id="secondaryRegion"
                                            placeholder={addressLoading.regions ? "Loading..." : "Select region"}
                                            disabled={addressLoading.regions}
                                            selectedOptions={field.value ? [field.value] : []}
                                            onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
                                        >
                                            {regions.map((region) => (
                                                <Option key={region.code} value={region.name}>
                                                    {region.name}
                                                </Option>
                                            ))}
                                        </Dropdown>
                                    )}
                                />
                            </div>

                            {!isSecondaryNCR && selectedSecondaryRegion && (
                                <div className={styles.formField}>
                                    <Label htmlFor="secondaryProvince">Province</Label>
                                    <Controller
                                        name="secondaryProvince"
                                        control={control}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="secondaryProvince"
                                                placeholder={
                                                    secondaryAddressLoading.provinces 
                                                        ? "Loading..." 
                                                        : "Select province"
                                                }
                                                disabled={secondaryAddressLoading.provinces}
                                                selectedOptions={field.value ? [field.value] : []}
                                                onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
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

                        {selectedSecondaryRegion && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                                <div className={styles.formField}>
                                    <Label htmlFor="secondaryCityMunicipality">City / Municipality</Label>
                                    <Controller
                                        name="secondaryCityMunicipality"
                                        control={control}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="secondaryCityMunicipality"
                                                placeholder={
                                                    secondaryAddressLoading.cities ? "Loading..." : "Select city"
                                                }
                                                disabled={isSecondaryNCR ? false : !selectedSecondaryProvince || secondaryAddressLoading.cities}
                                                selectedOptions={field.value ? [field.value] : []}
                                                onOptionSelect={(_, data) => field.onChange(data.optionValue || '')}
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

                                <div className={styles.formField}>
                                    <Label htmlFor="secondaryBarangay">Barangay</Label>
                                    <Controller
                                        name="secondaryBarangay"
                                        control={control}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="secondaryBarangay"
                                                placeholder={
                                                    !selectedSecondaryCity 
                                                        ? "Select city first" 
                                                        : secondaryAddressLoading.barangays 
                                                            ? "Loading..." 
                                                            : "Select barangay"
                                                }
                                                disabled={!selectedSecondaryCity || secondaryAddressLoading.barangays}
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
                        )}

                        {selectedSecondaryRegion && (
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacingHorizontalM }}>
                                <div className={styles.formField}>
                                    <Label htmlFor="secondaryStreetAddress">Street Address</Label>
                                    <Input
                                        id="secondaryStreetAddress"
                                        type="text"
                                        placeholder="House/Unit No., Street Name"
                                        autoComplete="street-address"
                                        {...register('secondaryStreetAddress')}
                                    />
                                </div>

                                <div className={styles.formField}>
                                    <Label htmlFor="secondaryZipCode">Zip Code</Label>
                                    <Input
                                        id="secondaryZipCode"
                                        type="text"
                                        placeholder="1234"
                                        autoComplete="postal-code"
                                        {...register('secondaryZipCode', {
                                            pattern: {
                                                value: /^[0-9]{4}$/,
                                                message: '4 digits required'
                                            }
                                        })}
                                    />
                                    {errors.secondaryZipCode && (
                                        <Text className={styles.errorText}>{errors.secondaryZipCode.message}</Text>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {formError && (
                    <Text className={styles.errorText} style={{ marginTop: tokens.spacingVerticalM, display: 'block' }}>
                        {formError}
                    </Text>
                )}

                {/* Navigation Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: tokens.spacingVerticalXL,
                    paddingTop: tokens.spacingVerticalM,
                    borderTop: `1px solid ${tokens.colorNeutralStroke1}`
                }}>
                    <div>
                        {currentStep === 1 ? (
                            <Button
                                appearance="subtle"
                                onClick={() => navigate('/login')}
                                type="button"
                            >
                                Already have an account? Sign in
                            </Button>
                        ) : (
                            <Button
                                appearance="secondary"
                                icon={<ArrowLeftRegular />}
                                onClick={handleBack}
                                type="button"
                            >
                                Back
                            </Button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                        {currentStep === TOTAL_STEPS ? (
                            <Button
                                appearance="primary"
                                icon={<CheckmarkRegular />}
                                iconPosition="after"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </Button>
                        ) : (
                            <Button
                                appearance="primary"
                                icon={<ArrowRightRegular />}
                                iconPosition="after"
                                onClick={handleNext}
                                type="button"
                            >
                                Continue
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Card>
    );
}
