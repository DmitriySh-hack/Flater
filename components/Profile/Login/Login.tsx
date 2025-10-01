import { useContext, useEffect, useState } from 'react';
import { Context } from '../../../src/main';
import { observer } from 'mobx-react-lite';

export const Login = observer(() => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const {store} = useContext(Context)

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth()
        }
    }, [])

    return (
        <div>
            <h1>{store.isAuth ? `Пользователь авторизован ${store.user.email}` : 'Авторизуйтесь!'}</h1>

            <input 
            onChange={e => setEmail(e.target.value)}
            value={email}
            type='text' 
            placeholder='Email' 
            />

            <input 
            onChange={e => setPassword(e.target.value)}
            value={password}
            type='text' 
            placeholder='Пароль'
            />

            <button onClick={() => store.login(email, password)}>Вход</button>
            <button onClick={() => store.registration(email, password)}>Регистрация</button>
        </div>
    )
});