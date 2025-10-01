import { useContext, useEffect } from 'react';
import { Context } from '../../src/main';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

export const Profile = observer(() => {

    const navigate = useNavigate()
    
    const {store} = useContext(Context)

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth()
        }
    }, [])

    if(!store.isAuth){
        return (
            <div>
                No authorizetion!
                <button onClick={() => navigate('/login')}>Войти</button>
            </div>
        )
    }

    if(store.isAuth){
        return (
            <div>
                Authorizetion!
            </div>
        )
    }

    return (
        <div>
            Profile Page
        </div>
    )
});
