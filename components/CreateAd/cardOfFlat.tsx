import { observer } from 'mobx-react-lite';
import { IADVERTISMENT } from "../models/IAdventisment";

interface CardOfFlatProps {
    advertisement: IADVERTISMENT
}

export const CardOfFlat = observer((props: CardOfFlatProps) => {
    const {advertisement} = props;
    const { title, price, city, street, countOfRooms, images } = advertisement

    return (
        <div>
            <div>
                <div className="flat-card__image">
                {images && images.length > 0 ? (
                    <img src={images[0]} alt={title} />
                ) : (
                    <div className="flat-card__no-image">Фото</div>
                )}
                </div>
            </div>

            <div>
                <h3>{title}</h3>
                <p>{price.toLocaleString('ru-RU')} ₽</p>
            </div>

            <div>
                <span>Комнат: {countOfRooms}</span>
                <span>Адрес: {city}, {street}</span>
            </div>

            <div>
                <button>Редактировать</button>
                <button>Удалить</button>
            </div>
        </div>
    )
})