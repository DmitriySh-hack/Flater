import { observer } from "mobx-react-lite";
import './Booking.css'
import { Context } from '../../src/main';
import { useContext } from "react";

const Booking = observer(() => {
    const {store} = useContext(Context)

    return (
        <div className="main-container">
            <div className="name-container" style={{background: 'red'}}>
                <h1>NAME</h1>
            </div>
            <div className="workPlace-container">
                <div className="selectedAd-container" style={{background: 'green'}}>
                    Advertisements
                </div>
                <div className="costAd-container" style={{background: 'yellow'}}>
                    Cost of advertisement
                </div>
            </div>
        </div>
    )
})

export default Booking