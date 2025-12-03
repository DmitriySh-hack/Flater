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

    async getAdvertismentUser(userId){
        const advertismentUser = await AdvertismentModel.findByUserId(userId)
        return advertismentUser.map(ad => new AdvertismentDTO(ad));
    }

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

    async getAllAdvertisments(){
        try {
            console.log('🔍 Service: Getting all advertisements...');
            const allAdvertisements = await AdvertismentModel.findAll();
            console.log('🔍 Service: Found', allAdvertisements.length, 'advertisements');
            
            if (!allAdvertisements || allAdvertisements.length === 0) {
                console.log('🔍 Service: No advertisements found');
                return [];
            }
            
            const mappedAds = allAdvertisements.map(advertisement => {
                console.log('🔍 Service: Mapping ad ID:', advertisement.id);
                return new AdvertismentDTO(advertisement);
            });
            
            console.log('🔍 Service: Successfully mapped', mappedAds.length, 'ads');
            return mappedAds;
        } catch (error) {
            console.error('❌ Service Error in getAllAdvertisements:', error);
            throw error;
        }
    }
}

module.exports = new AdvertismentService();