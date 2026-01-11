import './Footer.css'
import logo from '../Header/FlaterLogo.png' 
import { useNavigate } from 'react-router-dom';

function Footer(){

    const navigate = useNavigate()

    return (
        <div className="footer-container">
            <div onClick={() => navigate('/home')}>
                <img src={logo} className='Logo' alt='Логотип'/>
            </div>
            <div className='company-info'>
                <div>Контакты: flatercompanymain@gmail.com</div>
                <div>Служба поддержки: flaterCSup@gmail.com</div>
            </div>
        </div>
    )
}

export default Footer;