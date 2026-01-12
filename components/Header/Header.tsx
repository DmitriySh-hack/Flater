import './Header.css'
import logo from './FlaterLogo.png'
import messageLogo from './chat.png'
import { useNavigate } from 'react-router-dom';

function HeaderSide() {
    
    const navigate = useNavigate()

    return (
        <div className="header_container">
            <div onClick={() => navigate('/home')}>
                <img src={logo} className='Logo' alt='Логотип'/>
            </div>
            
            <div className='active-part' style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <div className='message-element' style={{paddingRight: '30px'}} onClick={() => navigate('')}>
                    <img className='messageLogo' src={messageLogo}/>
                </div>   

                <ul className='interactive-header'>
                    <li onClick={() => navigate('/advertisment')}>Сдать жилье</li>
                    <li onClick={() => navigate('/booking')}>Бронирование</li>
                    <li onClick={() => navigate('/favorite')}>Избранное</li>
                    <li className='profile' onClick={() => navigate('/profile')}>
                        Личный кабинет
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default HeaderSide;