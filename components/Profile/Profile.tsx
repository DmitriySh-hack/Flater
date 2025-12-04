import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../src/main';
import './Profile.css';
import { ChangePasswordModal } from './ModalPagePassword/ChangePasswordModal';
import { Avatar } from './Avatar/Avatar';

export const Profile = observer(() => {
    
    const [inputValue, setInputValue] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [firstVal, setFirstVal] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const navigate = useNavigate()
    const {store} = useContext(Context)

    const saveChanges = async (fieldName: 'firstName' | 'lastName' | 'email') => {
        try{ 
            const value = inputValue[fieldName]
            await store.updateProfile({ [fieldName]: value})
            setFirstVal(prev => ({...prev, [fieldName]: value}))
        }catch(error){
            console.error('Ошибка при сохранение', error)
        }
    }

    const cancelChanges = (fieldName: 'firstName' | 'lastName' | 'email') => {
        setInputValue(prev => ({...prev, [fieldName]: firstVal[fieldName]}))
    }

    useEffect(() => {
        if (store.user) {
            const userData = {
                firstName: store.user.firstName || '',
                lastName: store.user.lastName || '',
                email: store.user.email || ''
            }
            setInputValue(userData);
            setFirstVal(userData);
        }
    }, [store.user]);

    const handleInputChange = (fieldName: string, value: string) => {
        setInputValue(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleChangePassword = async (oldPassword: string, newPassword: string) => {
        try{
            await store.changePassword(oldPassword, newPassword);
            alert('Пароль умпешно изменен')
        }catch(error){
            alert('Ошибка')
            console.error(error)
        }
    }

    if(!store.isAuth){
        return (
            <div className='no-Auth-Profile'>
                <div style={{fontSize: '30px'}}>Вы не авторизованы!</div>
                <button onClick={() => navigate('/login')}>Войти</button>
                <button onClick={() => navigate('/registration')}>Зарегистрироваться</button>
            </div>
        )
    }

    if(store.isAuth && store.user.isActivated === false){
        return (
            <div>
                Подтвердите профиль на почте
                <button onClick={() => {store.logout()}}>Logout</button>
            </div>
        )
    }

    if(store.isAuth && store.user.isActivated === true){
        return (
        <div className='main-page'>

            <Avatar/>
            
            <div className='main-container'>
                <p style={{fontWeight: 'bold', fontSize: '24px'}}>Добро пожаловать в профиль!</p>
                <div className='profile-form'>
                    <div className='first-name'>
                        <input type="text" value={inputValue.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                    </div>

                    <div className='last-name'>
                        <input type="text" value={inputValue.lastName} 
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                    </div>

                    <div className='email'>
                        <input type="text" value={inputValue.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}/>
                    </div>

                    
                        
                    <div className='down-buttons'>
                        <button style={{cursor: 'pointer'}} onClick={() => {setIsChangePasswordModalOpen(true)}}>Изменить пароль</button>
                        <button style={{cursor: 'pointer'}} onClick={() => {store.logout()}}>Выйти</button>
                    </div>    
                </div>
                        
                <div className='saveChangesProfile'><>
                    <button style={{cursor: 'pointer'}} onClick={() => {
                        saveChanges('firstName');
                        saveChanges('lastName');
                        saveChanges('email');
                    }}>Сохранить изменения</button>
                    <button style={{cursor: 'pointer'}} onClick={() => {
                        cancelChanges('firstName');
                        cancelChanges('lastName');
                        cancelChanges('email');
                    }}>Отменить изменения</button>
                        </>
                </div>

                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    isClose={() => setIsChangePasswordModalOpen(false)}
                    onChangePassword={handleChangePassword}
                />
            </div>
            
        </div>   
        )
    }

    return (
        <div>
            Profile Page
        </div>
    )
});

