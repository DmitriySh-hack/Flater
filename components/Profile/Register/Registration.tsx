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
        <div className='form-container'>

            <div className='form-name'>Регистрация</div>

            <div>
                <p>Имя:</p>
                <input 
                    style={{width:'350px', height:'20px', margin:'3px', borderRadius:'4px', border: 'none', paddingLeft:'5px'}}
                    placeholder="Имя"
                    onChange={e => setFirstName(e.target.value)}
                    value={firstName}
                />

                <p>Фамилия:</p>
                <input 
                    style={{width:'350px', height:'20px', margin:'3px', borderRadius:'4px', border: 'none', paddingLeft:'5px'}}
                    placeholder="Фамилия"
                    onChange={e => setLastName(e.target.value)}
                    value={lastName}
                />

                <p>Email:</p>
                <input 
                    style={{width:'350px', height:'20px', margin:'3px', borderRadius:'4px', border: 'none', paddingLeft:'5px'}}
                    placeholder="Email" 
                    onChange={e => setEmail(e.target.value)} 
                    value={email}
                />
                
                <p>Пароль:</p>
                <input 
                    style={{width:'350px', height:'20px', margin:'3px', borderRadius:'4px', border: 'none', paddingLeft:'5px'}}
                    placeholder="Пароль"
                    type='password'
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                />

                <button style={{padding:'3px', borderRadius:'6px', backgroundColor: '#f5912b', marginTop:'40px', cursor: 'pointer', fontSize:'14px'}} 
                onClick={() => {
                    store.registration(email, password, firstName, lastName);
                    navigator('/login')
                }}>Создать аккаунт</button>
            </div>

            


        </div>
    )
}