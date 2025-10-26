import './Avatar.css'
import React, { useContext, useState, useRef } from 'react';
import { Context } from '../../../src/main';



export const Avatar = () => {

    const {store} = useContext(Context)

    const [avatarPreview, setAvatarPreview] = useState<string | null>(store.user.avatarUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const handlerFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if(file && file.type.startsWith('image/')){
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }
    const handleCameraClick = () => {
        cameraInputRef.current?.click()
    }

    const getInitials = () => {
        const firstInitial = store.user.firstName?.slice(0,1)
        const lastInitial = store.user.lastName?.slice(0,1)
        return `${firstInitial}${lastInitial}`
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
                    <img src={avatarPreview} alt='Avatar' style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}/>
                ) : (
                    <div style={{fontSize: '50px', fontWeight: 'bold'}}>
                        {getInitials()}
                    </div>
                )}
            </div>
            <div>
                <button style={{cursor: 'pointer', marginRight: '5px'}} onClick={handleUploadClick}>Изменить фото</button>
                <button style={{cursor: 'pointer'}} onClick={handleCameraClick}>Сделать снимок</button>
            </div>
        </div>
    )
    
}