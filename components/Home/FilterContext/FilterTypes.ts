import { createContext } from 'react'

export interface FilterData{
    filters: {
        priceFrom?: number;
        priceTo?: number;
        city?: string;
        rooms?: number;
    };
    setFilters: (filters: Partial<FilterData['filters']>) => void;
    resetFilter: () => void;
}

export const FilterContext = createContext<FilterData | undefined>(undefined)