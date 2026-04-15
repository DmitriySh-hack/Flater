import { Context } from "../../src/main"
import { CRMEmployee } from '../CRMPageForEmployee/CRMEmployee'
import { useContext } from 'react';

export function MainCRMPage() {
  const { store } = useContext(Context)
  if(store.isEmployee){
    return <CRMEmployee/>
  }else{
    return (
      <div>
        <h2>Панель управления</h2>
        <p>Здесь будут диалоги с пользователями основного приложения.</p>
      </div>
    )
  }
  
}