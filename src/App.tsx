import { Routes, Route } from 'react-router-dom'
import HomePage from '../components/Home/HomePage'
import HeaderSide from '../components/Header/Header'
import {Profile} from '../components/Profile/Profile'
import Footer from '../components/Footer/Footer'
import Advertisment from '../components/CreateAd/Advertisment'
import { Login } from '../components/Profile/Login/Login'

function App() {
  return (
    <>
      <HeaderSide />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/advertisment' element={<Advertisment/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      <Footer/>
    </>
  )
}

export default App