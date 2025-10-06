import { useContext, useEffect } from 'react';
import { Context } from '../../src/main';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import  './Profile.css'

export const Profile = observer(() => {

    const navigate = useNavigate()
    
    const {store} = useContext(Context)

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth()
        }
    })

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
            <div>
                Добро пожаловать в профиль!
                <button onClick={() => {store.logout()}}>Logout</button>
            </div>
        )
    }

    return (
        <div>
            Profile Page
        </div>
    )
});
