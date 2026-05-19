import { useContext, useEffect, useState } from "react";
import { Context } from '../../src/main';
import { observer } from 'mobx-react-lite';

export const CRMEmployee = observer(() => {
    const {store} = useContext(Context);

    const [selectedPosition, setSelectedPosition] = useState('');

    const [newEmployeeName, setNewEmployeeName] = useState('');
    const [newEmployeeNickname, setNewEmployeeNickname] = useState('');
    const [newEmployeePassword, setNewEmployeePassword] = useState('');
    const [ passwordGet, setPasswordGet ] = useState(false);
    const [ createNewAccount, setCreateNewAccount ] = useState(false);

    const [passwordGetName, setPasswordGetName] = useState('')
    const [passwordNewValue, setPasswordNewValue] = useState('')
    const [passwordStatus, setPasswordStatus] = useState<string | null>(null)

    const handlePositionChange = (value: string) => {
        setSelectedPosition(value);
    };
    const handleRegAccount = (nickname: string, password: string, position: string, name: string) => {
        store.registrationEmployee(nickname, password, position, name);
    }

    const handleGetPasswordEmployee = async (nickname: string, newPassword: string) => {
        setPasswordStatus(null);
        const response = await store.changeEmployeePassword(nickname, newPassword);
        if (response.ok) {
            setPasswordStatus('Пароль сотрудника успешно обновлён');
            setPasswordGetName('');
            setPasswordNewValue('');
            return;
        }

        setPasswordStatus(response.message ?? 'Не удалось обновить пароль');
    }

    const handleChangePasswordAccount = () => {
        if(passwordGet === false){
            setPasswordGet(true);
            setCreateNewAccount(false);
        }  else{
            setPasswordGet(false);
        }
    }
    const handleCreateAccount = () => {
        if(createNewAccount === false){
            setCreateNewAccount(true);
            setPasswordGet(false);
        }  else{
            setCreateNewAccount(false);
        }
    }

    useEffect(() => {
        store.fetchEmployeePositions();
    },[store]);

    useEffect(() => {
        setSelectedPosition(store.employee.position || '')
    }, [store.employee.position])

    useEffect(() => {
        void store.fetchAllEmployees();
    }, [store])

    if( store.employee.position === 'super-admin'){
        return (
            <>
                <div>
                    <div>
                        <div>
                            Hello, {store.employee.name}
                        </div>
                        <div>
                            position: <span style={{fontWeight: 'bold'}}>{store.employee.position}</span>
                        </div>
                    </div>

                    <button onClick={handleCreateAccount}>Create account</button>
                    <button onClick={handleChangePasswordAccount}>Change employee password</button>
                    { createNewAccount && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <div>Create a manager account:</div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <input placeholder="Введите имя работника..." value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)}></input>
                                <input placeholder="Введите nickname работника..." value={newEmployeeNickname} onChange={e => setNewEmployeeNickname(e.target.value)}></input>
                                <input placeholder="Введите пароль работника..." value={newEmployeePassword} onChange={e => setNewEmployeePassword(e.target.value)}></input>   
                                <div>
                                    <select
                                        value={selectedPosition}
                                        onChange={(e) => handlePositionChange(e.target.value)}
                                    >
                                        {store.employeePositions.map((position) => (
                                            <option key={position} value={position}>
                                                {position}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                            </div>
                            <button onClick={() => handleRegAccount(newEmployeeNickname, newEmployeePassword, selectedPosition, newEmployeeName)}>Confirm</button>
                        </div>
                    )}
                    { passwordGet && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: "5px"}}>
                            <div>Let's change a password</div>
                            <input placeholder="Введите nickname менеджера..." value={passwordGetName} onChange={e => setPasswordGetName(e.target.value)}></input>
                            <input placeholder="Введите новый пароль..." value={passwordNewValue} onChange={e => setPasswordNewValue(e.target.value)}></input>
                            <button onClick={() => handleGetPasswordEmployee(passwordGetName, passwordNewValue)}>Сменить пароль работника</button>
                            {passwordStatus ? <p>{passwordStatus}</p> : null}
                        </div>
                    )}
                </div>
                <div>
                    {store.employees.map((emp) => (
                        <div key={emp.id}>
                            {emp.name} ({emp.nickname}) - {emp.position}
                        </div>
                    ))}
                </div>
            </>
        )
    }else if(store.employee.position === 'manager'){
        return (
            <>Hello Manager</>
        )
    }else if(store.employee.position === 'support'){
        return(
            <>Hello Support</>
        )
    }

    return null;
})