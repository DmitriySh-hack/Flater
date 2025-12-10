import { useEffect, useState, useRef } from 'react';
import { Modal } from '../../Profile/ModalPagePassword/Modal'
import type {AdvertisementData} from './AdvertisementData'
import './Modal.css'

export const CreateAdvirtisment = ({
    isOpen,
    isClose,
    onCreate
} : {
    isOpen: boolean,
    isClose: () => void,
    onCreate: (adData: AdvertisementData & { images?: File[] }) => void
}) => {
    const [formData, setFormData] = useState({
        title: '',
        price: null,
        city: '',
        street: '',
        countOfRooms: 1
    })
    const [selectedImg, setSelectedImg] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: keyof AdvertisementData, value: string | number ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleCreate = () => {
        if(!formData.title || !formData.city || !formData.street || formData.price === null || formData.price <= 0){
            alert('Заполните все обязательные поля')
            return
        }

        onCreate({...formData, images: selectedImg.length > 0 ? selectedImg : undefined});
    }

    const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if(selectedImg.length + files.length > 10){
            alert('Фотографий много')
            console.log("Фотографий много")
        }

        const newFiles = Array.from(files);
        const validFiles = newFiles.filter(file => {
            if(!file.type.startsWith('image/')){
                alert(`Файл "${file.name}" не является изображением`)
                console.log('Файл не изображение')
                return false;
            }

            if(file.size > 5*1024*1024){
                alert(`Размер файла ${file.name} привышает 5MB`)
                console.log("Слишком тяжёлый файл")
                return false;
            }
            return true;
        });

        if(validFiles.length === 0) return

        //Добавление файлов
        const newImg = [...selectedImg, ...validFiles]
        setSelectedImg(newImg)

        //Создание привью
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreviews(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file);
        })
    }

    const handleRemoveImage = (index: number) => {
        setSelectedImg(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            price: null,
            city: '',
            street: '',
            countOfRooms: 1
        })

        setSelectedImg([])
        setImagePreviews([])
    }

    useEffect(() => {
        if(isOpen){
            resetForm()
        }
    }, [isOpen])

    return (
            <Modal isOpen={isOpen} isClose={isClose}>
                <h2>Создание объявления</h2>

                <div>
                    <div>Наименование</div>
                    <input
                        style={{marginBottom: '30px'}}
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Введите название"
                    />

                    <div style={{marginBottom: '30px'}}>Число комнат: {
                        <select
                        value={formData.countOfRooms}
                        onChange={(e) => handleInputChange('countOfRooms', parseInt(e.target.value))}
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                        </select>
                    }
                    </div>
                    

                    <div>Город:</div>
                    <input
                        style={{marginBottom: '30px'}}
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Введите город"
                    />
                    
                    <div>Улица:</div>
                    <input
                        style={{marginBottom: '30px'}}
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder='Введите улицу'
                    />

                    <div>Цена:</div>
                    <input
                        type='number'
                        style={{marginBottom: '30px'}}
                        value={formData.price ?? ''}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        placeholder='Цена'
                    />
                </div>

                <div className='photo-section'>
                    <h1>Фотографии объявления</h1>

                    <button
                        onClick={openFileDialog}
                    >
                        Выбрать фотографии
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelected}
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>

                {imagePreviews.length > 0 && (
                    <div>
                        <h4>Выбранные фотографии</h4>

                        <div>
                            {imagePreviews.map((preview, index) => (
                                    <div key={index} className="preview-item">
                                        <div className="preview-image-wrapper">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="preview-image"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="remove-image-btn"
                                                title="Удалить"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                

                <button onClick={handleCreate}>Создать</button>
                <button onClick={isClose}>Отмена</button>
            </Modal>
    )
}