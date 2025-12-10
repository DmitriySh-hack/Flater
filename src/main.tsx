import { StrictMode, createContext } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Store from '../components/store/store'

interface State {
  store: Store
}

const store = new Store();
export const Context = createContext<State>({
  store,
})

declare global {
  interface Window {
    _reactRoot?: Root;
  }
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

// Создаем root только один раз
if (!window._reactRoot) {
  window._reactRoot = createRoot(container);
}

window._reactRoot.render(
  <Context.Provider value={{store}}>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </Context.Provider>
)