import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from '../components/Home/HomePage'
import HeaderSide from '../components/Header/Header'
import { Profile } from '../components/Profile/Profile'
import Footer from '../components/Footer/Footer'
import { Advertisment } from '../components/CreateAd/Advertisment'
import { Login } from '../components/Profile/Login/Login'
import { Registration } from '../components/Profile/Register/Registration'
import Favorite from '../components/FavoritePage/Favorite'
import { useEffect } from 'react'
import './App.css'
import { FilterProvider } from '../components/Home/FilterContext/FilterContext'
import Booking from '../components/Booking/Booking'
import Messages from '../components/Message/Messages'

function App() {

  const location = useLocation()

  useEffect(() => {
    function scrollSetting() {
      const scroll = document.querySelector('.footer-container') as HTMLElement | null;
      if (scroll) {
        scroll.style.position = 'fixed';
        scroll.style.bottom = '0';
      }
    }

    const checkScroll = () => {
      const hasVerticalScroll = document.documentElement.scrollHeight > window.innerHeight;
      console.log('Вертикальный скролл:', hasVerticalScroll);

      if (!hasVerticalScroll) {
        scrollSetting();
      }
    };

    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
      // Сбрасываем стили при размонтировании
      const scroll = document.querySelector('.footer-container') as HTMLElement | null;
      if (scroll) {
        scroll.style.position = '';
        scroll.style.bottom = '';
      }
    };
  }, [location]);

  return (
    <div className="app-container">
      <HeaderSide />
      <main className="main-content">
        <Routes>
          <Route path="/home" element={
            <FilterProvider>
              <HomePage />
            </FilterProvider>
          } />
          <Route path='/profile' element={<Profile />} />
          <Route path='/advertisment' element={<Advertisment />} />
          <Route path='/login' element={<Login />} />
          <Route path='/registration' element={<Registration />} />
          <Route path='/favorite' element={<Favorite />} />
          <Route path='/booking' element={<Booking />} />
          <Route path='/message' element={<Messages />} />
          <Route path='/message/:id' element={<Messages />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App