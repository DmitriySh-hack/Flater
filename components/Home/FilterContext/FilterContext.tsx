import { useState, type ReactNode } from "react";
import type { FilterData } from './FilterTypes'
import { FilterContext } from "./FilterTypes";


export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [filters, setFiltersState] = useState<FilterData['filters']>({
        priceFrom: undefined,
        priceTo: undefined,
        city: undefined,
        rooms: undefined,
    });

    const setFilters = (newFilter: Partial<FilterData['filters']>) => {
        setFiltersState(prev => ({...prev, ...newFilter}))
    }

    const resetFilter = () => {
        setFiltersState({
            priceFrom: undefined,
            priceTo: undefined,
            city: undefined,
            rooms: undefined,
        })
    }


    return (
        <FilterContext.Provider value={{filters, setFilters, resetFilter}}>
            {children}
        </FilterContext.Provider>
    )
}


