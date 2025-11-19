import { observer } from 'mobx-react-lite';
import { useContext, useState } from 'react';
import { Context } from '../../src/main';
import { useNavigate } from 'react-router-dom';
import { CreateAdvirtisment } from './CreateAdvertismentModal/Modal'

export const Advertisment = observer(() => {
    const navigate = useNavigate()
    const {store} = useContext(Context)

    const [openModal, setOpenModal] = useState(false)
    const [counter, setCounter] = useState(0);

    const handleCreateAd = () => {
        setCounter(prev => prev + 1)
    }

    const handleCloseAd = () => {
        setOpenModal(false)
    }

    if(store.isAuth){
        return(
            <div>
                <div>Список Ваших объявлений: {counter}</div>


                <button onClick={() => setOpenModal(true)}>Создать объявление</button>
                <CreateAdvirtisment
                    isOpen = {openModal}
                    isClose = {handleCloseAd}
                    onCreate= {handleCreateAd}
                />
                
            </div>
        )

        
    }

    return (
        <div>
            <div>Войдите в аккаунт</div>
            <button onClick={() => {navigate('/login')}}></button>
        </div>
    )
})