import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../src/main';
import './Profile.css';
import { ChangePasswordModal } from './ModalPagePassword/ChangePasswordModal';

export const Profile = observer(() => {

    const [isEnable, setIsEnable] = useState(
        {
            firstName: false,
            lastName: false,
            email: false
        }
    );
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

    const enableItem = (fieldName: string) => {
        setFirstVal(prev => ({
            ...prev,
            [fieldName]: inputValue[fieldName as keyof typeof inputValue]
        }))
        
        setIsEnable(prev => ({
            ...prev,
            [fieldName]: true
        }))
    }

    const saveChanges = async (fieldName: 'firstName' | 'lastName' | 'email') => {
        try{ 
            const value = inputValue[fieldName]
            await store.updateProfile({ [fieldName]: value})
            setIsEnable(prev => ({...prev, [fieldName]: false}))
            setFirstVal(prev => ({...prev, [fieldName]: ''}))
        }catch(error){
            console.error('Ошибка при сохранение', error)
        }
    }

    const cancelChanges = (fieldName: 'firstName' | 'lastName' | 'email') => {
        setInputValue(prev => ({...prev, [fieldName]: firstVal[fieldName]}))
        setIsEnable(prev => ({...prev, [fieldName]: false}))
        setFirstVal(prev => ({...prev, [fieldName]: ''}))
    }

    useEffect(() => {
        if (store.user) {
            setInputValue({
                firstName: store.user.firstName || '',
                lastName: store.user.lastName || '',
                email: store.user.email || ''
            });
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

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth()
        }
    }, [])

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
            <>
                <div className='profile-form'>
                    Добро пожаловать в профиль!
                    <div className='first-name'>
                        <input type="text" value={inputValue.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEnable.firstName}
                        />
                        {!isEnable.firstName && (
                            <button onClick={() => enableItem('firstName')}>Изменить</button>
                        )}
                        {isEnable.firstName && (
                            <>
                                <button onClick={() => saveChanges('firstName')}>Сохранить</button>
                                <button onClick={() => cancelChanges('firstName')}>Отмена</button>
                            </>
                        )}
                    </div>

                    <div className='last-name'>
                        <input type="text" value={inputValue.lastName} 
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEnable.lastName}
                        style={{
                            backgroundColor: isEnable ? 'white' : '#f5f5f5'
                        }}
                        />
                        {!isEnable.lastName && (
                            <button onClick={() => enableItem('lastName')}>Изменить</button>
                        )}
                        {isEnable.lastName && (
                            <>
                                <button onClick={() => saveChanges('lastName')}>Сохранить</button>
                                <button onClick={() => cancelChanges('lastName')}>Отмена</button>
                            </>
                        )}
                    </div>

                    <div className='email'>
                        <input type="text" value={inputValue.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEnable.email}
                        style={{
                            backgroundColor: isEnable ? 'white' : '#f5f5f5'
                        }}/>
                        {!isEnable.email && (
                            <button onClick={() => enableItem('email')}>Изменить</button>
                        )}
                        {isEnable.email && (
                            <>
                                <button onClick={() => saveChanges('email')}>Сохранить</button>
                                <button onClick={() => cancelChanges('email')}>Отмена</button>
                            </>
                        )}
                    </div>

                    <button onClick={() => {setIsChangePasswordModalOpen(true)}}>Изменить пароль</button>

                    <button onClick={() => {store.logout()}}>Logout</button>
                </div>
                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    isClose={() => setIsChangePasswordModalOpen(false)}
                    onChangePassword={handleChangePassword}
                />
            </>
        )
    }

    return (
        <div>
            Profile Page
        </div>
    )
});

