import { useContext, useState } from "react"
import { Context } from "../../src/main"
import { useNavigate } from "react-router-dom"
import "../CRM.css"

export function CRMAuth(){
    const [nickname, setNickname] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate()

    const { store } = useContext(Context)
    const handleLogin = async () => {
        setError(null)
        const res = await store.loginEmployee(nickname, password);
        if (res.ok) {
            navigate('/crmsys/main')
        } else {
            setError(res.message ?? 'Ошибка входа')
        }
    }
    return (
        <div className="crm-form-panel">
            <h2 className="crm-form-panel__title">Вход в CRM</h2>
            <p className="crm-form-panel__hint">Авторизация для сотрудников службы поддержки.</p>

            <label className="crm-form-panel__label">Логин</label>
            <input
                className="crm-form-panel__input"
                placeholder="Никнейм"
                autoComplete="username"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />

            <label className="crm-form-panel__label">Пароль</label>
            <input
                className="crm-form-panel__input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {error ? <p className="crm-form-panel__error">{error}</p> : null}

            <button type="button" className="crm-form-panel__submit" onClick={handleLogin}>
                Войти
            </button>
        </div>
    )
}