import { Modal } from '../../Profile/ModalPagePassword/Modal'


export const CreateAdvirtisment = ({
    isOpen,
    isClose,
    onCreate
} : {
    isOpen: boolean,
    isClose: () => void
    onCreate: () => void
}
) => {
    
    return (
            <Modal isOpen={isOpen} isClose={isClose}>
                <h2>Создание объявления</h2>

                <div>
                    <div>Наименование</div>
                    <input
                        style={{marginBottom: '30px'}}
                    />

                    <div style={{marginBottom: '30px'}}>Число комнат: {
                        <select>
                            <option value={1}>1</option>
                            <option value={1}>2</option>
                            <option value={1}>3</option>
                            <option value={1}>4</option>
                            <option value={1}>5</option>
                            <option value={1}>6</option>
                            <option value={1}>7</option>
                        </select>
                    }
                    </div>
                    

                    <div>Город:</div>
                    <input
                        style={{marginBottom: '30px'}}
                    />
                    
                    <div>Улица:</div>
                    <input
                        style={{marginBottom: '30px'}}
                    />
                </div>
                

                <button onClick={() => {
                    onCreate();
                    isClose();
                }}>Создать</button>
                <button onClick={() => {
                    isClose();
                }}>Отмена</button>
            </Modal>
    )
}