import './Avatar.css'
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Context } from '../../../src/main';



export const Avatar = () => {

    const {store} = useContext(Context)

    const [avatarPreview, setAvatarPreview] = useState<string | null>(store.user?.avatarUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    // Синхронизация аватарки с данными пользователя из store
    useEffect(() => {
        if (store.user?.avatarUrl) {
            // Если это относительный путь (локальный файл), добавляем базовый URL API
            const apiBaseUrl = 'http://localhost:5000';
            const avatarUrl = store.user.avatarUrl.startsWith('http') || store.user.avatarUrl.startsWith('data:')
                ? store.user.avatarUrl
                : `${apiBaseUrl}${store.user.avatarUrl}`;
            setAvatarPreview(avatarUrl);
        } else {
            setAvatarPreview(null);
        }
    }, [store.user?.avatarUrl]);

    const handlerFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if(file && file.type.startsWith('image/')){
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            }
            reader.readAsDataURL(file)

            // Отправляем файл на сервер
            try {
                setIsUploading(true);
                await store.uploadAvatar(file);
                // После успешной загрузки аватарка обновится через useEffect из store.user.avatarUrl
            } catch (error) {
                console.error('Ошибка при загрузке аватара:', error);
                // В случае ошибки возвращаем предыдущую аватарку
                setAvatarPreview(store.user?.avatarUrl || null);
                alert('Ошибка при загрузке аватара. Попробуйте снова.');
            } finally {
                setIsUploading(false);
                // Очищаем input, чтобы можно было загрузить тот же файл снова
                if (event.target) {
                    event.target.value = '';
                }
            }
        } else {
            alert('Пожалуйста, выберите изображение');
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }
    const handleCameraClick = () => {
        cameraInputRef.current?.click()
    }

    const getInitials = () => {
        const firstInitial = store.user?.firstName?.slice(0,1) || ''
        const lastInitial = store.user?.lastName?.slice(0,1) || ''
        return `${firstInitial}${lastInitial}` || 'U'
    }

    return (
        <div className='photo-container'>
            <input type="file"
            ref={fileInputRef}
            accept='image/*'
            style={{display: 'none'}}
            onChange={handlerFileSelected}
            />

            <input type="file"
            ref={cameraInputRef}
            accept='image/*'
            capture="user"
            style={{display: 'none'}}
            onChange={handlerFileSelected}
            />

            <div className='photo'>
                {avatarPreview ? (
                    <img 
                        src={avatarPreview} 
                        alt='Avatar' 
                        style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
                        onError={() => {
                            // Если изображение не загрузилось, показываем инициалы
                            setAvatarPreview(null);
                        }}
                    />
                ) : (
                    <div style={{fontSize: '50px', fontWeight: 'bold'}}>
                        {getInitials()}
                    </div>
                )}
            </div>
            <div>
                <button 
                    className='avatar-change-btn'
                    style={{cursor: isUploading ? 'not-allowed' : 'pointer', marginRight: '5px', opacity: isUploading ? 0.6 : 1}} 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                >
                    {isUploading ? 'Загрузка...' : 'Изменить фото'}
                </button>
                <button 
                    className='avatar-camera-btn'
                    style={{cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.6 : 1}} 
                    onClick={handleCameraClick}
                    disabled={isUploading}
                >
                    {isUploading ? 'Загрузка...' : 'Сделать снимок'}
                </button>
            </div>
        </div>
    )
    
}