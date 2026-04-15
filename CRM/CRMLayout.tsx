import { Outlet, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Context } from '../src/main'
import './CRM.css'

export const CRMLayout = observer(function CRMLayout() {
  const navigate = useNavigate()
  const { store } = useContext(Context)

  const handleLogoutEmployee = () => {
    store.logoutEmployee()
    navigate('/crmsys/auth')
  }

  return (
    <div className="crm-platform">
      <header className="crm-platform__header">
        <span className="crm-platform__header-title" style={{cursor: 'pointer'}} onClick={() => navigate('/crmsys/main')}>CRM — Служба поддержки</span>
        <div style={{display: 'flex', flexDirection: 'row', gap: "25px", alignItems: 'center'}}>
          {store.isEmployee ? (
            <button type="button" style={{cursor: 'pointer'}} onClick={handleLogoutEmployee}>Выйти</button>
          ) : (
            <button type="button" style={{cursor: 'pointer'}} onClick={() => navigate('/crmsys/auth')}>Вход</button>
          )}
          <nav className="crm-platform__header-nav">
            <span
              className="crm-platform__header-link crm-platform__header-link--back"
              onClick={() => navigate('/home')}
            >
              ← К основному приложению
            </span>
          </nav>
        </div>
      </header>
      <main className="crm-platform__content">
        <Outlet />
      </main>
    </div>
  )
})
