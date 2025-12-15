import { useState, useEffect } from 'react'
import filter from '../Home/MainSide/filter.png'
import { SearchModal } from './SearchModal';

interface SearchProps {
    onSearch: (query: string) => void;
    searchValue: string;
}

function Search({onSearch, searchValue} : SearchProps){
    const placeh = ['Hello!', 'Hi!', 'Bonjuor!'];
    const [placehState, setPlacehState] = useState(0);
    const [inputValue, setInputValue] = useState(searchValue || '');

    const [modalIsOpen, setModalIsOpen] = useState(false)

    const placeholder = placeh[placehState];

    useEffect(() => {
            let currentIndex = 0;
    
            const intervale = setInterval(() => {
                currentIndex = (currentIndex + 1) % placeh.length;
                setPlacehState(currentIndex);
            }, 2000)
    
            return () => clearInterval(intervale);
        },[placeh.length]);

    useEffect(() => {
        setInputValue(searchValue || '');
    }, [searchValue]);

    const handleFilter = () => {
        setModalIsOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        // Вызываем функцию поиска при каждом изменении
        if (onSearch) {
            onSearch(value);
        }
    }

    return (
        <>
            <div className="search-section">
                <input 
                    className="search-input"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <button className="filter-button" onClick={handleFilter}>
                    <img width="20px" src={filter} alt="Фильтр" />
                </button>

                <SearchModal
                    isOpen={modalIsOpen}
                    isClose={() => {setModalIsOpen(false)}}
                />
            </div>
        </>
    )
}

export default Search