import { useState } from "react";
import { Modal } from "./Modal";
import './ChangePasswordModal.css'

export const ChangePasswordModal = ({
    isOpen,
    isClose,
    onChangePassword
}: {
    isOpen: boolean,
    isClose: () => void,
    onChangePassword: (oldPassword: string, newPassword: string) => void
}) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSumbit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        onChangePassword(formData.oldPassword, formData.newPassword);
        isClose();
    }

    return (
        <Modal isOpen={isOpen} isClose={isClose}>
            <div className="change-password-modal">
                <h2 className="change-password-modal-name">Смена пароля</h2>

                <hr></hr>

                <form className='change-password-modal-form' onSubmit={handleSumbit}>
                    <div className="change-password-modal-old-password">
                        <label>Старый пароль:</label>
                        <input
                            type="password"
                            value={formData.oldPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="change-password-modal-new-password">
                        <label>Новый пароль: </label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="change-password-modal-accept-password">
                        <label>Подтвердите пароль: </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="change-password-modal-btn-container">
                        <button className="change-password-modal-btn-change" type="submit">Сменить пароль</button>
                        <button className="change-password-modal-btn-cancel" type="button" onClick={isClose}>Отмена</button>
                    </div>
                </form>    
            </div>
        </Modal>
  );
};
