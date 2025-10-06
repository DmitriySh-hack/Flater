import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../src/main';

export const Registration = () => {

    const navigator = useNavigate()

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')

    const { store } = useContext(Context);

    if(store.isAuth){
      return(
        <div>
            Вы успешно зарегистрировались!
            <button onClick={() => {navigator('/login')}}>Войти</button>
        </div>
      )  
    }

    return (
        <div>
            <div>
                <p>Имя:</p>
                <input 
                    placeholder="Имя"
                    onChange={e => setFirstName(e.target.value)}
                    value={firstName}
                />

                <p>Фамилия:</p>
                <input 
                    placeholder="Фамилия"
                    onChange={e => setLastName(e.target.value)}
                    value={lastName}
                />

                <p>Email:</p>
                <input 
                    placeholder="Email" 
                    onChange={e => setEmail(e.target.value)} 
                    value={email}
                />
                
                <p>Пароль:</p>
                <input 
                    placeholder="Пароль"
                    type='password'
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                />

                <button onClick={() => {
                    store.registration(email, password, firstName, lastName);
                    navigator('/login')
                }}>Создать аккаунт</button>
            </div>

            


        </div>
    )
}