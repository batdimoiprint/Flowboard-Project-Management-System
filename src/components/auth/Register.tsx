import { useState, useEffect } from 'react';
import { Button, Input, Label, Card, Text, mergeClasses, Dropdown, Option, ProgressBar, Spinner } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { ArrowLeft24Regular, ArrowRight24Regular, Checkmark24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { authApi } from '../apis/auth';
import type { RegisterRequest } from '../apis/auth';
import {
    philippineAddressApi,
    emptyAddressData,
    type Region,
    type Province,
    type CityMunicipality,
    type Barangay,
    type AddressData
} from '../apis/philippineAddress';

type RegisterFormInputs = {
    // Personal Info
    userName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    contactNumber: string;
    secondaryContactNumber?: string;
    birthDate: string | null;
    email: string;
    password: string;
    verifyPassword: string;
    userIMG?: string | null;
    // Address
    address: AddressData;
    secondaryAddress?: AddressData;
};

const STEPS = [
    { id: 1, title: 'Personal Information' },
    { id: 2, title: 'Address' },
    { id: 3, title: 'Account Information' }
];

export default function Register() {
    const styles = mainLayoutStyles();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Address dropdown states - Primary
    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<CityMunicipality[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [isNCR, setIsNCR] = useState(false);

    // Address dropdown states - Secondary
    // const [showSecondaryAddress, setShowSecondaryAddress] = useState(false);
    const [secondaryProvinces, setSecondaryProvinces] = useState<Province[]>([]);
    const [secondaryCities, setSecondaryCities] = useState<CityMunicipality[]>([]);
    const [secondaryBarangays, setSecondaryBarangays] = useState<Barangay[]>([]);
    const [loadingSecondaryProvinces, setLoadingSecondaryProvinces] = useState(false);
    const [loadingSecondaryCities, setLoadingSecondaryCities] = useState(false);
    const [loadingSecondaryBarangays, setLoadingSecondaryBarangays] = useState(false);
    const [isSecondaryNCR, setIsSecondaryNCR] = useState(false);

    const { register, handleSubmit, watch, control, setValue, trigger, clearErrors, reset, getValues, formState: { errors, touchedFields, isSubmitted } } = useForm<RegisterFormInputs>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: {
            address: { ...emptyAddressData },
            secondaryAddress: { ...emptyAddressData }
        }
    });

    const watchAddress = watch('address');
    const watchSecondaryAddress = watch('secondaryAddress');

    // Load regions on mount
    useEffect(() => {
        const loadRegions = async () => {
            setLoadingRegions(true);
            try {
                const data = await philippineAddressApi.getRegions();
                setRegions(data);
            } catch (error) {
                console.error('Failed to load regions:', error);
            } finally {
                setLoadingRegions(false);
            }
        };
        loadRegions();
    }, []);

    // Load provinces when region changes (Primary)
    useEffect(() => {
        const loadProvinces = async () => {
            if (!watchAddress?.regionCode) {
                setProvinces([]);
                setCities([]);
                setBarangays([]);
                return;
            }

            const isNationalCapitalRegion = philippineAddressApi.isNCR(watchAddress.regionCode);
            setIsNCR(isNationalCapitalRegion);

            if (isNationalCapitalRegion) {
                // NCR has no provinces, load cities directly
                setLoadingCities(true);
                try {
                    const data = await philippineAddressApi.getCitiesMunicipalitiesByRegion(watchAddress.regionCode);
                    setCities(data);
                    setProvinces([]);
                } catch (error) {
                    console.error('Failed to load NCR cities:', error);
                } finally {
                    setLoadingCities(false);
                }
            } else {
                setLoadingProvinces(true);
                try {
                    const data = await philippineAddressApi.getProvincesByRegion(watchAddress.regionCode);
                    setProvinces(data);
                    setCities([]);
                    setBarangays([]);
                } catch (error) {
                    console.error('Failed to load provinces:', error);
                } finally {
                    setLoadingProvinces(false);
                }
            }
        };
        loadProvinces();
    }, [watchAddress?.regionCode]);

    // Load cities when province changes (Primary)
    useEffect(() => {
        const loadCities = async () => {
            if (!watchAddress?.provinceCode || isNCR) {
                if (!isNCR) {
                    setCities([]);
                    setBarangays([]);
                }
                return;
            }

            setLoadingCities(true);
            try {
                const data = await philippineAddressApi.getCitiesMunicipalitiesByProvince(watchAddress.provinceCode);
                setCities(data);
                setBarangays([]);
            } catch (error) {
                console.error('Failed to load cities:', error);
            } finally {
                setLoadingCities(false);
            }
        };
        loadCities();
    }, [watchAddress?.provinceCode, isNCR]);

    // Load barangays when city changes (Primary)
    useEffect(() => {
        const loadBarangays = async () => {
            if (!watchAddress?.cityMunicipalityCode) {
                setBarangays([]);
                return;
            }

            setLoadingBarangays(true);
            try {
                const data = await philippineAddressApi.getBarangaysByCityMunicipality(watchAddress.cityMunicipalityCode);
                setBarangays(data);
            } catch (error) {
                console.error('Failed to load barangays:', error);
            } finally {
                setLoadingBarangays(false);
            }
        };
        loadBarangays();
    }, [watchAddress?.cityMunicipalityCode]);

    // Load provinces when region changes (Secondary)
    useEffect(() => {
        const loadSecondaryProvinces = async () => {
            if (!watchSecondaryAddress?.regionCode) {
                setSecondaryProvinces([]);
                setSecondaryCities([]);
                setSecondaryBarangays([]);
                return;
            }

            const isNationalCapitalRegion = philippineAddressApi.isNCR(watchSecondaryAddress.regionCode);
            setIsSecondaryNCR(isNationalCapitalRegion);

            if (isNationalCapitalRegion) {
                setLoadingSecondaryCities(true);
                try {
                    const data = await philippineAddressApi.getCitiesMunicipalitiesByRegion(watchSecondaryAddress.regionCode);
                    setSecondaryCities(data);
                    setSecondaryProvinces([]);
                } catch (error) {
                    console.error('Failed to load NCR cities:', error);
                } finally {
                    setLoadingSecondaryCities(false);
                }
            } else {
                setLoadingSecondaryProvinces(true);
                try {
                    const data = await philippineAddressApi.getProvincesByRegion(watchSecondaryAddress.regionCode);
                    setSecondaryProvinces(data);
                    setSecondaryCities([]);
                    setSecondaryBarangays([]);
                } catch (error) {
                    console.error('Failed to load provinces:', error);
                } finally {
                    setLoadingSecondaryProvinces(false);
                }
            }
        };
        loadSecondaryProvinces();
    }, [watchSecondaryAddress?.regionCode]);

    // Load cities when province changes (Secondary)
    useEffect(() => {
        const loadSecondaryCities = async () => {
            if (!watchSecondaryAddress?.provinceCode || isSecondaryNCR) {
                if (!isSecondaryNCR) {
                    setSecondaryCities([]);
                    setSecondaryBarangays([]);
                }
                return;
            }

            setLoadingSecondaryCities(true);
            try {
                const data = await philippineAddressApi.getCitiesMunicipalitiesByProvince(watchSecondaryAddress.provinceCode);
                setSecondaryCities(data);
                setSecondaryBarangays([]);
            } catch (error) {
                console.error('Failed to load cities:', error);
            } finally {
                setLoadingSecondaryCities(false);
            }
        };
        loadSecondaryCities();
    }, [watchSecondaryAddress?.provinceCode, isSecondaryNCR]);

    // Load barangays when city changes (Secondary)
    useEffect(() => {
        const loadSecondaryBarangays = async () => {
            if (!watchSecondaryAddress?.cityMunicipalityCode) {
                setSecondaryBarangays([]);
                return;
            }

            setLoadingSecondaryBarangays(true);
            try {
                const data = await philippineAddressApi.getBarangaysByCityMunicipality(watchSecondaryAddress.cityMunicipalityCode);
                setSecondaryBarangays(data);
            } catch (error) {
                console.error('Failed to load barangays:', error);
            } finally {
                setLoadingSecondaryBarangays(false);
            }
        };
        loadSecondaryBarangays();
    }, [watchSecondaryAddress?.cityMunicipalityCode]);

    // Validate current step before moving to next
    const validateCurrentStep = async (): Promise<boolean> => {
        switch (currentStep) {
            case 1:
                return await trigger(['firstName', 'middleName', 'lastName', 'contactNumber', 'birthDate']);
            case 2: {
                // Only validate primary address required fields, secondary address is optional
                const primaryAddressFields: ('address.regionCode' | 'address.cityMunicipalityCode' | 'address.barangayCode' | 'address.streetAddress' | 'address.provinceCode')[] = [
                    'address.regionCode',
                    'address.cityMunicipalityCode',
                    'address.barangayCode',
                    'address.streetAddress'
                ];
                // Only validate province if not NCR
                if (!isNCR) {
                    primaryAddressFields.push('address.provinceCode');
                }
                return await trigger(primaryAddressFields);
            }
            case 3:
                return await trigger(['userName', 'email', 'password', 'verifyPassword']);
            default:
                return true;
        }
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid && currentStep < STEPS.length) {
            // Clear errors for the next step to avoid showing premature validation errors
            const nextStep = currentStep + 1;
            if (nextStep === 3) {
                clearErrors(['userName', 'email', 'password', 'verifyPassword']);
            }
            setCurrentStep(nextStep);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Clear any errors for the active step when changing steps so stale errors don't show
    useEffect(() => {
        switch (currentStep) {
            case 1:
                clearErrors(['firstName', 'middleName', 'lastName', 'contactNumber', 'birthDate']);
                reset(getValues(), { keepValues: true, keepTouched: false, keepDirty: true, keepErrors: false });
                break;
            case 2:
                clearErrors(['address.regionCode', 'address.provinceCode', 'address.cityMunicipalityCode', 'address.barangayCode', 'address.streetAddress']);
                reset(getValues(), { keepValues: true, keepTouched: false, keepDirty: true, keepErrors: false });
                break;
            case 3:
                clearErrors(['userName', 'email', 'password', 'verifyPassword']);
                // Reset touched state for the step fields so they don't immediately show errors
                reset(getValues(), { keepValues: true, keepTouched: false, keepDirty: true, keepErrors: false });
                break;
            default:
                break;
        }
    }, [currentStep, clearErrors, reset, getValues]);

    const onSubmit = async (data: RegisterFormInputs) => {
        setFormError('');
        setLoading(true);

        const payload: RegisterRequest = {
            userName: data.userName,
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            contactNumber: data.contactNumber,
            secondaryContactNumber: data.secondaryContactNumber || null,
            birthDate: data.birthDate || '',
            userIMG: null,
            email: data.email,
            password: data.password,
            address: data.address,
            // secondaryAddress: showSecondaryAddress ? data.secondaryAddress : null
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

    // Helper to handle region selection
    const handleRegionChange = (regionCode: string, isSecondary = false) => {
        const region = regions.find(r => r.code === regionCode);
        const prefix = isSecondary ? 'secondaryAddress' : 'address';

        if (region) {
            setValue(`${prefix}.region` as keyof RegisterFormInputs, region.name);
            setValue(`${prefix}.regionCode` as keyof RegisterFormInputs, region.code);
        }
        // Reset dependent fields
        setValue(`${prefix}.province` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.provinceCode` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.cityMunicipality` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.cityMunicipalityCode` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.barangay` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.barangayCode` as keyof RegisterFormInputs, '');
    };

    // Helper to handle province selection
    const handleProvinceChange = (provinceCode: string, isSecondary = false) => {
        const provinceList = isSecondary ? secondaryProvinces : provinces;
        const province = provinceList.find(p => p.code === provinceCode);
        const prefix = isSecondary ? 'secondaryAddress' : 'address';

        if (province) {
            setValue(`${prefix}.province` as keyof RegisterFormInputs, province.name);
            setValue(`${prefix}.provinceCode` as keyof RegisterFormInputs, province.code);
        }
        // Reset dependent fields
        setValue(`${prefix}.cityMunicipality` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.cityMunicipalityCode` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.barangay` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.barangayCode` as keyof RegisterFormInputs, '');
    };

    // Helper to handle city selection
    const handleCityChange = (cityCode: string, isSecondary = false) => {
        const cityList = isSecondary ? secondaryCities : cities;
        const city = cityList.find(c => c.code === cityCode);
        const prefix = isSecondary ? 'secondaryAddress' : 'address';

        if (city) {
            setValue(`${prefix}.cityMunicipality` as keyof RegisterFormInputs, city.name);
            setValue(`${prefix}.cityMunicipalityCode` as keyof RegisterFormInputs, city.code);
        }
        // Reset dependent fields
        setValue(`${prefix}.barangay` as keyof RegisterFormInputs, '');
        setValue(`${prefix}.barangayCode` as keyof RegisterFormInputs, '');
    };

    // Helper to handle barangay selection
    const handleBarangayChange = (barangayCode: string, isSecondary = false) => {
        const barangayList = isSecondary ? secondaryBarangays : barangays;
        const barangay = barangayList.find(b => b.code === barangayCode);
        const prefix = isSecondary ? 'secondaryAddress' : 'address';

        if (barangay) {
            setValue(`${prefix}.barangay` as keyof RegisterFormInputs, barangay.name);
            setValue(`${prefix}.barangayCode` as keyof RegisterFormInputs, barangay.code);
        }
    };

    const renderStepIndicator = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1
                        }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: step.id <= currentStep ? '#0078d4' : '#e0e0e0',
                                color: step.id <= currentStep ? 'white' : '#666',
                                fontWeight: 'bold',
                                marginBottom: '4px'
                            }}
                        >
                            {step.id < currentStep ? <Checkmark24Regular /> : step.id}
                        </div>
                        <Text size={200} style={{ textAlign: 'center' }}>{step.title}</Text>
                    </div>
                ))}
            </div>
            <ProgressBar value={(currentStep - 1) / (STEPS.length - 1)} />
        </div>
    );

    const renderPersonalInfoStep = () => (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Personal Information</div>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <Label htmlFor="firstName">First Name *</Label>
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
                    {errors.firstName && (touchedFields.firstName || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.firstName.message}</Text>
                    )}
                </div>
                <div className={styles.formField}>
                    <Label htmlFor="middleName">Middle Name *</Label>
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
                    {errors.middleName && (touchedFields.middleName || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.middleName.message}</Text>
                    )}
                </div>
                <div className={styles.formField}>
                    <Label htmlFor="lastName">Last Name *</Label>
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
                    {errors.lastName && (touchedFields.lastName || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.lastName.message}</Text>
                    )}
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="+639123456789"
                        autoComplete="tel"
                        maxLength={13}
                        {...register('contactNumber', {
                            required: 'Contact number is required',
                            maxLength: { value: 13, message: 'Contact number must not exceed 13 characters' },
                            pattern: {
                                value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                message: 'Please enter a valid phone number'
                            }
                        })}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            input.value = input.value.replace(/[^0-9+]/g, '');
                        }}
                    />
                    {errors.contactNumber && (touchedFields.contactNumber || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.contactNumber.message}</Text>
                    )}
                </div>
                <div className={styles.formField}>
                    <Label htmlFor="secondaryContactNumber">Secondary Contact Number</Label>
                    <Input
                        id="secondaryContactNumber"
                        type="tel"
                        placeholder="+639123456789"
                        autoComplete="tel"
                        maxLength={13}
                        {...register('secondaryContactNumber', {
                            maxLength: { value: 13, message: 'Contact number must not exceed 13 characters' },
                            pattern: {
                                value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                message: 'Please enter a valid phone number'
                            }
                        })}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            input.value = input.value.replace(/[^0-9+]/g, '');
                        }}
                    />
                    {errors.secondaryContactNumber && (touchedFields.secondaryContactNumber || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.secondaryContactNumber.message}</Text>
                    )}
                </div>
                <div className={styles.formField}>
                    <Label htmlFor="birthDate">Birth Date *</Label>
                    <Controller
                        name="birthDate"
                        control={control}
                        rules={{
                            required: 'Birthdate is required',
                            validate: (value) => {
                                if (!value) return 'Birthdate is required';
                                const birthDate = new Date(value);
                                const today = new Date();
                                const age = today.getFullYear() - birthDate.getFullYear();
                                const monthDiff = today.getMonth() - birthDate.getMonth();
                                const dayDiff = today.getDate() - birthDate.getDate();
                                const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
                                return actualAge >= 13 || 'You must be at least 13 years old to register';
                            }
                        }}
                        render={({ field }) => (
                            <DatePicker
                                id="birthDate"
                                placeholder="Select birth date"
                                value={field.value ? new Date(field.value) : null}
                                onSelectDate={(date) => field.onChange(date ? date.toISOString() : null)}
                                maxDate={new Date()}
                                formatDate={(date) => date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                style={{ width: '100%' }}
                            />
                        )}
                    />
                    {errors.birthDate && (touchedFields.birthDate || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.birthDate.message}</Text>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAddressFields = (isSecondary = false) => {
        const prefix = isSecondary ? 'secondaryAddress' : 'address';
        const currentAddress = isSecondary ? watchSecondaryAddress : watchAddress;
        const currentProvinces = isSecondary ? secondaryProvinces : provinces;
        const currentCities = isSecondary ? secondaryCities : cities;
        const currentBarangays = isSecondary ? secondaryBarangays : barangays;
        const currentIsNCR = isSecondary ? isSecondaryNCR : isNCR;
        const currentLoadingProvinces = isSecondary ? loadingSecondaryProvinces : loadingProvinces;
        const currentLoadingCities = isSecondary ? loadingSecondaryCities : loadingCities;
        const currentLoadingBarangays = isSecondary ? loadingSecondaryBarangays : loadingBarangays;

        // Build the combined address preview
        const addressParts: string[] = [];
        if (currentAddress?.streetAddress) addressParts.push(currentAddress.streetAddress);
        if (currentAddress?.barangay) addressParts.push(`Brgy. ${currentAddress.barangay}`);
        if (currentAddress?.cityMunicipality) addressParts.push(currentAddress.cityMunicipality);
        if (currentAddress?.province && !currentIsNCR) addressParts.push(currentAddress.province);
        if (currentAddress?.region) addressParts.push(currentAddress.region);
        const combinedAddress = addressParts.join(', ');

        return (
            <>
                {/* Row 1: Region and City/Municipality inline */}
                <div className={styles.formRow}>
                    <div className={styles.formField}>
                        <Label htmlFor={`${prefix}.region`}>Region {!isSecondary && '*'}</Label>
                        <Controller
                            name={`${prefix}.regionCode` as 'address.regionCode' | 'secondaryAddress.regionCode'}
                            control={control}
                            rules={!isSecondary ? { required: 'Region is required' } : undefined}
                            render={({ field }) => (
                                <Dropdown
                                    placeholder={loadingRegions ? 'Loading...' : 'Select Region'}
                                    disabled={loadingRegions}
                                    selectedOptions={field.value ? [field.value] : []}
                                    value={currentAddress?.region || ''}
                                    onOptionSelect={(_, data) => {
                                        handleRegionChange(data.optionValue as string, isSecondary);
                                    }}
                                >
                                    {regions.map((region) => (
                                        <Option key={region.code} value={region.code}>
                                            {region.name}
                                        </Option>
                                    ))}
                                </Dropdown>
                            )}
                        />
                        {!isSecondary && errors.address?.regionCode && (touchedFields.address?.regionCode || isSubmitted) && (
                            <Text className={styles.errorText}>{errors.address.regionCode.message}</Text>
                        )}
                    </div>
                    <div className={styles.formField} style={{ display: currentIsNCR ? 'none' : 'flex', flexDirection: 'column' }}>
                        <Label htmlFor={`${prefix}.province`}>Province {!isSecondary && !currentIsNCR && '*'}</Label>
                        <Controller
                            name={`${prefix}.provinceCode` as 'address.provinceCode' | 'secondaryAddress.provinceCode'}
                            control={control}
                            rules={!isSecondary && !currentIsNCR ? { required: 'Province is required' } : undefined}
                            render={({ field }) => (
                                <Dropdown
                                    placeholder={currentLoadingProvinces ? 'Loading...' : 'Select Province'}
                                    disabled={!currentAddress?.regionCode || currentLoadingProvinces || currentIsNCR}
                                    selectedOptions={field.value ? [field.value] : []}
                                    value={currentAddress?.province || ''}
                                    onOptionSelect={(_, data) => {
                                        handleProvinceChange(data.optionValue as string, isSecondary);
                                    }}
                                >
                                    {currentProvinces.map((province) => (
                                        <Option key={province.code} value={province.code}>
                                            {province.name}
                                        </Option>
                                    ))}
                                </Dropdown>
                            )}
                        />
                        {!isSecondary && !currentIsNCR && errors.address?.provinceCode && (touchedFields.address?.provinceCode || isSubmitted) && (
                            <Text className={styles.errorText}>{errors.address.provinceCode.message}</Text>
                        )}
                    </div>
                    <div className={styles.formField}>
                        <Label htmlFor={`${prefix}.cityMunicipality`}>City/Municipality {!isSecondary && '*'}</Label>
                        <Controller
                            name={`${prefix}.cityMunicipalityCode` as 'address.cityMunicipalityCode' | 'secondaryAddress.cityMunicipalityCode'}
                            control={control}
                            rules={!isSecondary ? { required: 'City/Municipality is required' } : undefined}
                            render={({ field }) => (
                                <Dropdown
                                    placeholder={currentLoadingCities ? 'Loading...' : 'Select City/Municipality'}
                                    disabled={(!currentAddress?.regionCode || (!currentAddress?.provinceCode && !currentIsNCR)) || currentLoadingCities}
                                    selectedOptions={field.value ? [field.value] : []}
                                    value={currentAddress?.cityMunicipality || ''}
                                    onOptionSelect={(_, data) => {
                                        handleCityChange(data.optionValue as string, isSecondary);
                                    }}
                                >
                                    {currentCities.map((city) => (
                                        <Option key={city.code} value={city.code}>
                                            {city.name}
                                        </Option>
                                    ))}
                                </Dropdown>
                            )}
                        />
                        {!isSecondary && errors.address?.cityMunicipalityCode && (touchedFields.address?.cityMunicipalityCode || isSubmitted) && (
                            <Text className={styles.errorText}>{errors.address.cityMunicipalityCode.message}</Text>
                        )}
                    </div>
                </div>
                {/* Row 2: Barangay and Street Address inline */}
                <div className={styles.formRow}>
                    <div className={styles.formField}>
                        <Label htmlFor={`${prefix}.barangay`}>Barangay {!isSecondary && '*'}</Label>
                        <Controller
                            name={`${prefix}.barangayCode` as 'address.barangayCode' | 'secondaryAddress.barangayCode'}
                            control={control}
                            rules={!isSecondary ? { required: 'Barangay is required' } : undefined}
                            render={({ field }) => (
                                <Dropdown
                                    placeholder={currentLoadingBarangays ? 'Loading...' : 'Select Barangay'}
                                    disabled={!currentAddress?.cityMunicipalityCode || currentLoadingBarangays}
                                    selectedOptions={field.value ? [field.value] : []}
                                    value={currentAddress?.barangay || ''}
                                    onOptionSelect={(_, data) => {
                                        handleBarangayChange(data.optionValue as string, isSecondary);
                                    }}
                                >
                                    {currentBarangays.map((barangay) => (
                                        <Option key={barangay.code} value={barangay.code}>
                                            {barangay.name}
                                        </Option>
                                    ))}
                                </Dropdown>
                            )}
                        />
                        {!isSecondary && errors.address?.barangayCode && (touchedFields.address?.barangayCode || isSubmitted) && (
                            <Text className={styles.errorText}>{errors.address.barangayCode.message}</Text>
                        )}
                    </div>
                    <div className={styles.formField} style={{ flex: 2 }}>
                        <Label htmlFor={`${prefix}.streetAddress`}>Street Address {!isSecondary && '*'}</Label>
                        <Input
                            id={`${prefix}.streetAddress`}
                            type="text"
                            placeholder="123 Main Street, Building Name, Unit Number"
                            {...register(`${prefix}.streetAddress` as 'address.streetAddress' | 'secondaryAddress.streetAddress', {
                                required: !isSecondary ? 'Street address is required' : false,
                                maxLength: { value: 200, message: 'Street address must not exceed 200 characters' }
                            })}
                        />
                        {!isSecondary && errors.address?.streetAddress && (touchedFields.address?.streetAddress || isSubmitted) && (
                            <Text className={styles.errorText}>{errors.address.streetAddress.message}</Text>
                        )}
                    </div>
                </div>
                {/* Combined Address Preview */}
                {combinedAddress && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <Label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                            {isSecondary ? 'Secondary' : 'Primary'} Address:
                        </Label>
                        <Text style={{ color: '#333' }}>{combinedAddress}</Text>
                    </div>
                )}
            </>
        );
    };

    const renderAddressStep = () => (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Address</div>
            {loadingRegions ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px' }}>
                    <Spinner size="small" />
                    <Text>Loading address data...</Text>
                </div>
            ) : (
                renderAddressFields(false)
            )}
        </div>
    );

    const renderAccountInfoStep = () => (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Account Information</div>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <Label htmlFor="userName">Username *</Label>
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
                    {errors.userName && (touchedFields.userName || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.userName.message}</Text>
                    )}
                </div>
                <div className={styles.formField}>
                    <Label htmlFor="email">Email *</Label>
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
                    {errors.email && (touchedFields.email || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.email.message}</Text>
                    )}
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <Label htmlFor="password">Password *</Label>
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
                    {errors.password && (touchedFields.password || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.password.message}</Text>
                    )}
                </div>
                <div className={styles.formField}>
                    <Label htmlFor="verifyPassword">Verify Password *</Label>
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
                    {errors.verifyPassword && (touchedFields.verifyPassword || isSubmitted) && (
                        <Text className={styles.errorText}>{errors.verifyPassword.message}</Text>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalInfoStep();
            case 2:
                return renderAddressStep();
            case 3:
                return renderAccountInfoStep();
            default:
                return null;
        }
    };

    return (
        <Card className={mergeClasses(styles.layoutPadding, styles.fullWidth)}>
            <div className={styles.formSection}>
                <h1 className={styles.pageTitle}>Create an account</h1>
            </div>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit(onSubmit)}>
                {renderCurrentStep()}

                {/* Error Message */}
                {formError && (
                    <Text className={styles.errorText} style={{ marginTop: '8px' }}>
                        {formError}
                    </Text>
                )}

                {/* Navigation Buttons */}
                <div className={styles.actionsRight} style={{ marginTop: '24px' }}>
                    {currentStep === 1 ? (
                        <Button
                            appearance="secondary"
                            onClick={() => navigate('/login')}
                            type="button"
                        >
                            Back to Login
                        </Button>
                    ) : (
                        <Button
                            appearance="secondary"
                            onClick={handlePrev}
                            type="button"
                            icon={<ArrowLeft24Regular />}
                        >
                            Previous
                        </Button>
                    )}

                    {currentStep < STEPS.length ? (
                        <Button
                            appearance="primary"
                            onClick={handleNext}
                            type="button"
                            icon={<ArrowRight24Regular />}
                            iconPosition="after"
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            appearance="primary"
                            type="submit"
                            disabled={loading}
                            icon={<Checkmark24Regular />}
                            iconPosition="after"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}
