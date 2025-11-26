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

    // Получение количества объявлений пользователя
    async getCounterOfAdvertisment(userId) {
        return await AdvertismentModel.countByUserId(userId)
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

        if (advertisement.user_id !== userId) {
            throw ApiError.BadRequest('Нет прав для удаления этого объявления');
        }

        await AdvertismentModel.deleteById(adId);
        return { success: true };
    }
}

module.exports = new AdvertismentService();