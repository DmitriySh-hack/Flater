const AdvertismentModel = require('./advertisment-model.cjs');
const UserModel = require('../models/user-model.cjs');
const AdvertismentDTO = require('./advertisment-dto.cjs');
const ApiError = require('../exceptions/api-error.cjs');
const uuid = require('uuid');

class AdvertismentService{
    async createAdvertisment(userId, advertData){
        const { title, price, city, street, countOfRooms, images } = advertData;

        const id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
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
            
            // 1. Получаем все объявления
            const allAdvertisements = await AdvertismentModel.findAll();
            console.log('🔍 Service: Found', allAdvertisements.length, 'advertisements');
            
            if (!allAdvertisements || allAdvertisements.length === 0) {
                console.log('🔍 Service: No advertisements found');
                return [];
            }
            
            // 2. Получаем уникальные user_id из объявлений
            const userIds = [...new Set(allAdvertisements.map(ad => ad.user_id).filter(Boolean))];
            console.log('🔍 Service: Unique user IDs:', userIds);
            
            // 3. Получаем информацию о пользователях ИСПОЛЬЗУЯ СУЩЕСТВУЮЩИЙ UserModel
            let users = [];
            if (userIds.length > 0) {
                users = await UserModel.findByIds(userIds);
                console.log('🔍 Service: Found', users.length, 'users');
            }
            
            // 4. Создаем Map для быстрого доступа к пользователям по ID
            const usersMap = new Map();
            users.forEach(user => {
                usersMap.set(user.id, user);
            });
            
            // 5. Объединяем данные
            const mappedAds = allAdvertisements.map(advertisement => {
                console.log('🔍 Service: Mapping ad ID:', advertisement.id);
                
                // Создаем объект DTO
                const dto = new AdvertismentDTO(advertisement);
                
                // Добавляем информацию о пользователе если есть
                if (advertisement.user_id && usersMap.has(advertisement.user_id)) {
                    const user = usersMap.get(advertisement.user_id);
                    dto.user = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatar: user.avatarUrl, // Обратите внимание: у вас avatarUrl, а не avatar
                        phone: null // Если у вас есть телефон в users, добавьте его
                    };
                }
                
                return dto;
            });
            
            console.log('🔍 Service: Successfully mapped', mappedAds.length, 'ads');
            return mappedAds;
        } catch (error) {
            console.error('❌ Service Error in getAllAdvertisements:', error);
            throw error;
        }
    }

    async getAdvertismentWithUser(adId) {
        try {
            console.log('🔍 Service: Getting advertisement with user for ID:', adId);
            
            // 1. Получаем объявление
            const advertisement = await AdvertismentModel.findById(adId);
            
            if (!advertisement) {
                throw ApiError.BadRequest('Объявление не найдено');
            }
            
            // 2. Создаем DTO
            const dto = new AdvertismentDTO(advertisement);
            
            // 3. Если есть user_id, ищем пользователя ИСПОЛЬЗУЯ СУЩЕСТВУЮЩИЙ findById
            if (advertisement.user_id) {
                console.log('🔍 Service: Looking for user with ID:', advertisement.user_id);
                const user = await UserModel.findById(advertisement.user_id);
                
                if (user) {
                    console.log('✅ Service: Found user:', user.email);
                    dto.user = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatar: user.avatarUrl, // Обратите внимание: avatarUrl
                        phone: null // Если есть телефон в базе, добавьте его
                    };
                } else {
                    console.log('⚠️ Service: User not found for ID:', advertisement.user_id);
                }
            }
            
            return dto;
        } catch (error) {
            console.error('❌ Service Error in getAdvertismentWithUser:', error);
            throw error;
        }
    }


    async getAllCities(){
        const allAdvertisements = await AdvertismentModel.findAll();
        const cities = allAdvertisements
        .map(ad => ad.city)
        .filter(city => city && city.trim() !== "");

        const uniqueCities = [...new Set(cities)];

        return uniqueCities
    }
}

module.exports = new AdvertismentService();
