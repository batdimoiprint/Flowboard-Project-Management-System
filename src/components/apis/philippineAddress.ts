// Philippine Standard Geographic Code (PSGC) API
// Using the free PSGC API from https://psgc.gitlab.io/api/

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

export interface Region {
    code: string;
    name: string;
    regionName: string;
    islandGroupCode: string;
    psgc10DigitCode: string;
}

export interface Province {
    code: string;
    name: string;
    regionCode: string;
    islandGroupCode: string;
    psgc10DigitCode: string;
}

export interface CityMunicipality {
    code: string;
    name: string;
    oldName?: string;
    isCapital: boolean;
    isCity: boolean;
    isMunicipality: boolean;
    districtCode?: string;
    provinceCode?: string;
    regionCode: string;
    islandGroupCode: string;
    psgc10DigitCode: string;
}

export interface Barangay {
    code: string;
    name: string;
    oldName?: string;
    subMunicipalityCode?: string;
    cityCode?: string;
    municipalityCode?: string;
    districtCode?: string;
    provinceCode?: string;
    regionCode: string;
    islandGroupCode: string;
    psgc10DigitCode: string;
}

export interface AddressData {
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
}

export const philippineAddressApi = {
    /**
     * Get all regions
     */
    getRegions: async (): Promise<Region[]> => {
        try {
            const response = await fetch(`${PSGC_BASE_URL}/regions/`);
            if (!response.ok) throw new Error('Failed to fetch regions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching regions:', error);
            throw error;
        }
    },

    /**
     * Get all provinces for a region
     */
    getProvincesByRegion: async (regionCode: string): Promise<Province[]> => {
        try {
            const response = await fetch(`${PSGC_BASE_URL}/regions/${regionCode}/provinces/`);
            if (!response.ok) throw new Error('Failed to fetch provinces');
            return await response.json();
        } catch (error) {
            console.error('Error fetching provinces:', error);
            throw error;
        }
    },

    /**
     * Get all cities/municipalities for a province
     */
    getCitiesMunicipalitiesByProvince: async (provinceCode: string): Promise<CityMunicipality[]> => {
        try {
            const response = await fetch(`${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
            if (!response.ok) throw new Error('Failed to fetch cities/municipalities');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cities/municipalities:', error);
            throw error;
        }
    },

    /**
     * Get cities/municipalities directly under a region (for NCR, which has no provinces)
     */
    getCitiesMunicipalitiesByRegion: async (regionCode: string): Promise<CityMunicipality[]> => {
        try {
            const response = await fetch(`${PSGC_BASE_URL}/regions/${regionCode}/cities-municipalities/`);
            if (!response.ok) throw new Error('Failed to fetch cities/municipalities');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cities/municipalities:', error);
            throw error;
        }
    },

    /**
     * Get all barangays for a city/municipality
     */
    getBarangaysByCityMunicipality: async (cityMunicipalityCode: string): Promise<Barangay[]> => {
        try {
            // Try city endpoint first
            let response = await fetch(`${PSGC_BASE_URL}/cities/${cityMunicipalityCode}/barangays/`);
            
            if (!response.ok) {
                // Try municipality endpoint if city fails
                response = await fetch(`${PSGC_BASE_URL}/municipalities/${cityMunicipalityCode}/barangays/`);
            }
            
            if (!response.ok) throw new Error('Failed to fetch barangays');
            return await response.json();
        } catch (error) {
            console.error('Error fetching barangays:', error);
            throw error;
        }
    },

    /**
     * Get districts for NCR (special case)
     */
    getDistrictsByRegion: async (regionCode: string): Promise<Province[]> => {
        try {
            const response = await fetch(`${PSGC_BASE_URL}/regions/${regionCode}/districts/`);
            if (!response.ok) throw new Error('Failed to fetch districts');
            return await response.json();
        } catch (error) {
            console.error('Error fetching districts:', error);
            throw error;
        }
    },

    /**
     * Check if a region is NCR (National Capital Region)
     * NCR has districts instead of provinces
     */
    isNCR: (regionCode: string): boolean => {
        return regionCode === '130000000'; // NCR code
    },
};

export const emptyAddressData: AddressData = {
    region: '',
    regionCode: '',
    province: '',
    provinceCode: '',
    cityMunicipality: '',
    cityMunicipalityCode: '',
    barangay: '',
    barangayCode: '',
    streetAddress: '',
    zipCode: '',
};
