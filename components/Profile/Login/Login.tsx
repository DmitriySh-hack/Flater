import { useContext, useEffect, useState } from 'react';
import { Context } from '../../../src/main';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import './Login.css'
import userLogImg from './user-login.png'

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
        <div className='form-container'>
            
            <img src={userLogImg} width='90'/>

            <div className='form-name'>
                Авторизироваться
            </div>

            <div className='active-form-part'>
                <input 
                style={{width:'350px', margin:'3px', borderRadius:'4px', border: 'none', paddingLeft:'5px'}}
                onChange={e => setEmail(e.target.value)}
                value={email}
                type='text' 
                placeholder='Email' 
                />

                <input 
                style={{width:'350px', margin:'3px', borderRadius:'4px', border: 'none', paddingLeft:'5px'}}
                onChange={e => setPassword(e.target.value)}
                value={password}
                type='password' 
                placeholder='Пароль'
                />

                <div className='login-button-container'>
                    <button onClick={async () => {
                        await store.login(email, password);
                        if (store.isAuth) {
                            navigator('/profile');
                        }
                    }}>Вход</button>
                    
                    <button onClick={() => navigator('/registration')}>Регистрация</button>
                </div>

                
            </div>
            
        </div>
    )
});