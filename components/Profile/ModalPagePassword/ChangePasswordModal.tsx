import { useState } from "react";
import { Modal } from "./Modal";

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
        <h2>Смена пароля</h2>
        <form onSubmit={handleSumbit}>
            <div className="form-group">
            <label>Старый пароль:</label>
            <input
                type="password"
                value={formData.oldPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                required
            />
            </div>
            <div className="form-group">
            <label>Новый пароль:</label>
            <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
            />
            </div>
            <div className="form-group">
            <label>Подтвердите пароль:</label>
            <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
            />
            </div>
            <div className="modal-actions">
            <button type="submit">Сменить пароль</button>
            <button type="button" onClick={isClose}>Отмена</button>
            </div>
        </form>
        </Modal>
  );
};
