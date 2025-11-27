const AdvertismentModel = require('./advertisment-model.cjs');
const AdvertismentDTO = require('./advertisment-dto.cjs');
const ApiError = require('../exceptions/api-error.cjs');
const uuid = require('uuid');

class AdvertismentService{
    async createAdvertisment(userId, advertData){
        const { title, price, city, street, countOfRooms, images } = advertData;

        const id = uuid.v4();
        const newAdvertisment = await AdvertismentModel.create({
            id,
            userId,
            title,
            city,
            street,
            countOfRooms: parseInt(countOfRooms),
            price: parseFloat(price),
            images: images || [],
        })

        return new AdvertismentDTO(newAdvertisment)
    }

    // Получение объявлений пользователя
    async getAdvertismentUser(userId){
        const advertismentUser = await AdvertismentModel.findByUserId(userId)
        return advertismentUser.map(ad => new AdvertismentDTO(ad));
    }

    // Обновление объявления

    async getUpdateForAdvertisment(userId, adId, addUpdate) {
        const advertismentUser = await AdvertismentModel.findById(adId);

        if(!advertismentUser) { 
            throw ApiError.BadRequest();
        }
        if(advertismentUser.user_id !== userId){
            throw ApiError.BadRequest();
        }
        
        const updateAd = await AdvertismentModel.findByIdAndUpdate(adId, addUpdate)
        return new AdvertismentDTO(updateAd)
    }

    // Удаление объявления
    async deleteAdvertisment(userId, adId){
        const advertisement = await AdvertismentModel.findById(adId);
        
        if (!advertisement) {
            throw ApiError.BadRequest('Объявление не найдено');
        }

        if (advertisement.user_id.toString() !== userId.toString()) {
            throw ApiError.BadRequest('Нет прав для удаления этого объявления');
        }

        const result = await AdvertismentModel.deleteById(adId);
        
        if (result.deleteCount === 0) {
            throw ApiError.BadRequest('Объявление не было удалено');
        }

        return { success: true, message: 'Объявление успешно удалено' };
    }
}

module.exports = new AdvertismentService();