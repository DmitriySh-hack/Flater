import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Store from '../components/store/store'
import { createContext } from 'react'

interface State{
  store: Store
}

const store = new Store();
export const Context = createContext<State>({
  store,
})

createRoot(document.getElementById('root')!).render(
  <Context.Provider value={{store}}>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  </Context.Provider>
  
)
