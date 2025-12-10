import { Modal } from '../../Profile/ModalPagePassword/Modal'
//import { Context } from '../../../src/main';
//import { useContext } from 'react'
import type { IADVERTISMENT } from '../../models/IAdventisment';

export const ModalInfo = ({
    isOpen,
    isClose,
    advertisement
} : {
    isOpen: boolean,
    isClose: () => void,
    advertisement: IADVERTISMENT | null;
}) => {
    
    //const {store} = useContext(Context)

    const getSellerName = () => {
        return advertisement?.user?.firstName 
            ? `${advertisement.user.firstName} ${advertisement.user.lastName || ''}`
            : "Продавец";
    }

    const getEmail = () => {
        return advertisement?.user?.email
    }

    return(
        <Modal isOpen={isOpen} isClose={isClose}>
            <h2>Связь с продавцом</h2>
            
            <div className='infoContaoner'>
                <div className='info-name'>{getSellerName()}</div>
                <div className='info-email'>{getEmail()}</div>
            </div>
        </Modal>
    )
    
}