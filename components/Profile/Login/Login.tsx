import { useContext, useEffect, useState } from 'react';
import { Context } from '../../../src/main';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

export const Login = observer(() => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const navigator = useNavigate();

    const {store} = useContext(Context)

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth()
        }
    })

    return (
        <div>
            <input 
            onChange={e => setEmail(e.target.value)}
            value={email}
            type='text' 
            placeholder='Email' 
            />

            <input 
            onChange={e => setPassword(e.target.value)}
            value={password}
            type='password' 
            placeholder='Пароль'
            />

            <button onClick={async () => {
                await store.login(email, password);
                if (store.isAuth) {
                    navigator('/profile');
                }
             }}>Вход</button>
             
            <button onClick={() => navigator('/registration')}>Регистрация</button>
        </div>
    )
});