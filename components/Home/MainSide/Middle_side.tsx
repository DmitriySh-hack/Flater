import './Middle_side.css'
import filter from './filter.png'
import { useEffect, useState } from 'react'

function Middle_side(){
    const placeh = ['Hello!', 'Hi!', 'Bonjuor!'];
    const [placehState, setPlacehState] = useState(0);
    

    useEffect(() => {
        let currentIndex = 0;

        const intervale = setInterval(() => {
            currentIndex = (currentIndex + 1) % placeh.length;
            setPlacehState(currentIndex);
        }, 2000)

        return () => clearInterval(intervale);
    },[placeh.length]);

    const placeholder = placeh[placehState];

    return (
        <div>
            <div className="searchTheFlat">
                <input style={{width: '1200px', height: '40px', marginRight: '10px', fontSize: '19px'}} placeholder={placeholder}/>
                <button style={{cursor: 'pointer'}}><img src={filter} style={{width: '30px'}}/></button>
            </div>
        </div>
    )
}

export default Middle_side