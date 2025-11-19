import { createContext, useContext } from 'react';

export const CounterContext = createContext(0)

export const useCounter = () => {
    const context = useContext(CounterContext);
    return context;
}