import { Route, Routes } from "react-router-dom";
import { CRMAuth } from "../CRM/CRMAuth/CRMAuth"
import { MainCRMPage } from "../CRM/MainPage/MainCRMPage"
import { CRMLayout } from "../CRM/CRMLayout"

export function CRMRoute(){
    const isCRMPath = location.pathname.startsWith('/crmsys')
    if (isCRMPath) {
        return (
          <Routes>
            <Route path="/crmsys" element={<CRMLayout />} >
                <Route path="/crmsys/main" element={<MainCRMPage />}/>
                <Route path="/crmsys/auth" element={<CRMAuth />}/>
            </Route>
          </Routes>
        )
      }
}